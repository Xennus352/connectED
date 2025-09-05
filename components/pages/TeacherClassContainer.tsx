"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTeachersList } from "@/hooks/useTeachersList";
import { useSubjectsList } from "@/hooks/useSubjectsList";
import { Profile, Subject } from "@/types/types";
import Image from "next/image";

interface Class {
  id: string;
  name: string;
  school_id: string;
}

const TeacherClassContainer = () => {
  const supabase = createClient();
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [draggedSubject, setDraggedSubject] = useState<any>(null);

  const [assignments, setAssignments] = useState<
    {
      teacherId: string;
      subjectId: string;
      className: string;
      subjectName: string;
      classId: string;
    }[]
  >([]);

  const teachersList: Profile[] = useTeachersList();
  const subjectList: Subject[] = useSubjectsList();

  // Sync hooks into state
  useEffect(() => {
    setTeachers(teachersList);
    setSubjects(subjectList);
  }, [teachersList, subjectList]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase.from("classes").select("*");
      if (error) console.error("Fetch classes error:", error);
      else setClasses(data || []);
    };
    fetchClasses();
  }, [supabase]);

  // Fetch existing assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      const { data, error } = await supabase.from("teacher_classes").select(`
          teacher_id,
          subject_id,
          class_id,
          classes:class_id (name),
          subjects:subject_id (name)
        `);
      if (error) return console.error("Fetch assignments error:", error);

      const mapped = data.map((row: any) => ({
        teacherId: row.teacher_id,
        subjectId: row.subject_id,
        classId: row.class_id,
        className: row.classes?.name || "",
        subjectName: row.subjects?.name || "",
      }));
      setAssignments(mapped);
    };
    fetchAssignments();
  }, [supabase]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("teacher_classes_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teacher_classes" },
        async (payload: any) => {
          switch (payload.eventType) {
            case "INSERT":
              const { data: newData } = await supabase
                .from("teacher_classes")
                .select(
                  `
                  teacher_id,
                  subject_id,
                  class_id,
                  classes:class_id (name),
                  subjects:subject_id (name)
                `
                )
                .eq("teacher_id", payload.new.teacher_id)
                .eq("subject_id", payload.new.subject_id)
                .eq("class_id", payload.new.class_id)
                .single();
              if (newData) {
                setAssignments((prev) => [
                  ...prev,
                  {
                    teacherId: newData.teacher_id,
                    subjectId: newData.subject_id,
                    classId: newData.class_id,
                    className: newData.classes?.name || "",////Type error that works well don't worry
                    subjectName: newData.subjects?.name || "",////Type error that works well don't worry
                  },
                ]);
              }
              break;

            case "DELETE":
              setAssignments((prev) =>
                prev.filter(
                  (a) =>
                    !(
                      a.teacherId === payload.old.teacher_id &&
                      a.subjectId === payload.old.subject_id &&
                      a.classId === payload.old.class_id
                    )
                )
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Handle drop on teacher
  const handleDrop = async (teacherId: string) => {
    if (!draggedSubject) return;

    if (
      assignments.find(
        (a) => a.teacherId === teacherId && a.subjectId === draggedSubject.id
      )
    ) {
      setDraggedSubject(null);
      return;
    }

    // Map grade_level → class_id
    const classObj = classes.find((c) => c.name === draggedSubject.grade_level);
    if (!classObj) {
      console.error("Class not found for subject", draggedSubject.name);
      setDraggedSubject(null);
      return;
    }

    const { error } = await supabase.from("teacher_classes").insert([
      {
        teacher_id: teacherId,
        class_id: classObj.id,
        subject_id: draggedSubject.id,
      },
    ]);
    if (error) console.error("Insert error:", error);
    setDraggedSubject(null);
  };

  // Handle drop on trash
  const handleTrashDrop = async () => {
    if (!draggedSubject) return;

    const { error } = await supabase
      .from("teacher_classes")
      .delete()
      .match({
        teacher_id: draggedSubject.teacherId,
        subject_id: draggedSubject.subjectId || draggedSubject.id,
        class_id: draggedSubject.classId,
      });
    if (error) console.error("Delete error:", error);
    setDraggedSubject(null);
  };

  // Group subjects by class for display
  const subjectsByClass = subjects.reduce((acc: any, subj) => {
    const className = subj.grade_level || "Uncategorized";
    if (!acc[className]) acc[className] = [];
    acc[className].push(subj);
    return acc;
  }, {});

  // UI remains the same
  return (
    <div className="flex gap-6 p-6 relative">
      {/* Teachers Column */}
      <div className="w-1/2">
        <h2 className="text-xl font-bold mb-4">Teachers</h2>
        <div className="space-y-4 h-[calc(100vh-200px)] overflow-y-auto">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="p-4 border rounded-lg bg-slate-800 hover:bg-slate-900 cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(teacher.id)}
            >
              <div className=" flex gap-2 items-center justify-around">
                <div>
                  <h3 className="font-semibold">{teacher.full_name}</h3>
                  <p className="text-sm text-gray-400">
                    Phone Number: {teacher.phone}
                  </p>
                </div>
                <div className="avatar">
                  <div className="w-20 rounded-full">
                    <Image
                      width={200}
                      height={200}
                      alt={teacher.full_name}
                      src={teacher.avatar_url || "/default-avatar.png"}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {assignments
                  .filter((a) => a.teacherId === teacher.id)
                  .map((a) => (
                    <span
                      key={a.subjectId}
                      draggable
                      onDragStart={() => setDraggedSubject(a)}
                      className="px-2 py-1 text-sm bg-blue-600 rounded-full cursor-grab"
                    >
                      {a.className}: {a.subjectName}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subjects Column */}
      <div className="w-1/2">
        <h2 className="text-xl font-bold mb-4">Subjects by Class</h2>
        {Object.entries(subjectsByClass).map(
          ([className, classSubjects]: any) => (
            <div key={className} className="mb-4">
              <h3 className="font-semibold mb-2">{className}</h3>
              <div className="flex flex-wrap gap-2">
                {classSubjects.map((subj: any) => (
                  <div
                    key={subj.id}
                    className="px-3 py-2 border rounded-lg bg-slate-800 hover:bg-slate-900 cursor-grab"
                    draggable
                    onDragStart={() => setDraggedSubject(subj)}
                  >
                    {subj.name}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Trash Area */}
      <div
        onDrop={handleTrashDrop}
        onDragOver={(e) => e.preventDefault()}
        className="fixed bottom-4 right-4 w-48 p-4 border-2 border-dashed border-red-400 text-center text-red-500 rounded-lg bg-red-100 z-50"
      >
        🗑️ Drag here to remove
      </div>
    </div>
  );
};

export default TeacherClassContainer;

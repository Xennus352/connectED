import { NextResponse } from "next/server";
import {
  getParentProfile,
  getChildrenOfParent,
  getLatestStudentLocation,
  getCurrentUserProfileServer,
} from "@/utils/supabase/helpers";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  const user = await getCurrentUserProfileServer();

  if (!user) {
    return NextResponse.json({
      reply: "🔒 Please log in to view school information.",
    });
  }

  const { messages } = await req.json();
  const lastMessage =
    messages[messages.length - 1]?.content?.toLowerCase() || "";
  const isBurmese = /[\u1000-\u109F]/.test(lastMessage);

  const supabase = await createClient();

  // ------------------------------
  //Detect teacher queries
  // ------------------------------
  const isTeacherQuery =
    /(teacher|class teacher|who teaches|who is the teacher)/i.test(
      lastMessage
    ) || /ဆရာ|ဆရာမ|သင်တဲ့/i.test(lastMessage);

  // ------------------------------
  // Detect location queries
  // ------------------------------
  const isLocationQuery =
    /(where|bus|location|live|map|track)/i.test(lastMessage) ||
    (/(ဘယ်မှာ|ဘယ်နေရာ|နေရာ|ရောက်)/i.test(lastMessage) &&
      !/ဆရာ|ဆရာမ|teacher/i.test(lastMessage));

  // ------------------------------
  // Detect homework/assignment queries
  // ------------------------------
  const isHomeworkQuery =
    /(assignment|homework|task|work)/i.test(lastMessage) ||
    /(အိမ်စာ|စာမေးပေး)/i.test(lastMessage);

  // ------------------------------
  //Handle teacher or homework queries
  // ------------------------------
  if (isTeacherQuery || isHomeworkQuery) {
    // Detect class name from message
    const classMatch =
      lastMessage.match(/grade\s?(\d+)\s*\(?([a-z])?\)?/i) || // Grade 8A
      lastMessage.match(/(\d+)\s*တန်း\s*([A-Za-z])?/) || // 8 တန်းA
      lastMessage.match(/(\d+)\s*([A-Za-z])?\s*တန်း/) || // 8A တန်း
      lastMessage.match(/(\d+)([A-Za-z])/i); // 8A or 9B

    if (!classMatch) {
      return NextResponse.json({
        reply: isBurmese
          ? "🧐 ဘယ်တန်းနဲ့ဆိုတာပြောပါနော်။ (ဥပမာ - 8 တန်းA)"
          : "🧐 Please specify which class (e.g., Grade 8A).",
      });
    }

    const gradeNumber = classMatch[1];
    const section = classMatch[2]?.toUpperCase() || "";
    const className = section
      ? `Grade${gradeNumber}(${section})`
      : `Grade${gradeNumber}`;

    // Get class info
    const { data: classData } = await supabase
      .from("classes")
      .select("id, name, academic_year, head_teacher_id")
      .ilike("name", `%${className}%`)
      .maybeSingle();

    if (!classData) {
      return NextResponse.json({
        reply: isBurmese
          ? `😔 ${className} ဆိုတဲ့အတန်းကို မတွေ့ပါ။`
          : `😔 Sorry, I couldn’t find a class named ${className}.`,
      });
    }

    // ------------------------------
    // Teacher query
    // ------------------------------
    if (isTeacherQuery) {
      const { data: teacher } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, phone")
        .eq("id", classData.head_teacher_id)
        .maybeSingle();

      if (!teacher) {
        return NextResponse.json({
          reply: isBurmese
            ? `😔 ${classData.name} အတွက်ဆရာမကို မတွေ့ပါ။`
            : `😔 Sorry, I couldn’t find the class teacher for ${classData.name}.`,
        });
      }

      const reply = isBurmese
        ? `👩‍🏫 ${classData.name} သင်တန်းရဲ့အကြီးဆရာမက ${teacher.full_name} ဖြစ်ပါတယ်။`
        : `👩‍🏫 The class teacher of ${classData.name} is ${teacher.full_name}.`;

      return NextResponse.json({ reply });
    }

    // ------------------------------
    // Homework query
    // ------------------------------
    if (isHomeworkQuery) {
      const today = new Date().toISOString().split("T")[0];

      const { data: homeworks } = await supabase
        .from("homeworks")
        .select("title, description, due_date, assigned_by")
        .eq("class_id", classData.id)
        .gte("due_date", today)
        .order("due_date", { ascending: true });

      if (!homeworks?.length) {
        return NextResponse.json({
          reply: isBurmese
            ? `📚 ဒီနေ့အတွက် ${classData.name} အတန်းမှာ အိမ်စာမရှိပါ။`
            : `📚 There is no homework for ${classData.name} today.`,
        });
      }

      const replyLines = homeworks.map((hw) =>
        isBurmese
          ? `📌 ${hw.title}\n📝 ${hw.description}\n🗓 တိတိမကျမီ: ${hw.due_date}`
          : `📌 ${hw.title}\n📝 ${hw.description}\n🗓 Due: ${hw.due_date}`
      );

      return NextResponse.json({ reply: replyLines.join("\n\n") });
    }
  }

  // ------------------------------
  //Location query (uses parent/child)
  // ------------------------------
  if (isLocationQuery) {
    try {
      const currentParentId = user?.user?.id as string;
      const { data: parent } = await getParentProfile(currentParentId);
      if (!parent) {
        return NextResponse.json({
          reply:
            "❌ You are not registered as a parent. Only parents can view child locations.",
        });
      }

      const { data: students } = await getChildrenOfParent(parent.id);
      if (!students?.length) {
        return NextResponse.json({
          reply:
            "😔 You have no children linked to your account. Access denied.",
        });
      }

      const student = students[0];
      const { data: location } = await getLatestStudentLocation(student.id);

      if (!location) {
        return NextResponse.json({
          reply: `😔 Sorry, I couldn’t find ${student.full_name}'s location right now.`,
        });
      }

      const { latitude, longitude, address, created_at } = location;

      const reply = isBurmese
        ? `🚌 သင့်ကလေး ${student.full_name} ရဲ့လက်ရှိတည်နေရာ:\n📍 ${
            address || "မသိရပါ"
          }\n🕒 ${new Date(created_at).toLocaleTimeString("my-MM", {
            hour: "2-digit",
            minute: "2-digit",
          })}\n🗺️ မြေပုံကြည့်ရန်: https://www.google.com/maps?q=${latitude},${longitude}`
        : `🚌 Your child ${student.full_name} was last seen here:\n📍 ${
            address || "Unknown"
          }\n🕒 ${new Date(created_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}\n🗺️ View on map: https://www.google.com/maps?q=${latitude},${longitude}`;

      return NextResponse.json({ reply });
    } catch (err) {
      console.error("Error fetching student location:", err);
      return NextResponse.json({
        reply:
          "⚠️ Couldn’t retrieve your child’s location. Please try again later.",
      });
    }
  }

  // ------------------------------
  //Default AI fallback
  // ------------------------------
  const systemPrompt = {
    role: "system",
    content: `
You are the official AI assistant of Connect Ed — a school communication and management app.
Connect Ed connects Students, Parents, Teachers, Drivers, and Admins in one platform.

App Features:
- 🧩 Assignments
- 📅 Events
- 💬 Chatting
- 📍 Live Location
- 🏫 Roles for Students, Teachers, Parents, Drivers, Admins

Your job:
- Be helpful, friendly, and clear.
- If user asks off-topic questions (e.g. superheroes, weather), reply:
  "I’m your Connect Ed assistant — I can help you with school communication, assignments, or app features!".`,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const body = {
      model: "openai/gpt-4o-mini",
      messages: [systemPrompt, ...messages],
    };

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "⚠️ Sorry, I couldn’t respond right now.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("AI request failed:", err);
    return NextResponse.json({
      reply: "⚠️ Connection to AI server was interrupted. Please try again.",
    });
  }
}

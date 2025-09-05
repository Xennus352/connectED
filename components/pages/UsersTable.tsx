"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface UsersTableProps {
  selectedFilter: string;
  searchTerm: string;
}

const UsersTable: React.FC<UsersTableProps> = ({
  selectedFilter,
  searchTerm,
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6); // show 6 users per page

  const supabase = createClient();

  const fetchUsers = async () => {
    let query = supabase.from("profiles").select("*");
    // Only filter if selectedFilter is not "All" or empty
    if (selectedFilter && selectedFilter.toLowerCase() !== "all") {
      query = query.eq("role", selectedFilter.toLowerCase());
    }
    const { data, error } = await query;
    if (error) console.error(error);
    else setUsers(data || []);
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedFilter]);

  // Delete user
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) console.error(error);
    else setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Filter by search term
  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="overflow-x-auto">
      <table className="table table-pin-rows">
        <thead>
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>Username</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map((user, index) => (
              <tr key={user.id}>
                <td>{indexOfFirstUser + index + 1}</td>
                <td>{user.full_name}</td>
                <td>{user.username}</td>
                <td>{user.phone}</td>
                <td>{user.role}</td>
                <td className="flex gap-2">
                  <button
                    className="btn btn-sm btn-outline rounded-lg btn-warning"
                    onClick={() => setEditingUser(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline rounded-lg btn-error"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* pagination  */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="btn btn-sm btn-outline  btn-primary rounded-lg"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="btn btn-sm btn-outline  btn-primary rounded-lg"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <dialog
          id="edit_user_modal"
          className="modal modal-bottom sm:modal-middle"
          open
        >
          <form
            className="modal-box"
            onSubmit={async (e) => {
              e.preventDefault();
              const fullName = (
                document.getElementById("edit_fullname") as HTMLInputElement
              ).value;
              const username = (
                document.getElementById("edit_username") as HTMLInputElement
              ).value;
              const phone = (
                document.getElementById("edit_phone") as HTMLInputElement
              ).value;
              const role = (
                document.getElementById("edit_role") as HTMLSelectElement
              ).value;

              const { error } = await supabase
                .from("profiles")
                .update({ full_name: fullName, username, phone, role })
                .eq("id", editingUser.id);

              if (error) console.error(error);
              else {
                setUsers((prev) =>
                  prev.map((u) =>
                    u.id === editingUser.id
                      ? { ...u, full_name: fullName, username, phone, role }
                      : u
                  )
                );
              }

              setEditingUser(null);
            }}
          >
            <h3 className="font-bold text-lg mb-2">Edit User</h3>
            <input
              id="edit_fullname"
              defaultValue={editingUser.full_name}
              className="input input-bordered w-full mb-2"
              required
            />
            <input
              id="edit_username"
              defaultValue={editingUser.username}
              className="input input-bordered w-full mb-2"
              required
            />
            <input
              id="edit_phone"
              defaultValue={editingUser.phone}
              className="input input-bordered w-full mb-2"
              required
            />
            <select
              id="edit_role"
              defaultValue={editingUser.role}
              className="select select-bordered w-full mb-4"
              required
            >
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
              <option value="student">Student</option>
              <option value="driver">Driver</option>
            </select>
            <div className="modal-action">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default UsersTable;

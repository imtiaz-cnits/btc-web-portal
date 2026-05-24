"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateUserRole, resetUserPassword, deleteUserAccount } from "@/app/actions/auth";
import { 
  Shield, 
  ShieldAlert, 
  User, 
  Check, 
  Loader2, 
  Key, 
  Trash2, 
  Lock, 
  Search, 
  UserX,
  AlertTriangle,
  ChevronDown
} from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  image?: string | null;
}

export default function RolesClient({ initialUsers }: { initialUsers: UserItem[] }) {
  const { data: session } = useSession();
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [users, setUsers] = useState(usersListSorter(initialUsers));
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeDropdownUserId, setActiveDropdownUserId] = useState<string | null>(null);
  const currentUserRole = (session?.user as any)?.role || "USER";
  const isCurrentUserAdmin = currentUserRole === "ADMIN";

  useEffect(() => {
    const handleAvatarUpdate = () => {
      const userId = (session?.user as any)?.id;
      if (userId) {
        setLocalAvatar(localStorage.getItem(`btc_avatar_${userId}`));
      }
    };
    handleAvatarUpdate();
    window.addEventListener("avatarChanged", handleAvatarUpdate);
    return () => window.removeEventListener("avatarChanged", handleAvatarUpdate);
  }, [session]);
  
  // Modal state for delete confirmation
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserItem | null>(null);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    const handleClose = () => setActiveDropdownUserId(null);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  // Helper to sort users: Admins first, then alphabetically
  function usersListSorter(list: UserItem[]) {
    return [...list].sort((a, b) => {
      if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
      if (a.role !== "ADMIN" && b.role === "ADMIN") return 1;
      return (a.name || a.email).localeCompare(b.name || b.email);
    });
  }

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "USER") => {
    const target = users.find(u => u.id === userId);
    if (target?.role === "ADMIN") {
      showToast("error", "Admin accounts are protected from changes!");
      return;
    }

    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          usersListSorter(prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
        );
        showToast("success", res.message);
      } else {
        showToast("error", res.message || "Failed to update role");
      }
    });
  };

  const handleResetPassword = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target?.role === "ADMIN") {
      showToast("error", "Admin passwords are protected from external reset!");
      return;
    }

    if (!confirm(`Are you sure you want to reset the password for ${target?.name || target?.email} to default '12345678'?`)) {
      return;
    }

    startTransition(async () => {
      const res = await resetUserPassword(userId);
      if (res.success) {
        showToast("success", res.message);
      } else {
        showToast("error", res.message || "Failed to reset password");
      }
    });
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    const userId = deleteConfirmUser.id;

    startTransition(async () => {
      const res = await deleteUserAccount(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showToast("success", res.message);
        setDeleteConfirmUser(null);
      } else {
        showToast("error", res.message || "Failed to delete account");
      }
    });
  };

  // Client-side filtering based on global search in layout header
  const filteredUsers = users.filter((u) => 
    (u.name && u.name.toLowerCase().includes(searchQuery)) ||
    u.email.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold transition-all z-50 text-white flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-600 animate-slide-in" : "bg-red-600 animate-slide-in"
        }`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      {/* Header Widget */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[var(--primary-color)]" /> User Roles & Privileges
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system administrators, promote users, reset passwords, or revoke access credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {searchQuery && (
            <span className="text-xs bg-green-50 border border-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold">
              🔍 Filtered: {filteredUsers.length} of {users.length}
            </span>
          )}
          <div className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-wide">
            Total Users: {users.length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0 w-full">
        <div className="overflow-x-auto w-full min-h-[280px]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-5">Name & Email</th>
                <th className="p-5">Registered On</th>
                <th className="p-5">Current Role</th>
                <th className="p-5">Status</th>
                {isCurrentUserAdmin && (
                  <th className="p-5 text-center">User Control Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isAdmin = user.role === "ADMIN";
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const isCurrentUser = (session?.user as any)?.id === user.id;
                            // Only use localStorage avatar for the currently logged-in user
                            const dbImage = (user.image && user.image !== "null") ? user.image : null;
                            const displayImage = dbImage || (isCurrentUser ? localAvatar : null);
                            return displayImage ? (
                              <img
                                src={displayImage}
                                alt={user.name || "User Avatar"}
                                className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm ${
                                isAdmin 
                                  ? "bg-green-50 border-green-200 text-green-700" 
                                  : "bg-slate-100 border-slate-200 text-slate-600"
                              }`}>
                                {(user.name || user.email).substring(0, 1).toUpperCase()}
                              </div>
                            );
                          })()}
                          <div>
                            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                              {user.name || "N/A"}
                              {isAdmin && (
                                <span title="Protected Administrator Account">
                                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-slate-500 font-medium">
                        {(() => {
                          const d = new Date(user.createdAt);
                          return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                        })()}
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase border shadow-sm ${
                          isAdmin 
                            ? "bg-amber-50 text-amber-700 border-amber-200 font-extrabold" 
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {isAdmin ? <Lock className="w-3 h-3 text-amber-500 animate-pulse" /> : <User className="w-3 h-3" />}
                          {isAdmin ? "ADMIN (PROTECTED)" : user.role}
                        </span>
                      </td>
                      <td className="p-5">
                        {(() => {
                          const isCurrentUser = (session?.user as any)?.id === user.id;
                          return isCurrentUser ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase border shadow-sm bg-green-50 text-green-700 border-green-200">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                              Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase border shadow-sm bg-slate-100 text-slate-400 border-slate-200">
                              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                              Offline
                            </span>
                          );
                        })()}
                      </td>
                      {isCurrentUserAdmin && (
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-3">
                            {isPending && <Loader2 className="w-4 h-4 text-slate-400 animate-spin mr-1" />}
                            
                            {/* Role Switcher Selector */}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                disabled={isPending || isAdmin}
                                onClick={() => {
                                  if (activeDropdownUserId === user.id) {
                                    setActiveDropdownUserId(null);
                                  } else {
                                    setActiveDropdownUserId(user.id);
                                  }
                                }}
                                className="bg-slate-600 hover:bg-slate-700 border-0 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-between gap-1.5 min-w-[90px] h-9 shadow-xs active:scale-95"
                                title={isAdmin ? "Protected Administrator Account" : "Change User Role"}
                              >
                                <span>{user.role}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${activeDropdownUserId === user.id ? "rotate-180" : ""}`} />
                              </button>

                              {activeDropdownUserId === user.id && (
                                <div className="absolute top-[100%] right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50 w-[110px] animate-scale-in">
                                  {[
                                    { value: "USER", label: "USER" },
                                    { value: "ADMIN", label: "ADMIN" }
                                  ].map((opt) => (
                                    <div
                                      key={opt.value}
                                      onClick={() => {
                                        handleRoleChange(user.id, opt.value as any);
                                        setActiveDropdownUserId(null);
                                      }}
                                      className={`px-3 py-2.5 text-xs font-bold hover:bg-green-50 hover:text-green-700 transition cursor-pointer flex items-center justify-between ${
                                        user.role === opt.value ? "bg-green-50 text-green-700" : "text-slate-600"
                                      }`}
                                    >
                                      <span>{opt.label}</span>
                                      {user.role === opt.value && <Check className="w-3.5 h-3.5 text-green-600" />}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Reset Password Button */}
                            <button
                              type="button"
                              onClick={() => handleResetPassword(user.id)}
                              disabled={isPending || isAdmin}
                              title={isAdmin ? "Protected Administrator Account" : "Reset User Password to default '12345678'"}
                              className="p-2 bg-amber-500 hover:bg-amber-600 border-0 text-white rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed h-9 w-9 flex items-center justify-center shadow-xs cursor-pointer"
                            >
                              <Key className="w-4 h-4 text-white" />
                            </button>

                            {/* Delete Account Button */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmUser(user)}
                              disabled={isPending || isAdmin}
                              title={isAdmin ? "Protected Administrator Account" : "Delete User Account"}
                              className="p-2 bg-red-650 hover:bg-red-700 border-0 text-white rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed h-9 w-9 flex items-center justify-center shadow-xs cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-semibold italic">
                      {searchQuery ? "No matching users found for your search query." : "No registered users found."}
                    </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Confirmation Modal for Safe Account Deletion */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-100 shadow-2xl animate-scale-in">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-5 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800">Confirm Account Deletion</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Are you sure you want to permanently delete the user account of <strong className="text-slate-800 font-semibold">{deleteConfirmUser.name || deleteConfirmUser.email}</strong>?
            </p>
            
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 font-semibold mt-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-700 uppercase tracking-wider text-[10px] font-bold">
                <ShieldAlert className="w-3.5 h-3.5" /> Safety Pre-requisites Active
              </div>
              <p className="leading-relaxed text-slate-600">
                To prevent orphan notices, any notice created by this user will be safely re-assigned to your account automatically before deletion.
              </p>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-5 py-2.5 bg-slate-500 hover:bg-slate-600 text-white transition font-bold rounded-xl text-xs active:scale-95 border-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isPending}
                className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 transition font-bold rounded-xl text-xs active:scale-95 flex items-center gap-1.5 shadow-lg shadow-red-600/10"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push("/admin/auth");
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm text-red-500 font-medium hover:underline transition"
    >
      Logout
    </button>
  );
}

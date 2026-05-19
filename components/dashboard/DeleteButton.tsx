"use client";

import { useState } from "react";

interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<{ success: boolean; message: string }>;
}

export default function DeleteButton({ id, action }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this item?")) {
      setIsDeleting(true);
      const result = await action(id);
      if (result.success) {
        // Success handled by revalidatePath in action
      } else {
        alert(result.message);
      }
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition active:scale-95 disabled:opacity-50 border-0 flex items-center justify-center cursor-pointer shadow-sm"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}

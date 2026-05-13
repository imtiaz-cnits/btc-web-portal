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
      className="text-red-500 hover:underline text-sm font-medium disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}

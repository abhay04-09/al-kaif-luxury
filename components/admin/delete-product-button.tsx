"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete ${productName}?`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE"
    });

    setIsDeleting(false);

    if (!response.ok) {
      alert("Product could not be deleted.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      className="text-sm text-red-300 transition hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isDeleting}
      onClick={handleDelete}
      type="button"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
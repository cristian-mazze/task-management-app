"use client";

import { XCircle } from "lucide-react";

export default function ErrorMessage({ message, onClose }) {
  return (
    <div
      className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded relative"
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-4 mr-4 text-red-500 hover:text-red-700"
        >
          <span className="text-xl">&times;</span>
        </button>
      )}
    </div>
  );
}

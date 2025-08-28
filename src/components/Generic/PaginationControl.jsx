import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export const PaginationControl = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
    >
      <FaChevronLeft className="h-5 w-5 text-gray-600" />
    </button>
    <span className="text-sm text-gray-700 mx-4">
      Página <span className="font-bold">{currentPage}</span> de <span className="font-bold">{totalPages}</span>
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage >= totalPages}
      className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
    >
      <FaChevronRight className="h-5 w-5 text-gray-600" />
    </button>
  </div>
);
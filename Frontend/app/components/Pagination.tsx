import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const IconPrev = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M12 6L8 10l4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconNext = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M8 6l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);
      if (endPage - startPage < 4) {
        if (startPage === 2) endPage = Math.min(totalPages - 1, startPage + 4);
        else if (endPage === totalPages - 1)
          startPage = Math.max(2, endPage - 4);
      }
      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 1) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-xl shadow-sm px-3 py-2">
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-2 px-2 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition transform-gpu duration-150 hover:scale-105 focus:scale-105"
          aria-label="Previous page"
        >
          <IconPrev />
          <span className="sr-only">Previous</span>
        </button>
      )}

      {pageNumbers.map((pageNum, idx) =>
        pageNum === "..." ? (
          <span key={`ell-${idx}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum as number)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition transform-gpu duration-150 focus:outline-none focus:ring-2 focus:ring-primary hover:scale-105 ${
              currentPage === pageNum
                ? "bg-primary text-white shadow"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            aria-current={currentPage === pageNum ? "page" : undefined}
          >
            {pageNum}
          </button>
        ),
      )}

      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-2 px-2 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition transform-gpu duration-150 hover:scale-105 focus:scale-105"
          aria-label="Next page"
        >
          <span className="sr-only">Next</span>
          <IconNext />
        </button>
      )}
    </div>
  );
};

export default Pagination;

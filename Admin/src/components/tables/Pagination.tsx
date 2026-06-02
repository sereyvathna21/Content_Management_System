type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Dynamically determines a sliding window of visible page tabs
  const getVisiblePages = () => {
    const totalVisible = 3; // Number of page buttons shown at once
    let start = Math.max(currentPage - Math.floor(totalVisible / 2), 1);
    let end = start + totalVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - totalVisible + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pagesAroundCurrent = getVisiblePages();

  return (
    <div className="flex items-center ">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 text-sm"
      >
        Previous
      </button>

      <div className="flex items-center gap-2">
        {/* If page 1 falls out of the sliding block, anchor it at the front */}
        {pagesAroundCurrent[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-4 py-2 rounded flex w-10 items-center justify-center h-10 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-blue-500/5 hover:text-brand-500"
            >
              1
            </button>
            {pagesAroundCurrent[0] > 2 && <span className="px-2 text-gray-400">...</span>}
          </>
        )}

        {/* The sliding window group */}
        {pagesAroundCurrent.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded ${
              currentPage === page
                ? "bg-brand-500 text-white"
                : "text-gray-700 dark:text-gray-400"
            } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/5 hover:text-brand-500 dark:hover:text-brand-500`}
          >
            {page}
          </button>
        ))}

        {/* If the last page falls out of the sliding block, anchor it at the tail */}
        {pagesAroundCurrent[pagesAroundCurrent.length - 1] < totalPages && (
          <>
            {pagesAroundCurrent[pagesAroundCurrent.length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-4 py-2 rounded flex w-10 items-center justify-center h-10 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-blue-500/5 hover:text-brand-500"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
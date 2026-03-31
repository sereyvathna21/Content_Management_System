import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  action?: React.ReactNode; // Optional action (e.g., button) aligned with header
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  action,
}) => {
  const hasHeader = Boolean(title || desc || action);

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      {hasHeader && (
        <div className="px-6 py-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div>
            <h3 className="text-base font-medium text-primary dark:text-white/90">
              {title}
            </h3>
            {desc && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {desc}
              </p>
            )}
          </div>
          {action && <div className="sm:pt-1">{action}</div>}
        </div>
      )}

      {/* Card Body */}
      <div
        className={`p-4 sm:p-6 ${
          hasHeader ? "border-t border-gray-100 dark:border-gray-800" : ""
        }`}
      >
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;

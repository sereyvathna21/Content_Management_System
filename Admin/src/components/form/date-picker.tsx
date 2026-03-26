import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
}: PropsType) {
  const fpRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    const fp = flatpickr(`#${id}`, {
      mode: mode || "single",
      monthSelectorType: "static",
      dateFormat: "d-m-Y",
      defaultDate,
      onChange,
      disableMobile: true,
      closeOnSelect: true,
      appendTo: undefined,
    });

    fpRef.current = Array.isArray(fp) ? fp[0] : fp;

    return () => {
      fpRef.current?.destroy();
    };
  }, [mode, onChange, id, defaultDate]);

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative group">
        <input
          id={id}
          placeholder={placeholder || "Select a date"}
          readOnly
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 outline-none transition-colors cursor-pointer hover:border-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:placeholder:text-white/30 dark:focus:border-primary dark:hover:border-gray-600"
        />

        {/* Calendar icon */}
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-500 transition-colors dark:text-gray-500"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

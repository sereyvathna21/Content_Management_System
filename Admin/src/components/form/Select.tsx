"use client";

import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(value ?? defaultValue ?? "");

  useEffect(() => {
    if (value !== undefined) setSelectedValue(value);
  }, [value]);

  const selectedLabel = options.find((o) => o.value === selectedValue)?.label || "";

  function handleSelect(val: string) {
    setSelectedValue(val);
    onChange(val);
  }

  return (
    <Menu as="div" className={`relative w-full ${className}`}>
      <Menu.Button
        type="button"
        className="inline-flex w-full justify-between items-center gap-x-2 rounded-lg bg-white/60 dark:bg-gray-900 px-4 py-2 text-sm text-gray-800 dark:text-white shadow-sm hover:bg-primary/5 transition border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-3 focus:ring-primary/20"
      >
        <span className={`${selectedLabel ? "text-primary" : "text-gray-500"}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDownIcon className="-mr-1 h-5 w-5 text-primary" aria-hidden />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="py-1">
            {options.map((opt) => (
              <Menu.Item key={opt.value}>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`block w-full text-left px-4 py-2 text-sm transition ${
                      active ? "bg-primary/10 text-primary" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Select;

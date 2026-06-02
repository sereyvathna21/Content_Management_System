export const formatDateTime = (dateInput?: Date | string | number): string => {
  if (!dateInput) return "-";

  let date: Date;

  if (typeof dateInput === "string") {
    let sanitizedInput = dateInput.trim();
    if (!sanitizedInput.endsWith("Z") && !sanitizedInput.includes("+") && !sanitizedInput.match(/-\d{2}:\d{2}$/)) {
      sanitizedInput = sanitizedInput.replace(" ", "T") + "Z";
    }
    date = new Date(sanitizedInput);
  } else if (typeof dateInput === "number") {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, 
  }).format(date);
};

const toIsoFormat = (value: string): string => {
  const [day, month, year] = value.split("-");
  return `${year}-${month}-${day}`;
};

export const toIsoDateStart = (value: string): string | null => {
  if (!value) return null;
  const date = new Date(`${toIsoFormat(value)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const toIsoDateEnd = (value: string): string | null => {
  if (!value) return null;
  const date = new Date(`${toIsoFormat(value)}T23:59:59.999Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const statusColor = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "success") return "success" as const;
  if (normalized === "failure") return "error" as const;
  return "info" as const;
};
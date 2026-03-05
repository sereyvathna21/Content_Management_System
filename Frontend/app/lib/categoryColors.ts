export function getCategoryBadgeClasses(category: string) {
  const key = (category || "").toLowerCase().trim();
  switch (key) {
    case "royal degree":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "sub-degree":
    case "sub degree":
      return "text-green-600 bg-green-50 border-green-200";
    case "prakas":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "decision and guideline":
    case "decision":
    case "guideline":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "act":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "regulation":
      return "text-green-600 bg-green-50 border-green-200";
    case "policy":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "notification":
      return "text-purple-600 bg-purple-50 border-purple-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getCategoryDotClass(category: string) {
  const key = (category || "").toLowerCase().trim();
  switch (key) {
    case "royal degree":
      return "bg-blue-500";
    case "sub-degree":
    case "sub degree":
      return "bg-green-500";
    case "prakas":
      return "bg-amber-500";
    case "decision and guideline":
    case "decision":
    case "guideline":
      return "bg-purple-500";
    case "act":
      return "bg-blue-500";
    case "regulation":
      return "bg-green-500";
    case "policy":
      return "bg-amber-500";
    case "notification":
      return "bg-purple-500";
    default:
      return "bg-gray-400";
  }
}

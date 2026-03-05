export function gradientIdFrom(primary: string): string {
  const p = primary.toLowerCase();
  if (p.includes("green") || p.includes("#4caf4f")) return "gradient-green";
  if (p.includes("blue")) return "gradient-blue";
  if (p.includes("purple")) return "gradient-purple";
  if (p.includes("cyan")) return "gradient-cyan";
  if (p.includes("indigo")) return "gradient-indigo";
  if (p.includes("orange")) return "gradient-orange";
  return "gradient-green";
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { jsPDF } from "jspdf";

// 1. Declare the options layout explicitly so you can use it inside your app codebase
export interface AutoTableOptions {
  startY?: number;
  head?: unknown[][];
  body?: unknown[][];
  theme?: "striped" | "grid" | "plain";
  headStyles?: unknown;
  styles?: unknown;
  columnStyles?: unknown;
  margin?: unknown;
  pageBreak?: "auto" | "avoid" | "always";
  rowPageBreak?: "auto" | "avoid";
  tableWidth?: "auto" | "wrap" | number;
}

// 2. Augment the existing "jspdf" module namespace to add .autoTable directly onto the doc instance
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}
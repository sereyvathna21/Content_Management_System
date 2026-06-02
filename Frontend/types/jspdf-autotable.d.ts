import { jsPDF } from "jspdf";

// 1. Declare the options layout explicitly so you can use it inside your app codebase
export interface AutoTableOptions {
  startY?: number;
  head?: any[][];
  body?: any[][];
  theme?: "striped" | "grid" | "plain";
  headStyles?: any;
  styles?: any;
  columnStyles?: any;
  margin?: any;
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
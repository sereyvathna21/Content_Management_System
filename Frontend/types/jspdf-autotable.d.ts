declare module "jspdf-autotable" {
  import { jsPDF } from "jspdf";

  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    theme?: "striped" | "grid" | "plain";
    headStyles?: any;
    styles?: any;
    columnStyles?: any;
    margin?: any;
    pageBreak?: string;
    rowPageBreak?: string;
    tableWidth?: string | number;
  }

  global {
    interface jsPDF {
      autoTable: (options: AutoTableOptions) => jsPDF;
    }
  }
}

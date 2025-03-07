
declare module 'pdfjs-dist/legacy/build/pdf' {
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(src: any): { promise: Promise<any> };
  
  // Additional types needed for PDF.js operations
  export interface PDFPageProxy {
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: { canvasContext: CanvasRenderingContext2D; viewport: any }) => { promise: Promise<void> };
  }
  
  export interface PDFDocumentProxy {
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  }
}

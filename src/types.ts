export type ToolType = 'select' | 'text' | 'watermark' | 'signature' | 'image';

export type PresetWatermark = 'CONFIDENTIAL' | 'APPROVED' | 'DRAFT' | 'PAID' | 'OFFICIAL' | 'VOID';

export interface StampElement {
  id: string;
  type: 'text' | 'watermark' | 'signature' | 'image';
  pageIndex: number; // 0-based page index, or -1 for all pages
  x: number; // percentage of page width (0 to 100)
  y: number; // percentage of page height (0 to 100)
  width?: number; // percentage
  height?: number; // percentage
  text?: string;
  fontSize?: number; // in pt
  color: string; // hex
  opacity: number; // 0.1 to 1.0
  rotation: number; // degrees
  imageDataUrl?: string; // for signature / image stamps
  isPreset?: boolean;
}

export interface PageMetadata {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
  thumbnailUrl?: string;
}

export interface PdfDocumentState {
  file: File | null;
  fileName: string;
  arrayBuffer: ArrayBuffer | null;
  numPages: number;
  currentPageIndex: number;
  pages: PageMetadata[];
  stamps: StampElement[];
  zoom: number; // 0.5 to 2.5
}

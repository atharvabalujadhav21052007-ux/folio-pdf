import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { PageMetadata } from '../types';

// Set up worker source from reliable CDN matching installed pdfjs-dist version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function loadPdfDocument(arrayBuffer: ArrayBuffer): Promise<{
  numPages: number;
  pages: PageMetadata[];
}> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: PageMetadata[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    pages.push({
      pageNumber: i,
      width: viewport.width,
      height: viewport.height,
      rotation: page.rotate || 0
    });
  }

  return { numPages, pages };
}

export async function renderPageToCanvas(
  arrayBuffer: ArrayBuffer,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.0
): Promise<{ width: number; height: number }> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageIndex + 1);

  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Clear previous render
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas
  };

  await page.render(renderContext).promise;
  return { width: viewport.width, height: viewport.height };
}

/**
 * Creates a beautiful, professional 2-page sample invoice/agreement
 * so the user can test editing immediately without having to upload a file.
 */
export async function createSamplePdf(): Promise<{ arrayBuffer: ArrayBuffer; name: string }> {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: Master Service Agreement
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Header
  page1.drawText('MASTER SERVICES AGREEMENT', {
    x: 50,
    y: height - 80,
    size: 20,
    font: timesRomanBold,
    color: rgb(0.1, 0.12, 0.16)
  });

  page1.drawText('Ref: MSA-2026-08892', {
    x: 50,
    y: height - 102,
    size: 10,
    font: helvetica,
    color: rgb(0.4, 0.45, 0.5)
  });

  page1.drawLine({
    start: { x: 50, y: height - 115 },
    end: { x: width - 50, y: height - 115 },
    thickness: 1,
    color: rgb(0.8, 0.82, 0.85)
  });

  const introText = [
    'This Agreement is entered into as of the date of electronic execution between:',
    '1. PARTIES: Studio Folio Corp ("Provider") and the Client identified herein ("Customer").',
    '2. SCOPE OF WORK: Provider shall perform engineering, security assessment, and UI design',
    '   services in accordance with the specifications described in Schedule A attached hereto.',
    '3. CONFIDENTIALITY: Each party agrees to hold all proprietary and financial information',
    '   in strict confidence and protect it with the same degree of care it uses for its own secrets.',
    '4. INTELLECTUAL PROPERTY: Upon receipt of full payment, all custom deliverables shall become',
    '   the sole property of the Customer, subject to standard open-source utility reservations.',
    '5. WARRANTIES & LIABILITIES: Services are provided with professional care and skill.'
  ];

  let currentY = height - 150;
  for (const line of introText) {
    page1.drawText(line, {
      x: 50,
      y: currentY,
      size: 11,
      font: timesRoman,
      color: rgb(0.18, 0.2, 0.24)
    });
    currentY -= 24;
  }

  // Signature Block
  page1.drawRectangle({
    x: 50,
    y: 120,
    width: width - 100,
    height: 140,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.85, 0.88, 0.9),
    borderWidth: 1
  });

  page1.drawText('EXECUTION & SIGNATURE BLOCK', {
    x: 70,
    y: 235,
    size: 11,
    font: helveticaBold,
    color: rgb(0.2, 0.25, 0.3)
  });

  page1.drawText('Provider Signature:', {
    x: 70,
    y: 200,
    size: 10,
    font: helvetica,
    color: rgb(0.4, 0.45, 0.5)
  });

  page1.drawLine({
    start: { x: 70, y: 170 },
    end: { x: 250, y: 170 },
    thickness: 1,
    color: rgb(0.7, 0.75, 0.8)
  });

  page1.drawText('Authorized Officer: Julian Vance', {
    x: 70,
    y: 150,
    size: 9,
    font: timesRoman,
    color: rgb(0.3, 0.35, 0.4)
  });

  page1.drawText('Client Signature & Stamp (Place here):', {
    x: 300,
    y: 200,
    size: 10,
    font: helveticaBold,
    color: rgb(0.7, 0.2, 0.2)
  });

  page1.drawLine({
    start: { x: 300, y: 170 },
    end: { x: width - 70, y: 170 },
    thickness: 1,
    color: rgb(0.7, 0.75, 0.8)
  });

  // Page 2: Schedule A Deliverables
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawText('SCHEDULE A — DELIVERABLES & ACCEPTANCE', {
    x: 50,
    y: height - 80,
    size: 18,
    font: timesRomanBold,
    color: rgb(0.1, 0.12, 0.16)
  });

  page2.drawText('Payment terms: Net 30 upon signature and receipt of invoice.', {
    x: 50,
    y: height - 120,
    size: 11,
    font: timesRoman,
    color: rgb(0.25, 0.28, 0.32)
  });

  const pdfBytes = await pdfDoc.save();
  return {
    arrayBuffer: pdfBytes.buffer as ArrayBuffer,
    name: 'Sample_Agreement_MSA.pdf'
  };
}

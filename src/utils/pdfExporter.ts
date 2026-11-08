import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import type { StampElement } from '../types';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const intVal = parseInt(cleanHex, 16);
  return {
    r: ((intVal >> 16) & 255) / 255,
    g: ((intVal >> 8) & 255) / 255,
    b: (intVal & 255) / 255
  };
}

export async function exportModifiedPdf(
  originalBuffer: ArrayBuffer,
  stamps: StampElement[],
  pageRotations: Record<number, number> = {},
  deletedPageIndices: number[] = []
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBuffer);
  const helvetica = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const totalPages = pdfDoc.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    // Apply rotation if any
    if (pageRotations[i]) {
      const currentRotate = page.getRotation().angle;
      page.setRotation(degrees((currentRotate + pageRotations[i]) % 360));
    }

    // Find all stamps applicable to this page
    const pageStamps = stamps.filter(s => s.pageIndex === i || s.pageIndex === -1);

    for (const stamp of pageStamps) {
      const { r, g, b } = hexToRgb(stamp.color);
      const pdfX = (stamp.x / 100) * width;
      // Invert Y coordinate from screen top-left to PDF bottom-left
      const pdfY = ((100 - stamp.y) / 100) * height;

      if (stamp.type === 'signature' || stamp.type === 'image') {
        if (stamp.imageDataUrl) {
          try {
            const imageBytes = await fetch(stamp.imageDataUrl).then(res => res.arrayBuffer());
            const embeddedImg = stamp.imageDataUrl.includes('image/png')
              ? await pdfDoc.embedPng(imageBytes)
              : await pdfDoc.embedJpg(imageBytes);

            const imgWidth = (stamp.width ? (stamp.width / 100) * width : 150);
            const imgHeight = (stamp.height ? (stamp.height / 100) * height : 60);

            page.drawImage(embeddedImg, {
              x: pdfX,
              y: pdfY - imgHeight,
              width: imgWidth,
              height: imgHeight,
              opacity: stamp.opacity,
              rotate: degrees(stamp.rotation)
            });
          } catch (err) {
            console.error('Failed to embed image/signature stamp:', err);
          }
        }
      } else {
        // Text or Watermark stamp
        const text = stamp.text || 'CONFIDENTIAL';
        const fontSize = stamp.fontSize || 24;
        const textWidth = helvetica.widthOfTextAtSize(text, fontSize);
        const textHeight = helvetica.heightAtSize(fontSize);

        // If it's a boxed preset watermark like APPROVED, draw a clean border box
        if (stamp.isPreset && ['APPROVED', 'PAID', 'OFFICIAL', 'VOID'].includes(text)) {
          const padding = 10;
          page.drawRectangle({
            x: pdfX - textWidth / 2 - padding,
            y: pdfY - textHeight / 2 - padding,
            width: textWidth + padding * 2,
            height: textHeight + padding * 2,
            borderColor: rgb(r, g, b),
            borderWidth: 2,
            opacity: stamp.opacity,
            rotate: degrees(stamp.rotation)
          });
        }

        page.drawText(text, {
          x: pdfX - (stamp.isPreset ? textWidth / 2 : 0),
          y: pdfY - (stamp.isPreset ? textHeight / 2 : 0),
          size: fontSize,
          font: helvetica,
          color: rgb(r, g, b),
          opacity: stamp.opacity,
          rotate: degrees(stamp.rotation)
        });
      }
    }
  }

  // Remove deleted pages in descending order so indices remain valid
  if (deletedPageIndices.length > 0) {
    const sortedIndices = [...deletedPageIndices].sort((a, b) => b - a);
    for (const idx of sortedIndices) {
      if (idx >= 0 && idx < pdfDoc.getPageCount() && pdfDoc.getPageCount() > 1) {
        pdfDoc.removePage(idx);
      }
    }
  }

  return await pdfDoc.save();
}

export function triggerDownload(pdfBytes: Uint8Array, fileName: string) {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName.replace(/\.pdf$/i, '') + '_folio.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

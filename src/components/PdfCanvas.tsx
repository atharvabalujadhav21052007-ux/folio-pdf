import React, { useEffect, useRef, useState } from 'react';
import { Upload, Sparkles, FileText, Move } from 'lucide-react';
import { renderPageToCanvas } from '../utils/pdfRenderer';
import type { StampElement } from '../types';

interface PdfCanvasProps {
  arrayBuffer: ArrayBuffer | null;
  currentPageIndex: number;
  zoom: number;
  rotation: number;
  stamps: StampElement[];
  selectedStampId: string | null;
  onSelectStamp: (id: string | null) => void;
  onUpdateStampPosition: (id: string, x: number, y: number) => void;
  onUploadFile: (file: File) => void;
  onLoadSample: () => void;
}

export const PdfCanvas: React.FC<PdfCanvasProps> = ({
  arrayBuffer,
  currentPageIndex,
  zoom,
  rotation,
  stamps,
  selectedStampId,
  onSelectStamp,
  onUpdateStampPosition,
  onUploadFile,
  onLoadSample
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Dragging state for elements
  const [draggingStampId, setDraggingStampId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Render current PDF page whenever buffer, pageIndex, or zoom changes
  useEffect(() => {
    if (!arrayBuffer || !canvasRef.current) return;
    let isMounted = true;

    renderPageToCanvas(arrayBuffer, currentPageIndex, canvasRef.current, zoom)
      .then((dims) => {
        if (isMounted) {
          setCanvasDimensions(dims);
        }
      })
      .catch((err) => {
        console.error('Error rendering page:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [arrayBuffer, currentPageIndex, zoom]);

  // Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onUploadFile(file);
      }
    }
  };

  // Stamp Drag Handlers
  const handleStampPointerDown = (e: React.PointerEvent, stamp: StampElement) => {
    e.stopPropagation();
    onSelectStamp(stamp.id);
    setDraggingStampId(stamp.id);

    const overlayRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (overlayRect) {
      const currentPixelX = (stamp.x / 100) * overlayRect.width;
      const currentPixelY = (stamp.y / 100) * overlayRect.height;
      setDragOffset({
        x: e.clientX - overlayRect.left - currentPixelX,
        y: e.clientY - overlayRect.top - currentPixelY
      });
    }
  };

  const handleOverlayPointerMove = (e: React.PointerEvent) => {
    if (!draggingStampId || !canvasDimensions.width) return;
    const overlay = e.currentTarget;
    const rect = overlay.getBoundingClientRect();

    const mouseX = e.clientX - rect.left - dragOffset.x;
    const mouseY = e.clientY - rect.top - dragOffset.y;

    const percentX = Math.max(0, Math.min(95, (mouseX / rect.width) * 100));
    const percentY = Math.max(0, Math.min(95, (mouseY / rect.height) * 100));

    onUpdateStampPosition(draggingStampId, percentX, percentY);
  };

  const handleOverlayPointerUp = () => {
    setDraggingStampId(null);
  };

  // If no document is loaded, show elegant empty state dropzone
  if (!arrayBuffer) {
    return (
      <main
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 bg-[var(--bg-workspace)] flex flex-col items-center justify-center p-6 select-none"
      >
        <div
          className={`max-w-md w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center text-center transition-colors ${
            isDraggingOver
              ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/5'
              : 'border-[var(--border-strong)] bg-[var(--bg-surface)]'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-gold)] mb-4">
            <FileText className="w-6 h-6" />
          </div>

          <h2 className="text-base font-semibold text-[var(--text-main)] mb-1">
            Drop your PDF document here
          </h2>
          <p className="text-xs text-[var(--text-muted)] max-w-xs mb-6 leading-relaxed">
            Fast, client-side PDF editing. Sign contracts, add watermarks, and reorder pages with zero server upload.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <label className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-black font-semibold rounded text-xs cursor-pointer shadow-sm">
              <Upload className="w-4 h-4" />
              <span>Select PDF File</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files?.[0] && onUploadFile(e.target.files[0])}
                className="hidden"
              />
            </label>

            <button
              onClick={onLoadSample}
              className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg-app)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded text-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Try Sample PDF</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Filter stamps visible on this page
  const visibleStamps = stamps.filter(
    (s) => s.pageIndex === currentPageIndex || s.pageIndex === -1
  );

  return (
    <main
      ref={containerRef}
      onClick={() => onSelectStamp(null)}
      className="flex-1 bg-[var(--bg-workspace)] overflow-auto flex items-center justify-center p-8 select-none"
    >
      <div
        className="relative bg-white shadow-2xl rounded-xs transition-transform duration-100 ease-out"
        style={{
          width: canvasDimensions.width || 'auto',
          height: canvasDimensions.height || 'auto',
          transform: `rotate(${rotation}deg)`
        }}
      >
        {/* Render Canvas */}
        <canvas ref={canvasRef} className="block pointer-events-none rounded-xs" />

        {/* Interactive Stamping Overlay */}
        <div
          onPointerMove={handleOverlayPointerMove}
          onPointerUp={handleOverlayPointerUp}
          className="absolute inset-0 cursor-default"
        >
          {visibleStamps.map((stamp) => {
            const isSelected = selectedStampId === stamp.id;

            return (
              <div
                key={stamp.id}
                onPointerDown={(e) => handleStampPointerDown(e, stamp)}
                className={`absolute cursor-move select-none flex items-center justify-center transition-shadow group ${
                  isSelected
                    ? 'ring-2 ring-[var(--accent-gold)] ring-offset-2 ring-offset-black/50 z-20'
                    : 'hover:ring-1 hover:ring-[var(--accent-blue)] z-10'
                }`}
                style={{
                  left: `${stamp.x}%`,
                  top: `${stamp.y}%`,
                  transform: `translate(-50%, -50%) rotate(${stamp.rotation}deg)`,
                  opacity: stamp.opacity
                }}
              >
                {/* Visual rendering based on stamp type */}
                {stamp.type === 'signature' || stamp.type === 'image' ? (
                  <img
                    src={stamp.imageDataUrl}
                    alt="Stamp"
                    className="max-w-[200px] max-h-[90px] object-contain pointer-events-none"
                    draggable={false}
                  />
                ) : (
                  <div
                    className={`font-mono font-bold tracking-wider px-3 py-1 text-center ${
                      stamp.isPreset && ['APPROVED', 'PAID', 'OFFICIAL', 'VOID'].includes(stamp.text || '')
                        ? 'border-3 rounded-md'
                        : ''
                    }`}
                    style={{
                      fontSize: `${(stamp.fontSize || 24) * zoom}px`,
                      color: stamp.color,
                      borderColor: stamp.color
                    }}
                  >
                    {stamp.text}
                  </div>
                )}

                {/* Move Handle pill on hover */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/80 text-white rounded px-1.5 py-0.5 text-[9px] flex items-center gap-1 pointer-events-none">
                  <Move className="w-2.5 h-2.5 text-[var(--accent-gold)]" />
                  <span>Drag</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

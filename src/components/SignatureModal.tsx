import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState('#1e3a8a'); // Classic dark legal blue
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        clearCanvas();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-[var(--accent-gold)]" />
            <h3 className="text-sm font-semibold text-[var(--text-main)]">Draw Handwritten Signature</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-4 bg-[var(--bg-app)] flex flex-col items-center">
          <div className="relative border border-[var(--border-strong)] rounded bg-white overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={460}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair block touch-none"
            />
            {/* Baseline guideline */}
            <div className="absolute bottom-8 left-8 right-8 border-b border-dashed border-gray-300 pointer-events-none flex justify-end">
              <span className="text-[10px] text-gray-400 font-mono pr-1">SIGN ABOVE LINE</span>
            </div>
          </div>

          {/* Ink Selector & Clear */}
          <div className="w-full flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Ink:</span>
              <button
                type="button"
                onClick={() => setInkColor('#1e3a8a')}
                className={`w-5 h-5 rounded-full bg-blue-900 border ${inkColor === '#1e3a8a' ? 'border-white scale-110' : 'border-transparent'}`}
                title="Legal Blue Ink"
              />
              <button
                type="button"
                onClick={() => setInkColor('#111827')}
                className={`w-5 h-5 rounded-full bg-gray-900 border ${inkColor === '#111827' ? 'border-white scale-110' : 'border-transparent'}`}
                title="Deep Black Ink"
              />
              <button
                type="button"
                onClick={() => setInkColor('#b45309')}
                className={`w-5 h-5 rounded-full bg-amber-700 border ${inkColor === '#b45309' ? 'border-white scale-110' : 'border-transparent'}`}
                title="Formal Bronze"
              />
            </div>

            <button
              onClick={clearCanvas}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-white px-2 py-1 rounded hover:bg-[var(--bg-surface-hover)]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-white rounded hover:bg-[var(--bg-surface-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!hasDrawn}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-black bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] rounded disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

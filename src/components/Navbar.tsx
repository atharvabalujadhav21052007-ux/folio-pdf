import React from 'react';
import { Upload, Download, ShieldCheck, ZoomIn, ZoomOut, FileText, Sparkles } from 'lucide-react';

interface NavbarProps {
  fileName: string | null;
  onUploadFile: (file: File) => void;
  onLoadSample: () => void;
  onExport: () => void;
  isExporting: boolean;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  fileName,
  onUploadFile,
  onLoadSample,
  onExport,
  isExporting,
  zoom,
  onZoomChange
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 flex items-center justify-between select-none">
      {/* Brand & Document Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[var(--accent-gold)] flex items-center justify-center text-black font-mono font-bold text-sm">
            F
          </div>
          <span className="font-semibold text-sm tracking-tight text-[var(--text-main)]">Folio</span>
          <span className="text-xs text-[var(--text-muted)] font-mono border-l border-[var(--border-subtle)] pl-2">v2.0</span>
        </div>

        {fileName && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[var(--border-subtle)]">
            <FileText className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-[200px]" title={fileName}>
              {fileName}
            </span>
          </div>
        )}
      </div>

      {/* Middle: Privacy Assurance Badge */}
      <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-green)]" />
        <span>100% Client-Side Sandbox · Files never leave your browser</span>
      </div>

      {/* Right Controls: Zoom & Actions */}
      <div className="flex items-center gap-2">
        {/* Zoom */}
        <div className="flex items-center bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded p-0.5">
          <button
            onClick={() => onZoomChange(Math.max(0.6, zoom - 0.15))}
            className="p-1.5 hover:bg-[var(--bg-surface-hover)] rounded text-[var(--text-muted)] hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono px-2 text-[var(--text-muted)] min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.0, zoom + 0.15))}
            className="p-1.5 hover:bg-[var(--bg-surface-hover)] rounded text-[var(--text-muted)] hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Load Sample Document */}
        <button
          onClick={onLoadSample}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-white bg-[var(--bg-app)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded cursor-pointer"
          title="Try with sample agreement"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
          <span className="hidden sm:inline">Try Sample PDF</span>
        </button>

        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--text-main)] bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-strong)] rounded cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload PDF</span>
        </button>

        {/* Download / Export Button */}
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-black bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] rounded disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? 'Exporting...' : 'Save & Download'}</span>
        </button>
      </div>
    </header>
  );
};

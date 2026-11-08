import React, { useState } from 'react';
import { Type, Stamp, PenTool, Image, Calendar, Trash2, Sliders } from 'lucide-react';
import type { PresetWatermark, StampElement } from '../types';

interface ToolPanelProps {
  onAddWatermark: (preset: PresetWatermark, allPages: boolean) => void;
  onAddCustomText: (text: string, fontSize: number, color: string, opacity: number, rotation: number, allPages: boolean) => void;
  onOpenSignatureModal: () => void;
  onUploadImageStamp: (file: File) => void;
  selectedStamp: StampElement | null;
  onUpdateSelectedStamp: (updates: Partial<StampElement>) => void;
  onDeleteSelectedStamp: () => void;
  currentPageIndex: number;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  onAddWatermark,
  onAddCustomText,
  onOpenSignatureModal,
  onUploadImageStamp,
  selectedStamp,
  onUpdateSelectedStamp,
  onDeleteSelectedStamp
}) => {
  const [activeTab, setActiveTab] = useState<'watermark' | 'text' | 'signature' | 'inspector'>('watermark');

  // Custom text inputs
  const [customText, setCustomText] = useState('Reviewed & Verified');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#ef4444');
  const [textOpacity, setTextOpacity] = useState(0.8);
  const [textRotation, setTextRotation] = useState(-30);
  const [allPages, setAllPages] = useState(false);

  const presets: { label: PresetWatermark; color: string; desc: string }[] = [
    { label: 'CONFIDENTIAL', color: '#ef4444', desc: 'Diagonal Red Watermark' },
    { label: 'APPROVED', color: '#10b981', desc: 'Boxed Green Stamp' },
    { label: 'DRAFT', color: '#6b7280', desc: 'Light Gray Watermark' },
    { label: 'PAID', color: '#3b82f6', desc: 'Solid Blue Invoice Seal' },
    { label: 'OFFICIAL', color: '#e5a93c', desc: 'Formal Gold Badge' },
    { label: 'VOID', color: '#991b1b', desc: 'Cancellation Stamp' }
  ];

  const handleInsertDate = () => {
    const today = new Date().toISOString().split('T')[0];
    onAddCustomText(`DATE: ${today}`, 14, '#1f2937', 1.0, 0, false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImageStamp(e.target.files[0]);
    }
  };

  return (
    <aside className="w-80 border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col select-none text-xs">
      {/* Tab Navigation */}
      <div className="h-11 border-b border-[var(--border-subtle)] px-2 flex items-center justify-between bg-[var(--bg-app)]">
        <button
          onClick={() => setActiveTab('watermark')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono ${
            activeTab === 'watermark' ? 'bg-[var(--bg-surface)] text-[var(--accent-gold)] font-medium' : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          <Stamp className="w-3.5 h-3.5" />
          <span>Stamps</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono ${
            activeTab === 'text' ? 'bg-[var(--bg-surface)] text-[var(--accent-gold)] font-medium' : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Text</span>
        </button>

        <button
          onClick={() => setActiveTab('signature')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono ${
            activeTab === 'signature' ? 'bg-[var(--bg-surface)] text-[var(--accent-gold)] font-medium' : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Sign</span>
        </button>

        {selectedStamp && (
          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded font-mono text-[var(--accent-gold)] border border-[var(--accent-gold)]/40 ${
              activeTab === 'inspector' ? 'bg-[var(--bg-surface)]' : ''
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: PRESET WATERMARKS */}
        {activeTab === 'watermark' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-[var(--text-main)] font-semibold text-xs mb-1">Preset Seals & Watermarks</h4>
              <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                Click any preset to place a verified status seal onto the current document.
              </p>
            </div>

            {/* Scope toggle */}
            <div className="flex items-center justify-between p-2 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Apply Scope:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAllPages(false)}
                  className={`px-2 py-1 rounded text-[10px] ${!allPages ? 'bg-[var(--accent-gold)] text-black font-semibold' : 'text-[var(--text-muted)]'}`}
                >
                  Current Page
                </button>
                <button
                  type="button"
                  onClick={() => setAllPages(true)}
                  className={`px-2 py-1 rounded text-[10px] ${allPages ? 'bg-[var(--accent-gold)] text-black font-semibold' : 'text-[var(--text-muted)]'}`}
                >
                  All Pages
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => onAddWatermark(p.label, allPages)}
                  className="p-3 rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] flex flex-col items-center justify-center gap-1 text-center cursor-pointer"
                >
                  <span
                    className="font-mono font-bold tracking-wider text-xs px-2 py-0.5 rounded border"
                    style={{ color: p.color, borderColor: p.color }}
                  >
                    {p.label}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM TEXT */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-[var(--text-main)] font-semibold text-xs mb-1">Custom Text & Annotations</h4>
              <p className="text-[var(--text-muted)] text-[11px]">Type custom notes, disclaimers, or reference tags.</p>
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-[10px] uppercase font-mono block mb-1">Text String</label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] rounded px-3 py-1.5 text-xs text-white focus:border-[var(--accent-gold)] outline-none"
              />
            </div>

            {/* Font size */}
            <div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono mb-1">
                <span>Font Size</span>
                <span>{fontSize} pt</span>
              </div>
              <input
                type="range"
                min="10"
                max="64"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[var(--accent-gold)]"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono mb-1">
                <span>Opacity</span>
                <span>{Math.round(textOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={textOpacity}
                onChange={(e) => setTextOpacity(Number(e.target.value))}
                className="w-full accent-[var(--accent-gold)]"
              />
            </div>

            {/* Rotation */}
            <div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono mb-1">
                <span>Rotation</span>
                <span>{textRotation}°</span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                value={textRotation}
                onChange={(e) => setTextRotation(Number(e.target.value))}
                className="w-full accent-[var(--accent-gold)]"
              />
            </div>

            {/* Color selection */}
            <div>
              <label className="text-[var(--text-muted)] text-[10px] uppercase font-mono block mb-1.5">Color</label>
              <div className="flex items-center gap-2">
                {['#ef4444', '#3b82f6', '#10b981', '#e5a93c', '#111827', '#6b7280'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTextColor(color)}
                    className={`w-6 h-6 rounded-full border ${textColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => onAddCustomText(customText, fontSize, textColor, textOpacity, textRotation, allPages)}
              className="w-full py-2 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-black font-semibold rounded text-xs cursor-pointer"
            >
              Add Text Element
            </button>
          </div>
        )}

        {/* TAB 3: SIGNATURE & SEALS */}
        {activeTab === 'signature' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-[var(--text-main)] font-semibold text-xs mb-1">Signatures & Corporate Seals</h4>
              <p className="text-[var(--text-muted)] text-[11px]">Legally place your signature or company stamp.</p>
            </div>

            {/* Signature Draw Button */}
            <button
              onClick={onOpenSignatureModal}
              className="w-full p-4 border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] rounded bg-[var(--bg-app)] flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--accent-gold)] group-hover:scale-105">
                <PenTool className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xs text-[var(--text-main)]">Draw Digital Signature</span>
              <span className="text-[10px] text-[var(--text-muted)]">Canvas with vector ink smoothing</span>
            </button>

            {/* Date Stamp Button */}
            <button
              onClick={handleInsertDate}
              className="w-full py-2 px-3 border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] rounded flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2 text-[var(--text-main)]">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                <span>Stamp Today's Date</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {new Date().toISOString().split('T')[0]}
              </span>
            </button>

            {/* Image / Company Seal Upload */}
            <label className="w-full p-3 border border-dashed border-[var(--border-strong)] hover:border-[var(--accent-gold)] rounded bg-[var(--bg-app)] flex items-center justify-center gap-2 cursor-pointer">
              <Image className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-muted)]">Upload PNG Stamp / Seal</span>
              <input type="file" accept="image/png,image/jpeg" onChange={handleImageFileChange} className="hidden" />
            </label>
          </div>
        )}

        {/* TAB 4: ACTIVE ELEMENT INSPECTOR */}
        {(activeTab === 'inspector' || selectedStamp) && selectedStamp && (
          <div className="space-y-4 pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[var(--accent-gold)] font-bold">Selected Item</span>
              <button
                onClick={onDeleteSelectedStamp}
                className="flex items-center gap-1 text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 px-2 py-0.5 rounded text-[11px]"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>

            {selectedStamp.text && (
              <div>
                <label className="text-[10px] text-[var(--text-muted)] block mb-1">Text</label>
                <input
                  type="text"
                  value={selectedStamp.text}
                  onChange={(e) => onUpdateSelectedStamp({ text: e.target.value })}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] rounded px-2.5 py-1 text-xs text-white"
                />
              </div>
            )}

            {/* Selected Element Opacity */}
            <div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono mb-1">
                <span>Opacity</span>
                <span>{Math.round(selectedStamp.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={selectedStamp.opacity}
                onChange={(e) => onUpdateSelectedStamp({ opacity: Number(e.target.value) })}
                className="w-full accent-[var(--accent-gold)]"
              />
            </div>

            {/* Selected Element Rotation */}
            <div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono mb-1">
                <span>Rotation</span>
                <span>{selectedStamp.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedStamp.rotation}
                onChange={(e) => onUpdateSelectedStamp({ rotation: Number(e.target.value) })}
                className="w-full accent-[var(--accent-gold)]"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

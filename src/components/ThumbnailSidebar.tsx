import React from 'react';
import { RotateCw, Trash2, Layers } from 'lucide-react';
import type { PageMetadata } from '../types';

interface ThumbnailSidebarProps {
  pages: PageMetadata[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onRotatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  pageRotations: Record<number, number>;
  deletedPages: number[];
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  currentPageIndex,
  onSelectPage,
  onRotatePage,
  onDeletePage,
  pageRotations,
  deletedPages
}) => {
  const visiblePages = pages.filter((_, idx) => !deletedPages.includes(idx));

  return (
    <aside className="w-56 border-r border-[var(--border-subtle)] bg-[var(--bg-app)] flex flex-col select-none">
      <div className="h-10 border-b border-[var(--border-subtle)] px-3 flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>Pages ({visiblePages.length})</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pages.map((_page, idx) => {
          if (deletedPages.includes(idx)) return null;
          const isSelected = currentPageIndex === idx;
          const rotation = pageRotations[idx] || 0;

          return (
            <div
              key={idx}
              onClick={() => onSelectPage(idx)}
              className={`group relative p-2 rounded border cursor-pointer ${
                isSelected
                  ? 'border-[var(--accent-gold)] bg-[var(--bg-surface)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
              }`}
            >
              {/* Page Number Label */}
              <div className="flex items-center justify-between text-xs mb-1.5 text-[var(--text-muted)] font-mono">
                <span>Page {idx + 1}</span>
                {rotation > 0 && <span className="text-[10px] text-[var(--accent-gold)]">{rotation}°</span>}
              </div>

              {/* Minimalist page aspect preview */}
              <div
                className="w-full aspect-[1/1.4] bg-white rounded-sm shadow-sm flex items-center justify-center relative overflow-hidden"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="w-4/5 h-4/5 border border-dashed border-gray-300 rounded flex flex-col justify-between p-1 opacity-50">
                  <div className="h-1 bg-gray-300 w-2/3 rounded-full" />
                  <div className="space-y-1">
                    <div className="h-0.5 bg-gray-200 w-full" />
                    <div className="h-0.5 bg-gray-200 w-5/6" />
                    <div className="h-0.5 bg-gray-200 w-4/6" />
                  </div>
                  <div className="h-1 bg-gray-300 w-1/3 rounded-full self-end" />
                </div>
              </div>

              {/* Action Buttons on Hover */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 bg-[var(--bg-app)]/90 backdrop-blur rounded p-0.5 border border-[var(--border-subtle)]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRotatePage(idx);
                  }}
                  className="p-1 hover:text-[var(--accent-gold)] text-[var(--text-muted)] rounded"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
                {visiblePages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(idx);
                    }}
                    className="p-1 hover:text-[var(--accent-red)] text-[var(--text-muted)] rounded"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

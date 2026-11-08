import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ThumbnailSidebar } from './components/ThumbnailSidebar';
import { ToolPanel } from './components/ToolPanel';
import { PdfCanvas } from './components/PdfCanvas';
import { SignatureModal } from './components/SignatureModal';
import { loadPdfDocument, createSamplePdf } from './utils/pdfRenderer';
import { exportModifiedPdf, triggerDownload } from './utils/pdfExporter';
import type { PageMetadata, PresetWatermark, StampElement } from './types';

export const App: React.FC = () => {
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pages, setPages] = useState<PageMetadata[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);

  // Manipulations state
  const [stamps, setStamps] = useState<StampElement[]>([]);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [deletedPages, setDeletedPages] = useState<number[]>([]);

  // UI Modals
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load PDF file from File object
  const handleUploadFile = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const { pages: docPages } = await loadPdfDocument(buffer);
      setArrayBuffer(buffer);
      setFileName(file.name);
      setPages(docPages);
      setCurrentPageIndex(0);
      setStamps([]);
      setSelectedStampId(null);
      setPageRotations({});
      setDeletedPages([]);
    } catch (err) {
      console.error('Failed to parse PDF file:', err);
      alert('Could not open this PDF. Please ensure it is a valid PDF document.');
    }
  }, []);

  // Load sample agreement document
  const handleLoadSample = useCallback(async () => {
    try {
      const { arrayBuffer: sampleBuffer, name } = await createSamplePdf();
      const { pages: docPages } = await loadPdfDocument(sampleBuffer);
      setArrayBuffer(sampleBuffer);
      setFileName(name);
      setPages(docPages);
      setCurrentPageIndex(0);
      setStamps([]);
      setSelectedStampId(null);
      setPageRotations({});
      setDeletedPages([]);
    } catch (err) {
      console.error('Failed to generate sample PDF:', err);
    }
  }, []);

  // Automatically load sample document on first launch if empty
  useEffect(() => {
    handleLoadSample();
  }, [handleLoadSample]);

  // Page rotation
  const handleRotatePage = (index: number) => {
    setPageRotations((prev) => ({
      ...prev,
      [index]: ((prev[index] || 0) + 90) % 360
    }));
  };

  // Delete page
  const handleDeletePage = (index: number) => {
    setDeletedPages((prev) => {
      const next = [...prev, index];
      // Switch active page if current page was deleted
      const available = pages.map((_, i) => i).filter((i) => !next.includes(i));
      if (available.length > 0 && !available.includes(currentPageIndex)) {
        setCurrentPageIndex(available[0]);
      }
      return next;
    });
  };

  // Add Preset Watermark
  const handleAddWatermark = (preset: PresetWatermark, allPages: boolean) => {
    const configMap: Record<PresetWatermark, { color: string; rotation: number; fontSize: number }> = {
      CONFIDENTIAL: { color: '#ef4444', rotation: -35, fontSize: 48 },
      APPROVED: { color: '#10b981', rotation: 0, fontSize: 32 },
      DRAFT: { color: '#6b7280', rotation: -35, fontSize: 54 },
      PAID: { color: '#3b82f6', rotation: 0, fontSize: 30 },
      OFFICIAL: { color: '#e5a93c', rotation: 0, fontSize: 28 },
      VOID: { color: '#991b1b', rotation: -25, fontSize: 44 }
    };

    const cfg = configMap[preset] || { color: '#ef4444', rotation: 0, fontSize: 36 };

    const newStamp: StampElement = {
      id: 'stamp_' + Date.now(),
      type: 'watermark',
      pageIndex: allPages ? -1 : currentPageIndex,
      x: 50,
      y: 50,
      text: preset,
      fontSize: cfg.fontSize,
      color: cfg.color,
      opacity: preset === 'CONFIDENTIAL' || preset === 'DRAFT' ? 0.35 : 0.85,
      rotation: cfg.rotation,
      isPreset: true
    };

    setStamps((prev) => [...prev, newStamp]);
    setSelectedStampId(newStamp.id);
  };

  // Add Custom Text
  const handleAddCustomText = (
    text: string,
    fontSize: number,
    color: string,
    opacity: number,
    rotation: number,
    allPages: boolean
  ) => {
    const newStamp: StampElement = {
      id: 'text_' + Date.now(),
      type: 'text',
      pageIndex: allPages ? -1 : currentPageIndex,
      x: 50,
      y: 40,
      text,
      fontSize,
      color,
      opacity,
      rotation,
      isPreset: false
    };

    setStamps((prev) => [...prev, newStamp]);
    setSelectedStampId(newStamp.id);
  };

  // Add Signature
  const handleSaveSignature = (dataUrl: string) => {
    const newStamp: StampElement = {
      id: 'sig_' + Date.now(),
      type: 'signature',
      pageIndex: currentPageIndex,
      x: 60,
      y: 80,
      width: 25,
      height: 10,
      color: '#1e3a8a',
      opacity: 1.0,
      rotation: 0,
      imageDataUrl: dataUrl
    };

    setStamps((prev) => [...prev, newStamp]);
    setSelectedStampId(newStamp.id);
  };

  // Add Image / Stamp Seal
  const handleUploadImageStamp = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newStamp: StampElement = {
        id: 'img_' + Date.now(),
        type: 'image',
        pageIndex: currentPageIndex,
        x: 50,
        y: 50,
        width: 20,
        height: 15,
        color: '#ffffff',
        opacity: 0.9,
        rotation: 0,
        imageDataUrl: dataUrl
      };

      setStamps((prev) => [...prev, newStamp]);
      setSelectedStampId(newStamp.id);
    };
    reader.readAsDataURL(file);
  };

  // Update stamp position
  const handleUpdateStampPosition = (id: string, x: number, y: number) => {
    setStamps((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  };

  // Update selected stamp properties
  const handleUpdateSelectedStamp = (updates: Partial<StampElement>) => {
    if (!selectedStampId) return;
    setStamps((prev) =>
      prev.map((s) => (s.id === selectedStampId ? { ...s, ...updates } : s))
    );
  };

  // Delete selected stamp
  const handleDeleteSelectedStamp = () => {
    if (!selectedStampId) return;
    setStamps((prev) => prev.filter((s) => s.id !== selectedStampId));
    setSelectedStampId(null);
  };

  // Export modified PDF
  const handleExport = async () => {
    if (!arrayBuffer) return;
    setIsExporting(true);
    try {
      const modifiedBytes = await exportModifiedPdf(
        arrayBuffer,
        stamps,
        pageRotations,
        deletedPages
      );
      triggerDownload(modifiedBytes, fileName || 'document.pdf');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Could not export modified PDF. Please check your console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  // Keyboard shortcut listener (Delete key to remove active stamp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedStampId) {
        // Prevent deleting if user is typing in an input
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        handleDeleteSelectedStamp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStampId]);

  const selectedStamp = stamps.find((s) => s.id === selectedStampId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-app)]">
      {/* Top Navbar */}
      <Navbar
        fileName={fileName}
        onUploadFile={handleUploadFile}
        onLoadSample={handleLoadSample}
        onExport={handleExport}
        isExporting={isExporting}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails Rail */}
        <ThumbnailSidebar
          pages={pages}
          currentPageIndex={currentPageIndex}
          onSelectPage={setCurrentPageIndex}
          onRotatePage={handleRotatePage}
          onDeletePage={handleDeletePage}
          pageRotations={pageRotations}
          deletedPages={deletedPages}
        />

        {/* Center PDF Canvas Viewport */}
        <PdfCanvas
          arrayBuffer={arrayBuffer}
          currentPageIndex={currentPageIndex}
          zoom={zoom}
          rotation={pageRotations[currentPageIndex] || 0}
          stamps={stamps}
          selectedStampId={selectedStampId}
          onSelectStamp={setSelectedStampId}
          onUpdateStampPosition={handleUpdateStampPosition}
          onUploadFile={handleUploadFile}
          onLoadSample={handleLoadSample}
        />

        {/* Right Tools & Inspector Rail */}
        <ToolPanel
          onAddWatermark={handleAddWatermark}
          onAddCustomText={handleAddCustomText}
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
          onUploadImageStamp={handleUploadImageStamp}
          selectedStamp={selectedStamp}
          onUpdateSelectedStamp={handleUpdateSelectedStamp}
          onDeleteSelectedStamp={handleDeleteSelectedStamp}
          currentPageIndex={currentPageIndex}
        />
      </div>

      {/* Signature Pad Drawing Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSaveSignature}
      />
    </div>
  );
};

export default App;

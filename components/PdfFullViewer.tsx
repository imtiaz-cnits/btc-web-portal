"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface PdfFullViewerProps {
  fileUrl: string;
  title?: string;
}

export default function PdfFullViewer({ fileUrl, title }: PdfFullViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pdfDoc: any = null;

    const renderPdf = async () => {
      if (!fileUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const pdfjsLib: any = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/api/files/pdf-worker";

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        if (cancelled) return;

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
        });
        pdfDoc = await loadingTask.promise;
        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";

        const containerWidth = Math.max(container.clientWidth || 960, 320);
        const outputScale = Math.min(Math.max(window.devicePixelRatio || 2, 2), 3);

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdfDoc.getPage(pageNum);
          if (cancelled) return;

          const baseViewport = page.getViewport({ scale: 1 });
          const fitScale = containerWidth / baseViewport.width;
          const renderViewport = page.getViewport({ scale: fitScale * outputScale });

          const pageWrapper = document.createElement("div");
          pageWrapper.className =
            "w-full bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs";

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(renderViewport.width);
          canvas.height = Math.floor(renderViewport.height);
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.setAttribute(
            "aria-label",
            `${title || "Notice PDF"} - Page ${pageNum}`
          );

          const ctx = canvas.getContext("2d");
          if (ctx) {
            await page.render({
              canvasContext: ctx,
              viewport: renderViewport,
            }).promise;
          }

          if (cancelled) return;
          pageWrapper.appendChild(canvas);
          container.appendChild(pageWrapper);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to render PDF full height:", err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
      if (pdfDoc && typeof pdfDoc.destroy === "function") {
        pdfDoc.destroy().catch(() => {});
      }
    };
  }, [fileUrl, title]);

  if (error) {
    return (
      <iframe
        id="notice-frame"
        src={`${fileUrl}#toolbar=0&navpanes=0&view=FitH`}
        className="w-full min-h-[1150px] border border-slate-200 rounded-xl block"
        title={title || "Notice PDF Document"}
      ></iframe>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <span className="text-sm font-semibold">Loading PDF document...</span>
        </div>
      )}
      <div
        ref={containerRef}
        className={`w-full space-y-4 ${loading ? "hidden" : "block"}`}
      />
    </div>
  );
}

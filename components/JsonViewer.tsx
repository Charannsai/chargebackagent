'use client';

import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  title?: string;
  defaultExpanded?: boolean;
  maxHeight?: string;
}

export function JsonViewer({
  data,
  title,
  defaultExpanded = true,
  maxHeight = 'max-h-72',
}: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const jsonString = JSON.stringify(data, null, 2);

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-charcoal-200 bg-[#FFFFFF] shadow-subtle overflow-hidden text-xs my-2 font-mono">
      {title && (
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between px-3 py-2 bg-charcoal-50 hover:bg-charcoal-100/70 cursor-pointer border-b border-charcoal-200 select-none transition-colors"
        >
          <div className="flex items-center gap-1.5 text-charcoal-700 font-medium">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" />
            )}
            <span>{title}</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-[11px] text-charcoal-500 hover:text-charcoal-900 bg-white px-2 py-0.5 rounded border border-charcoal-200 hover:border-charcoal-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-lime-600" />
                <span className="text-lime-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-charcoal-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {isExpanded && (
        <div className={`p-3 overflow-auto ${maxHeight} bg-white text-charcoal-800 leading-relaxed`}>
          <pre className="whitespace-pre font-mono text-[11.5px]">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
}

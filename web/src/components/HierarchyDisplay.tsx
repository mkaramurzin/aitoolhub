"use client";

import React from "react";

export interface HierarchyDisplayProps {
  className?: string;
}

/**
 * Placeholder hierarchy visualization using static SVG elements.
 * This component provides a stand‑in frame for the eventual
 * AI hierarchy display.
 */
export function HierarchyDisplay({ className }: HierarchyDisplayProps) {
  const width = 600;
  const height = 260;

  return (
    <div
      className={`flex w-full items-center justify-center ${className ?? ""}`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="rounded border bg-muted"
      >
        {/* edges */}
        <g stroke="#94a3b8" strokeWidth="2" fill="none">
          <line x1="300" y1="40" x2="150" y2="110" />
          <line x1="300" y1="40" x2="450" y2="110" />
          <line x1="150" y1="110" x2="80" y2="190" />
          <line x1="150" y1="110" x2="220" y2="190" />
          <line x1="450" y1="110" x2="380" y2="190" />
          <line x1="450" y1="110" x2="520" y2="190" />
        </g>

        {/* root node */}
        <g fill="#2563eb" stroke="#fff" strokeWidth="2">
          <circle cx="300" cy="40" r="20" />
        </g>
        <text x="300" y="45" textAnchor="middle" fontSize="12" fill="#fff">
          Root
        </text>

        {/* level 1 */}
        <g fill="#4f46e5" stroke="#fff" strokeWidth="2">
          <circle cx="150" cy="110" r="18" />
          <circle cx="450" cy="110" r="18" />
        </g>
        <text x="150" y="115" textAnchor="middle" fontSize="10" fill="#fff">
          Child 1
        </text>
        <text x="450" y="115" textAnchor="middle" fontSize="10" fill="#fff">
          Child 2
        </text>

        {/* level 2 */}
        <g fill="#7c3aed" stroke="#fff" strokeWidth="2">
          <circle cx="80" cy="190" r="14" />
          <circle cx="220" cy="190" r="14" />
          <circle cx="380" cy="190" r="14" />
          <circle cx="520" cy="190" r="14" />
        </g>
        <text x="80" y="194" textAnchor="middle" fontSize="8" fill="#fff">
          A
        </text>
        <text x="220" y="194" textAnchor="middle" fontSize="8" fill="#fff">
          B
        </text>
        <text x="380" y="194" textAnchor="middle" fontSize="8" fill="#fff">
          C
        </text>
        <text x="520" y="194" textAnchor="middle" fontSize="8" fill="#fff">
          D
        </text>
      </svg>
    </div>
  );
}

export default HierarchyDisplay;

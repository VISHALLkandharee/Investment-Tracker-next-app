// src/components/dashboard/StatsCard.tsx
"use client";

import { memo } from "react";

interface StatsCardProps {
  label: string;
  value: string;
  colorClass?: string;
  subText?: string;
  subColorClass?: string;
}

/**
 * A reusable stat card for displaying dashboard KPIs.
 * Wrapped in `memo` to prevent unnecessary re-renders when parent state changes
 * (e.g., a modal opening won't cause stat cards to re-render).
 */
const StatsCard = memo(function StatsCard({
  label,
  value,
  colorClass = "text-gray-800",
  subText,
  subColorClass,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
        {label}
      </p>
      <p className={`text-xl sm:text-3xl font-bold ${colorClass}`}>
        {value}
      </p>
      {subText && (
        <p className={`text-xs sm:text-sm font-medium ${subColorClass || colorClass} mt-1`}>
          {subText}
        </p>
      )}
    </div>
  );
});

export default StatsCard;

import React from 'react';
import { FileText, Plus, Search, RefreshCw } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FileText,
  title = "No Records Available",
  description = "There are no records to display at the moment.",
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  clearFiltersLabel = "Clear Filters",
  onClearFilters,
  className = ""
}) {
  return (
    <div className={`card p-10 flex flex-col items-center justify-center text-center bg-white border border-gray-200 rounded-2xl shadow-2xs ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-2xs">
        <Icon size={32} />
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 border border-gray-200 transition"
          >
            <RefreshCw size={14} />
            <span>{clearFiltersLabel}</span>
          </button>
        )}

        {onAction && actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="btn-primary text-xs font-bold px-5 py-2.5 shadow-md shadow-red-200 flex items-center gap-2"
          >
            <ActionIcon size={16} />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}

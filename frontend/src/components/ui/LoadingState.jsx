import React from 'react';

export default function LoadingState({ message = "Loading data...", minHeight = "min-h-[40vh]" }) {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight} gap-3`}>
      <div className="spinner w-10 h-10 border-red-600" />
      <p className="text-xs font-bold text-gray-500 animate-pulse">{message}</p>
    </div>
  );
}

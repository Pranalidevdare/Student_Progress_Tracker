import React from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react';

export default function ErrorState({
  error,
  onRetry,
  title,
  message,
  className = ""
}) {
  const getErrorInfo = () => {
    const status = error?.response?.status;
    if (status === 401) {
      return {
        icon: ShieldAlert,
        title: title || "Session Expired",
        description: message || "Your session has expired. Please log in again to continue."
      };
    }
    if (status === 403) {
      return {
        icon: ShieldAlert,
        title: title || "Access Denied",
        description: message || "You do not have permission to view or manage this information."
      };
    }
    if (status === 404) {
      return {
        icon: AlertTriangle,
        title: title || "Records Not Found",
        description: message || "The requested data or endpoint could not be found on the server."
      };
    }
    if (status === 500) {
      return {
        icon: AlertTriangle,
        title: title || "Server Error",
        description: message || "Something went wrong on the server while loading data. Please try again."
      };
    }
    if (error?.message === "Network Error" || !error?.response) {
      return {
        icon: WifiOff,
        title: title || "Connection Error",
        description: message || "Unable to connect to the backend server. Please verify your connection."
      };
    }
    return {
      icon: AlertTriangle,
      title: title || "Unable to Load Data",
      description: message || error?.response?.data?.message || "An unexpected error occurred while fetching information."
    };
  };

  const info = getErrorInfo();
  const Icon = info.icon;

  return (
    <div className={`card p-10 flex flex-col items-center justify-center text-center bg-red-50/50 border border-red-200 rounded-2xl shadow-2xs ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-4 border border-red-200 shadow-2xs">
        <Icon size={32} />
      </div>

      <h3 className="text-base font-bold text-red-950 mb-1">{info.title}</h3>
      <p className="text-xs text-red-700 max-w-md mx-auto mb-6 leading-relaxed">
        {info.description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-primary text-xs font-bold px-5 py-2.5 shadow-md shadow-red-200 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          <span>Retry Loading</span>
        </button>
      )}
    </div>
  );
}

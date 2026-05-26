import { ErrorDetail } from "../utils/errorFormatter";

interface ErrorDisplayProps {
  error: ErrorDetail | null;
  onActionClick?: () => void;
  actionText?: string;
  actionLoading?: boolean;
}

export default function ErrorDisplay({ 
  error, 
  onActionClick, 
  actionText, 
  actionLoading 
}: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div 
      className="bg-rose-50 border border-rose-200 dark:bg-red-950/20 dark:border-red-500/30 rounded-xl p-4 mb-6 text-sm relative overflow-hidden transition-all duration-300"
      role="alert"
      aria-live="assertive"
    >
      {/* Decorative vertical red alert border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 dark:bg-red-500/80" />
      
      <div className="pl-2">
        <h3 className="font-bold text-rose-700 dark:text-red-400 text-sm tracking-wide uppercase flex items-center mb-2">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error.whatHappened}
        </h3>
        
        <p className="text-slate-600 dark:text-gray-300 mb-2 leading-relaxed text-xs">
          {error.whyItHappened}
        </p>
        
        <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-xs">
          <span className="text-[#D8AB44] font-medium">{error.whatToDoNext}</span>
        </p>

        {onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            disabled={actionLoading}
            className="mt-3 bg-[#D8AB44] hover:bg-[#bfa03f] text-[#0B0B0B] font-bold py-1.5 px-3 rounded-lg text-[11px] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-lg shadow-yellow-500/10 cursor-pointer"
          >
            {actionLoading ? "Sending..." : actionText || "Take Action"}
          </button>
        )}
      </div>
    </div>
  );
}

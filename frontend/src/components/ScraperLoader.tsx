import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface LoadingStage {
  label: string;
  status: 'idle' | 'loading' | 'success' | 'error';
}

interface ScraperLoaderProps {
  stages: LoadingStage[];
}

export default function ScraperLoader({ stages }: ScraperLoaderProps) {
  return (
    <section className="glass-panel rounded-2xl p-6 md:p-8 mb-8 border-stone-200 shadow-md max-w-2xl mx-auto animate-pulse-slow">
      <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2 font-sans">
        <RefreshCw className="h-5 w-5 text-orange-500 animate-spin" />
        Analyzing Storefront Ecosystem...
      </h2>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-4 text-sm font-sans">
            {stage.status === 'idle' && (
              <div className="h-5 w-5 rounded-full border border-stone-200 bg-stone-50 flex items-center justify-center text-xs text-stone-455 font-mono">
                {index + 1}
              </div>
            )}
            {stage.status === 'loading' && (
              <div className="h-5 w-5 flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {stage.status === 'success' && (
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            )}
            {stage.status === 'error' && (
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            )}
            <span className={`font-medium ${
              stage.status === 'loading' ? 'text-orange-600 font-bold' :
              stage.status === 'success' ? 'text-stone-800' :
              stage.status === 'error' ? 'text-rose-650' : 'text-stone-400'
            }`}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

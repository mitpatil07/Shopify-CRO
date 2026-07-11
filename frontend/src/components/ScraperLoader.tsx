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
    <section className="glass-panel rounded-2xl p-6 md:p-8 mb-8 border-indigo-500/10 shadow-lg max-w-2xl mx-auto animate-pulse-slow">
      <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2 font-sans">
        <RefreshCw className="h-5 w-5 text-indigo-500 animate-spin" />
        Analyzing Storefront Ecosystem...
      </h2>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-4 text-sm font-sans">
            {stage.status === 'idle' && (
              <div className="h-5 w-5 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center text-xs text-slate-700 font-mono">
                {index + 1}
              </div>
            )}
            {stage.status === 'loading' && (
              <div className="h-5 w-5 flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {stage.status === 'success' && (
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            )}
            {stage.status === 'error' && (
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
            )}
            <span className={`font-medium ${stage.status === 'loading' ? 'text-slate-100 font-semibold' : 'text-slate-400'}`}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { FormEvent } from 'react';
import { Search, BarChart2, RefreshCw, ArrowRight } from 'lucide-react';

interface AuditFormProps {
  storeUrl: string;
  setStoreUrl: (url: string) => void;
  competitorUrl: string;
  setCompetitorUrl: (url: string) => void;
  isAuditing: boolean;
  onSubmit: (e: FormEvent) => void;
}

export default function AuditForm({
  storeUrl,
  setStoreUrl,
  competitorUrl,
  setCompetitorUrl,
  isAuditing,
  onSubmit,
}: AuditFormProps) {
  return (
    <section className="glass-panel rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Target URL */}
          <div>
            <label htmlFor="target-url" className="block text-sm font-medium text-slate-300 mb-2">
              Shopify URL to Audit
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input
                id="target-url"
                type="text"
                required
                placeholder="https://saddlebackleather.com"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                disabled={isAuditing}
                className="block w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-60 transition-all font-sans text-sm"
              />
            </div>
          </div>

          {/* Competitor URL */}
          <div>
            <label htmlFor="competitor-url" className="block text-sm font-medium text-slate-300 mb-2">
              Compare Competitor Store (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BarChart2 className="h-5 w-5 text-slate-500" />
              </div>
              <input
                id="competitor-url"
                type="text"
                placeholder="https://bulletproof.com"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                disabled={isAuditing}
                className="block w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-60 transition-all font-sans text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            id="submit-audit"
            type="submit"
            disabled={isAuditing || !storeUrl}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed group text-sm"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating Audit...
              </>
            ) : (
              <>
                Analyze Store
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

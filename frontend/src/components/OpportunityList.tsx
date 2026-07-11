import { useState } from 'react';
import { Award, ChevronDown, ChevronUp, RefreshCw, Zap } from 'lucide-react';
import type { Opportunity, ExperimentBrief } from '../types';

interface OpportunityListProps {
  opportunities: Opportunity[];
  selectedOpp: Opportunity | null;
  setSelectedOpp: (opp: Opportunity | null) => void;
  generateBrief: (opp: Opportunity) => void;
  briefs: Record<string, ExperimentBrief>;
  loadingBrief: string | null;
}

export default function OpportunityList({
  opportunities,
  selectedOpp,
  setSelectedOpp,
  generateBrief,
  briefs,
  loadingBrief,
}: OpportunityListProps) {
  const [showAllOpportunities, setShowAllOpportunities] = useState(false);

  const getAreaColor = (area: string) => {
    switch (area) {
      case 'catalog': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'collections': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pdp': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'cart': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'merchandising': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'homepage': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 12) return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
    if (score >= 6) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
  };

  const renderCard = (opp: Opportunity, index: number) => (
    <div
      key={opp.finding}
      className={`glass-panel rounded-xl p-5 border-l-4 transition-all duration-200 font-sans ${
        opp.area === 'catalog' ? 'border-l-amber-500' :
        opp.area === 'collections' ? 'border-l-blue-500' :
        opp.area === 'pdp' ? 'border-l-purple-500' :
        opp.area === 'cart' ? 'border-l-rose-500' :
        opp.area === 'homepage' ? 'border-l-sky-500' : 'border-l-emerald-500'
      } ${selectedOpp?.finding === opp.finding ? 'ring-1 ring-indigo-500' : 'glass-panel-hover'}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Rank #{index + 1}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getAreaColor(opp.area)}`}>
              {opp.area}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getScoreColor(opp.priority_score)}`}>
              Priority Score: {opp.priority_score}
            </span>
          </div>
          
          <h3 className="text-base font-bold text-slate-100">{opp.finding}</h3>
          <p className="text-slate-400 text-sm line-clamp-2">{opp.recommendation}</p>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-900 flex-shrink-0">
          <div className="text-center px-2">
            <div className="text-slate-500 text-[9px] uppercase font-bold">Impact</div>
            <div className="text-slate-200 text-sm font-bold font-sans">{opp.impact}/5</div>
          </div>
          <div className="border-r border-slate-800 h-6"></div>
          <div className="text-center px-2">
            <div className="text-slate-500 text-[9px] uppercase font-bold">Conf</div>
            <div className="text-slate-200 text-sm font-bold font-sans">{opp.confidence}/5</div>
          </div>
          <div className="border-r border-slate-800 h-6"></div>
          <div className="text-center px-2">
            <div className="text-slate-500 text-[9px] uppercase font-bold">Effort</div>
            <div className="text-slate-200 text-sm font-bold font-sans">{opp.effort}/5</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex md:flex-col justify-end gap-2 flex-shrink-0">
          <button
            onClick={() => setSelectedOpp(selectedOpp?.finding === opp.finding ? null : opp)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold"
          >
            {selectedOpp?.finding === opp.finding ? 'Hide Details' : 'View Action'}
          </button>
        </div>
      </div>

      {/* Slide-out details */}
      {selectedOpp?.finding === opp.finding && (
        <div className="mt-5 pt-5 border-t border-slate-800/80 animate-slide-up space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">CRO Recommendation</h4>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-sm text-slate-300 leading-relaxed">
                {opp.recommendation}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Catalog Evidence Citations</h4>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-2">
                {opp.evidence_refs.length > 0 ? (
                  opp.evidence_refs.map((ref, rIdx) => (
                    <div key={rIdx} className="flex gap-2 items-start text-xs text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                      <span>{ref}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No specific products isolated. Recommendation based on aggregated metadata indexes.</p>
                )}
              </div>
            </div>
          </div>

          {/* Test Blueprint Trigger */}
          <div className="pt-4 border-t border-slate-900 flex justify-between items-center flex-wrap gap-4">
            <span className="text-xs text-slate-500">
              Generate a test blueprint layout including hypothesis statements, tracking parameters, and minimum runtime.
            </span>
            <button
              onClick={() => generateBrief(opp)}
              disabled={loadingBrief === opp.finding}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md"
            >
              {loadingBrief === opp.finding ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Creating Brief...
                </>
              ) : briefs[opp.finding] ? (
                'Brief Created (See Below)'
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  Generate Experiment Brief
                </>
              )}
            </button>
          </div>

          {/* Experiment Brief display */}
          {briefs[opp.finding] && (
            <div className="bg-gradient-to-br from-indigo-950/20 to-purple-950/10 p-5 rounded-xl border border-indigo-500/20 space-y-4 animate-slide-up">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-400 animate-pulse" />
                A/B Experiment Brief: {opp.area.toUpperCase()} Test
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Hypothesis</span>
                  <p className="text-slate-200 bg-slate-950/50 p-2.5 rounded border border-slate-900">{briefs[opp.finding].hypothesis}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Variant Description</span>
                  <p className="text-slate-200 bg-slate-950/50 p-2.5 rounded border border-slate-900">{briefs[opp.finding].variantDescription}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Primary Metric</span>
                  <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold">
                    {briefs[opp.finding].primaryMetric}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Minimum Runtime</span>
                  <span className="inline-block px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-semibold">
                    {briefs[opp.finding].minimumRuntime}
                  </span>
                </div>
              </div>

              <div className="text-xs font-sans">
                <span className="text-slate-400 block mb-2 font-semibold uppercase tracking-wider text-[10px]">Shopify Step-by-Step Implementation</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  {briefs[opp.finding].implementationSteps.map((step, sIdx) => (
                    <li key={sIdx} className="pl-1 leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-indigo-400" />
        <h2 className="text-xl font-bold text-slate-100 font-sans">Prioritized CRO Opportunities</h2>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400 font-mono">
          Formula: (Impact * Confidence) / Effort
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {opportunities.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm font-sans">
            No audits to show. Input a Shopify store URL above.
          </div>
        ) : (
          <>
            {opportunities.slice(0, 10).map((opp, index) => renderCard(opp, index))}

            {opportunities.length > 10 && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => setShowAllOpportunities(!showAllOpportunities)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold font-sans animate-fade-in"
                >
                  {showAllOpportunities ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide Remaining {opportunities.length - 10} Opportunities
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show Remaining {opportunities.length - 10} Opportunities
                    </>
                  )}
                </button>
              </div>
            )}

            {showAllOpportunities && opportunities.slice(10).map((opp, index) => renderCard(opp, index + 10))}
          </>
        )}
      </div>
    </section>
  );
}

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
      case 'catalog': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'collections': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pdp': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cart': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'merchandising': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'homepage': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 12) return 'text-rose-700 border-rose-200 bg-rose-50 font-bold';
    if (score >= 6) return 'text-orange-700 border-orange-200 bg-orange-50 font-bold';
    return 'text-emerald-700 border-emerald-200 bg-emerald-50 font-bold';
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
      } ${selectedOpp?.finding === opp.finding ? 'ring-2 ring-orange-500' : 'glass-panel-hover'}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-600">
              Rank #{index + 1}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getAreaColor(opp.area)}`}>
              {opp.area}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getScoreColor(opp.priority_score)}`}>
              Priority Score: {opp.priority_score}
            </span>
          </div>
          
          <h3 className="text-base font-bold text-stone-900">{opp.finding}</h3>
          <p className="text-stone-650 text-sm line-clamp-2">{opp.recommendation}</p>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-lg border border-stone-150 flex-shrink-0 shadow-sm">
          <div className="text-center px-2">
            <div className="text-stone-500 text-[9px] uppercase font-bold">Impact</div>
            <div className="text-stone-900 text-sm font-bold font-sans">{opp.impact}/5</div>
          </div>
          <div className="border-r border-stone-200 h-6"></div>
          <div className="text-center px-2">
            <div className="text-stone-500 text-[9px] uppercase font-bold">Conf</div>
            <div className="text-stone-900 text-sm font-bold font-sans">{opp.confidence}/5</div>
          </div>
          <div className="border-r border-stone-200 h-6"></div>
          <div className="text-center px-2">
            <div className="text-stone-500 text-[9px] uppercase font-bold">Effort</div>
            <div className="text-stone-900 text-sm font-bold font-sans">{opp.effort}/5</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex md:flex-col justify-end gap-2 flex-shrink-0">
          <button
            onClick={() => setSelectedOpp(selectedOpp?.finding === opp.finding ? null : opp)}
            className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 hover:text-stone-900 text-stone-700 rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            {selectedOpp?.finding === opp.finding ? 'Hide Details' : 'View Action'}
          </button>
        </div>
      </div>

      {/* Slide-out details */}
      {selectedOpp?.finding === opp.finding && (
        <div className="mt-5 pt-5 border-t border-stone-150 animate-slide-up space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">CRO Recommendation</h4>
              <div className="bg-stone-50/55 p-4 rounded-xl border border-stone-150 text-sm text-stone-700 leading-relaxed shadow-sm">
                {opp.recommendation}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Catalog Evidence Citations</h4>
              <div className="bg-stone-50/55 p-4 rounded-xl border border-stone-150 space-y-2 shadow-sm">
                {opp.evidence_refs.length > 0 ? (
                  opp.evidence_refs.map((ref, rIdx) => (
                    <div key={rIdx} className="flex gap-2 items-start text-xs text-stone-605">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></span>
                      <span>{ref}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 italic">No specific products isolated. Recommendation based on aggregated metadata indexes.</p>
                )}
              </div>
            </div>
          </div>

          {/* Test Blueprint Trigger */}
          <div className="pt-4 border-t border-stone-150 flex justify-between items-center flex-wrap gap-4">
            <span className="text-xs text-stone-500 font-medium">
              Generate a test blueprint layout including hypothesis statements, tracking parameters, and minimum runtime.
            </span>
            <button
              onClick={() => generateBrief(opp)}
              disabled={loadingBrief === opp.finding}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-500/10"
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
            <div className="bg-orange-50/20 p-5 rounded-xl border border-orange-200 space-y-4 animate-slide-up shadow-sm">
              <h4 className="text-sm font-bold text-orange-700 flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                A/B Experiment Brief: {opp.area.toUpperCase()} Test
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Hypothesis</span>
                  <p className="text-stone-850 bg-white p-2.5 rounded border border-stone-150 shadow-sm">{briefs[opp.finding].hypothesis}</p>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Variant Description</span>
                  <p className="text-stone-850 bg-white p-2.5 rounded border border-stone-150 shadow-sm">{briefs[opp.finding].variantDescription}</p>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Primary Metric</span>
                  <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-250 rounded font-semibold shadow-sm">
                    {briefs[opp.finding].primaryMetric}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Minimum Runtime</span>
                  <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-250 rounded font-semibold shadow-sm">
                    {briefs[opp.finding].minimumRuntime}
                  </span>
                </div>
              </div>

              <div className="text-xs font-sans">
                <span className="text-stone-500 block mb-2 font-semibold uppercase tracking-wider text-[10px]">Shopify Step-by-Step Implementation</span>
                <ol className="list-decimal list-inside space-y-1.5 text-stone-700">
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
        <Award className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-bold text-stone-900 font-sans">Prioritized CRO Opportunities</h2>
        <span className="text-xs px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-655 font-mono font-semibold">
          Formula: (Impact * Confidence) / Effort
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {opportunities.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-stone-200 rounded-xl text-stone-400 bg-white text-sm font-sans shadow-sm">
            No audits to show. Input a Shopify store URL above.
          </div>
        ) : (
          <>
            {opportunities.slice(0, 10).map((opp, index) => renderCard(opp, index))}

            {opportunities.length > 10 && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => setShowAllOpportunities(!showAllOpportunities)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-all text-xs font-bold font-sans shadow-sm animate-fade-in"
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

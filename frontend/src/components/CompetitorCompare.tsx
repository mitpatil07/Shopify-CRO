import { BarChart2, CheckCircle, AlertCircle } from 'lucide-react';
import type { StoreEvidence, ComparisonResult } from '../types';

interface CompetitorCompareProps {
  evidence: StoreEvidence;
  competitorEvidence: StoreEvidence;
  comparisonResult: ComparisonResult;
}

export default function CompetitorCompare({
  evidence,
  competitorEvidence,
  comparisonResult,
}: CompetitorCompareProps) {
  return (
    <section className="space-y-6 pt-6 border-t border-slate-800 animate-slide-up">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-5 w-5 text-indigo-400" />
        <h2 className="text-xl font-bold text-slate-100 font-sans">Competitor Comparison Report</h2>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
          {evidence.storeUrl.replace(/^https?:\/\//, '')} vs {competitorEvidence.storeUrl.replace(/^https?:\/\//, '')}
        </span>
      </div>

      {/* Side-by-Side Metric Comparison Table */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-slate-800">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
              <th className="p-4">CRO Ecosystem Metric</th>
              <th className="p-4 text-indigo-400">Target Store (Store 1)</th>
              <th className="p-4 text-purple-400">Competitor Store (Store 2)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="p-4 font-medium">Store URL</td>
              <td className="p-4 break-all text-indigo-300">{evidence.storeUrl}</td>
              <td className="p-4 break-all text-purple-300">{competitorEvidence.storeUrl}</td>
            </tr>
            <tr className="bg-slate-900/10">
              <td className="p-4 font-medium">Catalog Breadth (Sample count)</td>
              <td className="p-4 font-mono font-bold text-slate-200">{evidence.productCount} products</td>
              <td className="p-4 font-mono font-bold text-slate-200">{competitorEvidence.productCount} products</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">Out of Stock Rate</td>
              <td className="p-4 font-mono text-slate-200">
                {evidence.productCount > 0 ? ((evidence.outOfStockCount / evidence.productCount) * 100).toFixed(1) : 0}%
              </td>
              <td className="p-4 font-mono text-slate-200">
                {competitorEvidence.productCount > 0 ? ((competitorEvidence.outOfStockCount / competitorEvidence.productCount) * 100).toFixed(1) : 0}%
              </td>
            </tr>
            <tr className="bg-slate-900/10">
              <td className="p-4 font-medium">Average Catalog Price</td>
              <td className="p-4 font-mono text-slate-200">${evidence.priceSpread.avg}</td>
              <td className="p-4 font-mono text-slate-200">${competitorEvidence.priceSpread.avg}</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">Price Range Spread</td>
              <td className="p-4 font-mono text-slate-200">${evidence.priceSpread.min} - ${evidence.priceSpread.max}</td>
              <td className="p-4 font-mono text-slate-200">${competitorEvidence.priceSpread.min} - ${competitorEvidence.priceSpread.max}</td>
            </tr>
            <tr className="bg-slate-900/10">
              <td className="p-4 font-medium">Avg Variants Per Product</td>
              <td className="p-4 font-mono text-slate-200">{evidence.variantsPerProductAvg}</td>
              <td className="p-4 font-mono text-slate-200">{competitorEvidence.variantsPerProductAvg}</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">Thin Product Descriptions (&lt; 20 words)</td>
              <td className="p-4 font-mono text-slate-200">
                {evidence.thinDescriptionsCount} ({evidence.productCount > 0 ? ((evidence.thinDescriptionsCount / evidence.productCount) * 100).toFixed(1) : 0}%)
              </td>
              <td className="p-4 font-mono text-slate-200">
                {competitorEvidence.thinDescriptionsCount} ({competitorEvidence.productCount > 0 ? ((competitorEvidence.thinDescriptionsCount / competitorEvidence.productCount) * 100).toFixed(1) : 0}%)
              </td>
            </tr>
            <tr className="bg-slate-900/10">
              <td className="p-4 font-medium">Homepage Trust Badges</td>
              <td className="p-4">
                <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[9px] ${evidence.homepageHTMLSummary.hasTrustBadges ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {evidence.homepageHTMLSummary.hasTrustBadges ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="p-4">
                <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[9px] ${competitorEvidence.homepageHTMLSummary.hasTrustBadges ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {competitorEvidence.homepageHTMLSummary.hasTrustBadges ? 'Yes' : 'No'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gemini Competitive Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Catalog Analysis */}
        <div className="glass-panel rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Catalog & Pricing Strategy</h4>
          <div className="space-y-4 text-sm leading-relaxed text-slate-300 font-sans">
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/60">
              <strong className="text-slate-200 block text-xs mb-1 font-semibold uppercase">Catalog Breadth:</strong>
              {comparisonResult.catalogBreadthAnalysis}
            </div>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/60">
              <strong className="text-slate-200 block text-xs mb-1 font-semibold uppercase">Pricing Position:</strong>
              {comparisonResult.pricingPositionAnalysis}
            </div>
          </div>
        </div>

        {/* Merchandising Gaps & Strategic Wins */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 font-sans">Merchandising Gaps (Target Store Disadvantages)</h4>
            <div className="space-y-2">
              {comparisonResult.merchandisingGaps.map((gap, gIdx) => (
                <div key={gIdx} className="bg-slate-950/40 p-2.5 rounded border border-rose-500/10 flex gap-2 items-start text-xs text-slate-300 font-sans">
                  <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 font-sans">Target Store Wins (Competitive Advantages)</h4>
            <div className="space-y-2">
              {comparisonResult.strategicWins.map((win, wIdx) => (
                <div key={wIdx} className="bg-slate-950/40 p-2.5 rounded border border-emerald-500/10 flex gap-2 items-start text-xs text-slate-300 font-sans">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{win}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="lg:col-span-2 bg-gradient-to-r from-indigo-950/20 to-purple-950/20 p-5 rounded-xl border border-indigo-500/20 font-sans">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Strategic Summary</h4>
          <p className="text-slate-200 text-sm leading-relaxed">{comparisonResult.summary}</p>
        </div>

      </div>
    </section>
  );
}

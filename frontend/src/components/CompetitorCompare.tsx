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
    <section className="space-y-6 pt-6 border-t border-stone-200 animate-slide-up">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-bold text-stone-900 font-sans">Competitor Comparison Report</h2>
        <span className="text-xs px-2 py-0.5 rounded bg-stone-50 border border-stone-200 text-stone-600 font-mono font-semibold">
          {evidence.storeUrl.replace(/^https?:\/\//, '')} vs {competitorEvidence.storeUrl.replace(/^https?:\/\//, '')}
        </span>
      </div>

      {/* Side-by-Side Metric Comparison Table */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-sm border border-stone-200">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-605 font-bold">
              <th className="p-4 text-stone-700">CRO Ecosystem Metric</th>
              <th className="p-4 text-orange-600">Target Store (Store 1)</th>
              <th className="p-4 text-stone-800">Competitor Store (Store 2)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150 text-stone-700">
            <tr>
              <td className="p-4 font-medium">Store URL</td>
              <td className="p-4 break-all text-orange-600 font-medium">{evidence.storeUrl}</td>
              <td className="p-4 break-all text-stone-600 font-medium">{competitorEvidence.storeUrl}</td>
            </tr>
            <tr className="bg-stone-50/20">
              <td className="p-4 font-medium">Catalog Breadth (Sample count)</td>
              <td className="p-4 font-mono font-bold text-stone-900">{evidence.productCount} products</td>
              <td className="p-4 font-mono font-bold text-stone-900">{competitorEvidence.productCount} products</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">Out of Stock Rate</td>
              <td className="p-4 font-mono text-stone-900 font-semibold">
                {evidence.productCount > 0 ? ((evidence.outOfStockCount / evidence.productCount) * 100).toFixed(1) : 0}%
              </td>
              <td className="p-4 font-mono text-stone-900 font-semibold">
                {competitorEvidence.productCount > 0 ? ((competitorEvidence.outOfStockCount / competitorEvidence.productCount) * 100).toFixed(1) : 0}%
              </td>
            </tr>
            <tr className="bg-stone-50/20">
              <td className="p-4 font-medium">Average Catalog Price</td>
              <td className="p-4 font-mono text-stone-900 font-semibold">${evidence.priceSpread.avg}</td>
              <td className="p-4 font-mono text-stone-900 font-semibold">${competitorEvidence.priceSpread.avg}</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">Price Range Spread</td>
              <td className="p-4 font-mono text-stone-900">${evidence.priceSpread.min} - ${evidence.priceSpread.max}</td>
              <td className="p-4 font-mono text-stone-900">${competitorEvidence.priceSpread.min} - ${competitorEvidence.priceSpread.max}</td>
            </tr>
            <tr className="bg-stone-50/20">
              <td className="p-4 font-medium">Avg Variants Per Product</td>
              <td className="p-4 font-mono text-stone-900">{evidence.variantsPerProductAvg}</td>
              <td className="p-4 font-mono text-stone-900">{competitorEvidence.variantsPerProductAvg}</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">Thin Product Descriptions (&lt; 20 words)</td>
              <td className="p-4 font-mono text-stone-900">
                {evidence.thinDescriptionsCount} ({evidence.productCount > 0 ? ((evidence.thinDescriptionsCount / evidence.productCount) * 100).toFixed(1) : 0}%)
              </td>
              <td className="p-4 font-mono text-stone-900">
                {competitorEvidence.thinDescriptionsCount} ({competitorEvidence.productCount > 0 ? ((competitorEvidence.thinDescriptionsCount / competitorEvidence.productCount) * 100).toFixed(1) : 0}%)
              </td>
            </tr>
            <tr className="bg-stone-50/20">
              <td className="p-4 font-medium">Homepage Trust Badges</td>
              <td className="p-4">
                <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[9px] ${evidence.homepageHTMLSummary.hasTrustBadges ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {evidence.homepageHTMLSummary.hasTrustBadges ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="p-4">
                <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[9px] ${competitorEvidence.homepageHTMLSummary.hasTrustBadges ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
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
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider font-sans">Catalog & Pricing Strategy</h4>
          <div className="space-y-4 text-sm leading-relaxed text-stone-700 font-sans">
            <div className="bg-stone-50/50 p-3 rounded-lg border border-stone-150 shadow-sm">
              <strong className="text-stone-850 block text-xs mb-1 font-bold uppercase">Catalog Breadth:</strong>
              {comparisonResult.catalogBreadthAnalysis}
            </div>
            <div className="bg-stone-50/50 p-3 rounded-lg border border-stone-150 shadow-sm">
              <strong className="text-stone-850 block text-xs mb-1 font-bold uppercase">Pricing Position:</strong>
              {comparisonResult.pricingPositionAnalysis}
            </div>
          </div>
        </div>

        {/* Merchandising Gaps & Strategic Wins */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-rose-650 uppercase tracking-wider mb-2 font-sans">Merchandising Gaps (Target Store Disadvantages)</h4>
            <div className="space-y-2">
              {comparisonResult.merchandisingGaps.map((gap, gIdx) => (
                <div key={gIdx} className="bg-rose-50/30 p-2.5 rounded border border-rose-200/50 flex gap-2 items-start text-xs text-stone-700 font-sans shadow-sm">
                  <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-emerald-650 uppercase tracking-wider mb-2 font-sans">Target Store Wins (Competitive Advantages)</h4>
            <div className="space-y-2">
              {comparisonResult.strategicWins.map((win, wIdx) => (
                <div key={wIdx} className="bg-emerald-50/30 p-2.5 rounded border border-emerald-200/50 flex gap-2 items-start text-xs text-stone-700 font-sans shadow-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-650 flex-shrink-0 mt-0.5" />
                  <span>{win}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="lg:col-span-2 bg-orange-50/20 p-5 rounded-xl border border-orange-200 font-sans shadow-sm">
          <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Strategic Summary</h4>
          <p className="text-stone-850 text-sm leading-relaxed font-medium">{comparisonResult.summary}</p>
        </div>

      </div>
    </section>
  );
}

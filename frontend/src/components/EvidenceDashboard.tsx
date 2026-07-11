import { Info, CheckCircle, AlertCircle, Layers, DollarSign, Flame, FileText, Layout, Tag } from 'lucide-react';
import type { StoreEvidence } from '../types';

interface EvidenceDashboardProps {
  evidence: StoreEvidence;
}

export default function EvidenceDashboard({ evidence }: EvidenceDashboardProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-bold text-stone-900 font-sans">Audit Data Evidence</h2>
        <span className="text-xs px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-600 uppercase font-mono font-semibold">
          {evidence.isShopify ? 'Shopify Store' : 'Non-Shopify / Unconfirmed'}
        </span>
      </div>

      {/* Scraping Status Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(evidence.scrapingStatus).map(([key, val]) => (
          <div key={key} className="bg-stone-50 border border-stone-150 rounded-xl p-3 flex flex-col shadow-sm">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold font-sans">{key}</span>
            <span className={`text-xs mt-1 font-semibold flex items-center gap-1 ${
              val === 'success' ? 'text-emerald-650 font-bold' : 
              val === 'blocked' ? 'text-amber-600 font-bold' : 'text-stone-500'
            }`}>
              {val === 'success' && <CheckCircle className="h-3 w-3 text-emerald-600" />}
              {val === 'blocked' && <AlertCircle className="h-3 w-3 text-amber-500" />}
              {val.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Evidence Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Product Catalog Stats */}
        <div className="glass-panel rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="text-stone-500 text-xs font-semibold font-sans">Catalog Depth</div>
            <div className="text-2xl font-extrabold font-sans text-stone-900">{evidence.productCount} products</div>
            <div className="text-[10px] text-stone-400 mt-0.5 font-sans">Sampled first 250</div>
          </div>
        </div>

        {/* Price Spread */}
        <div className="glass-panel rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-650 border border-emerald-100 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <div className="text-stone-500 text-xs font-semibold font-sans">Average Price</div>
            <div className="text-2xl font-extrabold font-sans text-stone-900">
              ${evidence.priceSpread.avg}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5 font-sans">
              Range: ${evidence.priceSpread.min} - ${evidence.priceSpread.max}
            </div>
          </div>
        </div>

        {/* Out of Stock Rate */}
        <div className="glass-panel rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="text-stone-500 text-xs font-semibold font-sans">Out of Stock Rate</div>
            <div className="text-2xl font-extrabold font-sans text-stone-900">
              {evidence.productCount > 0 ? ((evidence.outOfStockCount / evidence.productCount) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5 font-sans">
              {evidence.outOfStockCount} out of {evidence.productCount} products
            </div>
          </div>
        </div>

        {/* PDP Descriptive depth */}
        <div className="glass-panel rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-650 border border-purple-100 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-stone-500 text-xs font-semibold font-sans">Thin Descriptions</div>
            <div className="text-2xl font-extrabold font-sans text-stone-900">
              {evidence.productCount > 0 ? ((evidence.thinDescriptionsCount / evidence.productCount) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5 font-sans">
              {evidence.thinDescriptionsCount} products have &lt; 20 words
            </div>
          </div>
        </div>

      </div>

      {/* Additional Evidence Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Homepage Layout Signals */}
        <div className="glass-panel rounded-xl p-5">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 mb-4 flex items-center gap-2 font-sans">
            <Layout className="h-4 w-4 text-orange-500" />
            Homepage CRO Trust signals
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${evidence.homepageHTMLSummary.hasHero ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className="text-stone-500">Hero Section:</span>
              <span className="text-stone-900 font-semibold">{evidence.homepageHTMLSummary.hasHero ? 'Detected' : 'Not found'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${evidence.homepageHTMLSummary.hasTrustBadges ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className="text-stone-500">Trust Badges:</span>
              <span className="text-stone-900 font-semibold">{evidence.homepageHTMLSummary.hasTrustBadges ? 'Detected' : 'Not found'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${evidence.homepageHTMLSummary.hasNavigation ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className="text-stone-500">Menu Nav:</span>
              <span className="text-stone-900 font-semibold">{evidence.homepageHTMLSummary.hasNavigation ? 'Detected' : 'Not found'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${evidence.homepageHTMLSummary.hasSearch ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className="text-stone-500">Search Utility:</span>
              <span className="text-stone-900 font-semibold">{evidence.homepageHTMLSummary.hasSearch ? 'Detected' : 'Not found'}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 mt-1">
              <span className="text-stone-500">Hero Title:</span>
              <span className="text-stone-900 font-semibold truncate max-w-xs" title={evidence.homepageHTMLSummary.heroText}>
                "{evidence.homepageHTMLSummary.heroText || 'N/A'}"
              </span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <span className="text-stone-500">Cart Urgency hooks:</span>
              <span className="text-stone-900 font-semibold">
                {evidence.homepageHTMLSummary.hasCartUrgency ? 'Yes' : 'No scarcity triggers'}
              </span>
            </div>
            <div className="col-span-2 pt-2 border-t border-stone-100">
              <span className="text-stone-500 block mb-1">Supported Payments:</span>
              <div className="flex flex-wrap gap-1.5">
                {evidence.homepageHTMLSummary.paymentIcons.length > 0 ? (
                  evidence.homepageHTMLSummary.paymentIcons.map(icon => (
                    <span key={icon} className="px-2 py-0.5 text-[10px] bg-stone-50 border border-stone-200 rounded font-semibold text-stone-700 capitalize">
                      {icon}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-stone-400 italic">No payment hooks analyzed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sample PDP Verification */}
        <div className="glass-panel rounded-xl p-5">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 mb-4 flex items-center gap-2 font-sans">
            <Tag className="h-4 w-4 text-orange-500" />
            Product Detail Pages (PDP) Review
          </h3>
          <div className="space-y-3">
            {evidence.pdpScrapedData.length > 0 ? (
              evidence.pdpScrapedData.map((pdp, i) => (
                <div key={i} className="text-xs bg-stone-50/50 p-2.5 rounded-lg border border-stone-150 font-sans shadow-sm">
                  <div className="font-bold text-stone-900 truncate">{pdp.title}</div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] text-stone-500">
                    <div>Images: <span className="text-stone-900 font-semibold">{pdp.imageCount}</span></div>
                    <div>Words: <span className="text-stone-900 font-semibold">{pdp.descriptionLength}</span></div>
                    <div>Reviews widget: <span className={pdp.hasReviews ? 'text-emerald-600 font-bold' : 'text-stone-400 font-medium'}>
                      {pdp.hasReviews ? 'Found' : 'Missing'}
                    </span></div>
                    <div>Options swatches: <span className={pdp.hasVariantSelectors ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                      {pdp.hasVariantSelectors ? 'Yes' : 'No'}
                    </span></div>
                    <div className="col-span-2">Trust seals on page: <span className={pdp.hasTrustSeals ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                      {pdp.hasTrustSeals ? 'Yes' : 'No'}
                    </span></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic font-sans">No PDP pages could be crawled. Catalog descriptions will be used instead.</p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

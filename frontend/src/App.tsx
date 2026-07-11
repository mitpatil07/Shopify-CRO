import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import SettingsPanel from './components/SettingsPanel';
import AuditForm from './components/AuditForm';
import ScraperLoader from './components/ScraperLoader';
import EvidenceDashboard from './components/EvidenceDashboard';
import OpportunityList from './components/OpportunityList';
import CompetitorCompare from './components/CompetitorCompare';

import type {
  StoreEvidence,
  Opportunity,
  ExperimentBrief,
  ComparisonResult,
  LoadingStage,
  AuditResponse,
  CompareResponse
} from './types';

export default function App() {
  // Input settings states
  const [storeUrl, setStoreUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // App statuses
  const [isAuditing, setIsAuditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stages, setStages] = useState<LoadingStage[]>([
    { label: 'Checking URL & Connection', status: 'idle' },
    { label: 'Scraping Store Metadata & Homepage HTML', status: 'idle' },
    { label: 'Parsing Product JSON Catalog', status: 'idle' },
    { label: 'Inspecting PDP (Product Detail Pages) Elements', status: 'idle' },
    { label: 'Running Gemini Audit Analysis Model', status: 'idle' },
  ]);

  // Audit Results states
  const [evidence, setEvidence] = useState<StoreEvidence | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  // Experiment Brief states
  const [briefs, setBriefs] = useState<Record<string, ExperimentBrief>>({});
  const [loadingBrief, setLoadingBrief] = useState<string | null>(null);

  // Competitor Comparison states
  const [competitorEvidence, setCompetitorEvidence] = useState<StoreEvidence | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  const updateStage = (index: number, status: 'idle' | 'loading' | 'success' | 'error') => {
    setStages(prev => prev.map((stage, i) => i === index ? { ...stage, status } : stage));
  };

  const resetStages = () => {
    setStages([
      { label: 'Checking URL & Connection', status: 'idle' },
      { label: 'Scraping Store Metadata & Homepage HTML', status: 'idle' },
      { label: 'Parsing Product JSON Catalog', status: 'idle' },
      { label: 'Inspecting PDP (Product Detail Pages) Elements', status: 'idle' },
      { label: 'Running Gemini Audit Analysis Model', status: 'idle' },
    ]);
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeUrl) return;

    setIsAuditing(true);
    setErrorMsg(null);
    setEvidence(null);
    setOpportunities([]);
    setSelectedOpp(null);
    setBriefs({});
    setCompetitorEvidence(null);
    setComparisonResult(null);
    resetStages();

    // Stage 0: Connection checking
    updateStage(0, 'loading');
    
    try {
      await new Promise(r => setTimeout(r, 600));
      updateStage(0, 'success');
      
      // Stage 1: Scrape store metadata/homepage
      updateStage(1, 'loading');
      
      const response = await fetch('http://localhost:5000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: storeUrl, apiKey: apiKey || undefined }),
      });

      updateStage(1, 'success');
      updateStage(2, 'loading');
      await new Promise(r => setTimeout(r, 600));
      updateStage(2, 'success');
      updateStage(3, 'loading');
      await new Promise(r => setTimeout(r, 600));
      updateStage(3, 'success');
      updateStage(4, 'loading');

      const data: AuditResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.success === false ? (data as any).error : 'Failed to perform audit');
      }

      updateStage(4, 'success');
      setEvidence(data.evidence);
      setOpportunities(data.opportunities);

      // Perform competitor compare if competitor URL provided
      if (competitorUrl.trim()) {
        try {
          await runCompetitorComparison(storeUrl, competitorUrl.trim(), apiKey);
        } catch (compErr: any) {
          console.error('[Competitor Error]', compErr);
        }
      }

    } catch (err: any) {
      console.error(err);
      const activeStageIndex = stages.findIndex(s => s.status === 'loading');
      if (activeStageIndex !== -1) {
        updateStage(activeStageIndex, 'error');
      } else {
        updateStage(4, 'error');
      }
      setErrorMsg(err.message || 'Scraping failed or store blocks automation. Shopify JSON catalog could not be fetched.');
    } finally {
      setIsAuditing(false);
    }
  };

  const runCompetitorComparison = async (url1: string, url2: string, key?: string) => {
    const response = await fetch('http://localhost:5000/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url1, url2, apiKey: key || undefined }),
    });

    const data: CompareResponse = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.success === false ? (data as any).error : 'Competitor comparison failed');
    }

    setCompetitorEvidence(data.store2Evidence);
    setComparisonResult(data.comparison);
  };

  const generateBrief = async (opp: Opportunity) => {
    if (briefs[opp.finding]) return;
    setLoadingBrief(opp.finding);

    try {
      const response = await fetch('http://localhost:5000/api/experiment-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity: opp, storeUrl: evidence?.storeUrl, apiKey: apiKey || undefined }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate experiment brief');
      }

      setBriefs(prev => ({
        ...prev,
        [opp.finding]: data.brief,
      }));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate A/B test brief. Please try again.');
    } finally {
      setLoadingBrief(null);
    }
  };
  return (
    <div className="min-h-screen bg-[#faf9f6]/40 pb-16 font-sans">
      <div className="h-1.5 w-full bg-orange-500"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-fade-in">
        
        {/* Floating Top Header Panel */}
        <header className="glass-panel p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] border border-stone-200">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl shadow-sm">
                <span className="font-black text-lg tracking-tighter text-stone-900 font-sans">
                  Shopify<span className="text-orange-500 font-black">.</span>
                </span>
                <span className="bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ml-0.5 font-sans shadow-sm">
                  CRO
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-stone-750 tracking-tight font-sans">
                Opportunity Engine
              </h1>
            </div>
            <p className="text-stone-500 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
              Conduct instant conversion audits on any Shopify storefront. Extract catalog metadata, compute price spreads, check PDP hooks, and compile prioritized ICE-scored opportunities.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <SettingsPanel
              apiKey={apiKey}
              setApiKey={setApiKey}
              showSettings={showSettings}
              setShowSettings={setShowSettings}
              showKey={showKey}
              setShowKey={setShowKey}
            />
          </div>
        </header>

        {/* Input URL Forms */}
        <AuditForm
          storeUrl={storeUrl}
          setStoreUrl={setStoreUrl}
          competitorUrl={competitorUrl}
          setCompetitorUrl={setCompetitorUrl}
          isAuditing={isAuditing}
          onSubmit={handleAudit}
        />

        {/* Loading spinners */}
        {isAuditing && <ScraperLoader stages={stages} />}

        {/* Graceful Scrape Blocks / Warning panels */}
        {errorMsg && (
          <section className="glass-panel rounded-2xl p-6 border-rose-200 bg-rose-50/50 mb-8 max-w-3xl mx-auto flex gap-4 items-start animate-slide-up">
            <AlertCircle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-rose-700">Scraping Blocked or Incomplete Assortment</h2>
              <p className="text-stone-800 text-sm mt-1">{errorMsg}</p>
              <p className="text-stone-500 text-xs mt-3">
                * Note: Many premium Shopify setups use Cloudflare or other firewalls that block automated crawlers, or they might disable public JSON API outputs. This tool strictly adheres to collected data and never fabricates mock metrics.
              </p>
            </div>
          </section>
        )}

        {/* Result Metrics */}
        {evidence && (
          <div className="space-y-8 animate-slide-up">
            {/* Section 1: Scraped Store Metrics */}
            <EvidenceDashboard evidence={evidence} />

            {/* Section 2: Audit Opportunities cards list */}
            <OpportunityList
              opportunities={opportunities}
              selectedOpp={selectedOpp}
              setSelectedOpp={setSelectedOpp}
              generateBrief={generateBrief}
              briefs={briefs}
              loadingBrief={loadingBrief}
            />

            {/* Section 3: Competitor Comparison Dashboard */}
            {competitorEvidence && comparisonResult && (
              <CompetitorCompare
                evidence={evidence}
                competitorEvidence={competitorEvidence}
                comparisonResult={comparisonResult}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

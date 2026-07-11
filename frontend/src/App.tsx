import React, { useState } from 'react';
import { Zap, AlertCircle } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-600 rounded-lg text-white">
              <Zap className="h-6 w-6 animate-pulse-slow" />
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Shopify <span className="text-gradient">CRO Opportunity Engine</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Audit Shopify storefronts, catalog distribution, PDP tags, and homepage hooks with deterministically prioritized conversion audits.
          </p>
        </div>
        
        {/* Settings Panel */}
        <SettingsPanel
          apiKey={apiKey}
          setApiKey={setApiKey}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          showKey={showKey}
          setShowKey={setShowKey}
        />
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
        <section className="glass-panel rounded-2xl p-6 border-rose-500/20 bg-rose-500/5 mb-8 max-w-3xl mx-auto flex gap-4 items-start animate-slide-up">
          <AlertCircle className="h-6 w-6 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-rose-400">Scraping Blocked or Incomplete Assortment</h2>
            <p className="text-slate-300 text-sm mt-1">{errorMsg}</p>
            <p className="text-slate-400 text-xs mt-3">
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
  );
}

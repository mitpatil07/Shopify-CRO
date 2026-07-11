import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchStoreEvidence } from './services/fetchStore';
import { analyzeStore, generateExperimentBrief, compareStores } from './services/analyze';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Heartbeat
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Endpoint 1: Perform the full audit
app.post('/api/audit', async (req: Request, res: Response) => {
  const { url, apiKey } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: 'Store URL is required' });
  }

  const selectedKey = apiKey || process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY;
  if (!selectedKey) {
    return res.status(400).json({
      success: false,
      error: 'Nvidia API Key is missing. Please set NVIDIA_API_KEY in the backend .env or provide it in the API settings.',
    });
  }

  try {
    console.log(`[API] Initiating audit for: ${url}`);
    const evidence = await fetchStoreEvidence(url);
    
    console.log(`[API] Store scraped. isShopify: ${evidence.isShopify}. Proceeding to Gemini analysis...`);
    const opportunities = await analyzeStore(evidence, selectedKey);
    
    // Sort opportunities by priority_score descending
    const sortedOpportunities = opportunities.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

    res.json({
      success: true,
      evidence,
      opportunities: sortedOpportunities,
    });
  } catch (error: any) {
    console.error(`[API Error] Audit failed:`, error.message || error);
    res.status(500).json({
      success: false,
      error: error.message || 'An internal error occurred while conducting the store audit.',
    });
  }
});

// Endpoint 2: Generate Experiment Brief for a top opportunity
app.post('/api/experiment-brief', async (req: Request, res: Response) => {
  const { opportunity, storeUrl, apiKey } = req.body;

  if (!opportunity || !storeUrl) {
    return res.status(400).json({ success: false, error: 'Opportunity details and Store URL are required' });
  }

  const selectedKey = apiKey || process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY;
  if (!selectedKey) {
    return res.status(400).json({
      success: false,
      error: 'Nvidia API Key is missing. Please set NVIDIA_API_KEY in the backend .env or provide it in the API settings.',
    });
  }

  try {
    console.log(`[API] Generating experiment brief for opportunity: "${opportunity.finding.substring(0, 50)}..."`);
    const brief = await generateExperimentBrief(opportunity, storeUrl, selectedKey);
    res.json({ success: true, brief });
  } catch (error: any) {
    console.error(`[API Error] Brief generation failed:`, error.message || error);
    res.status(500).json({
      success: false,
      error: error.message || 'An internal error occurred while generating the experiment brief.',
    });
  }
});

// Endpoint 3: Compare target store with competitor store
app.post('/api/compare', async (req: Request, res: Response) => {
  const { url1, url2, apiKey } = req.body;

  if (!url1 || !url2) {
    return res.status(400).json({ success: false, error: 'Both Target Store URL (url1) and Competitor URL (url2) are required' });
  }

  const selectedKey = apiKey || process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY;
  if (!selectedKey) {
    return res.status(400).json({
      success: false,
      error: 'Nvidia API Key is missing. Please set NVIDIA_API_KEY in the backend .env or provide it in the API settings.',
    });
  }

  try {
    console.log(`[API] Initiating competitor comparison: ${url1} vs ${url2}`);
    
    console.log(`[API] Scraping Target Store: ${url1}`);
    const evidence1 = await fetchStoreEvidence(url1);

    console.log(`[API] Scraping Competitor Store: ${url2}`);
    const evidence2 = await fetchStoreEvidence(url2);

    console.log(`[API] Initiating Gemini competitor comparison analysis...`);
    const comparison = await compareStores(evidence1, evidence2, selectedKey);

    res.json({
      success: true,
      store1Evidence: evidence1,
      store2Evidence: evidence2,
      comparison,
    });
  } catch (error: any) {
    console.error(`[API Error] Competitor comparison failed:`, error.message || error);
    res.status(500).json({
      success: false,
      error: error.message || 'An internal error occurred while performing the competitor comparison.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Server] Shopify CRO Opportunity Engine is running on http://localhost:${PORT}`);
});

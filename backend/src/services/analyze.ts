import axios from 'axios';
import { StoreEvidence } from './fetchStore';

export interface Opportunity {
  area: 'catalog' | 'collections' | 'pdp' | 'cart' | 'merchandising' | 'homepage';
  finding: string;
  recommendation: string;
  impact: number;
  confidence: number;
  effort: number;
  evidence_refs: string[];
  priority_score?: number; // Calculated in code
}

export interface ExperimentBrief {
  opportunityFinding: string;
  hypothesis: string;
  variantDescription: string;
  primaryMetric: string;
  minimumRuntime: string;
  implementationSteps: string[];
}

export interface ComparisonResult {
  catalogBreadthAnalysis: string;
  pricingPositionAnalysis: string;
  merchandisingGaps: string[];
  strategicWins: string[];
  summary: string;
}

// Nvidia API Config
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEFAULT_MODEL = 'meta/llama-3.1-70b-instruct';

const getApiKey = (apiKeyOverride?: string) => {
  return apiKeyOverride || process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY || '';
};

// Exponential backoff retry utility for rate limits
async function callNvidiaAPI(
  apiKey: string,
  systemInstruction: string,
  prompt: string,
  forceJson = true,
  retries = 3,
  delay = 2000
): Promise<string> {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const data: any = {
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 2048,
  };

  if (forceJson) {
    data.response_format = { type: 'json_object' };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(NVIDIA_API_URL, data, { headers, timeout: 25000 });
      const text = response.data?.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("Empty response from Nvidia API");
      }
      return text;
    } catch (error: any) {
      const errorMsg = error.response?.data?.className || error.response?.data?.message || error.message;
      console.warn(`[Nvidia API Warning] Attempt ${attempt} failed: ${errorMsg}`);
      if (attempt === retries) {
        throw new Error(`Nvidia API error: ${errorMsg}`);
      }
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Failed to fetch response from Nvidia after retries.");
}

// 1. Analyze a Single Store Evidence
export async function analyzeStore(evidence: StoreEvidence, apiKeyOverride?: string): Promise<Opportunity[]> {
  const apiKey = getApiKey(apiKeyOverride);
  if (!apiKey) {
    throw new Error('Nvidia API Key is missing. Please set NVIDIA_API_KEY in the backend .env or provide it in the API settings.');
  }

  const systemInstruction = `You are an expert Shopify Conversion Rate Optimization (CRO) Analyst.
Analyze the provided store evidence and generate a list of concrete, prioritized CRO opportunities.
You must reason ONLY from the provided evidence. NEVER invent details, urls, or metrics.
If a data point was not successfully scraped or is missing, treat that section as having insufficient evidence, note it, and do not guess.
Each finding MUST cite exact numbers, names, or values from the evidence (e.g. "3 out of 10 products have descriptions with less than 20 words").

You MUST respond with a JSON object conforming exactly to this schema:
{
  "opportunities": [
    {
      "area": "catalog" | "collections" | "pdp" | "cart" | "merchandising" | "homepage",
      "finding": "Specific finding citing real evidence",
      "recommendation": "Highly actionable recommendation",
      "impact": 1-5,
      "confidence": 1-5,
      "effort": 1-5,
      "evidence_refs": ["ref 1", "ref 2"]
    }
  ]
}
Ensure the output is valid, parsable JSON.`;

  const prompt = `
Store Evidence:
${JSON.stringify(evidence, null, 2)}

Analyze this data and return the CRO opportunities matching the requested JSON structure. Keep recommendations highly actionable and Shopify-specific. Include citations to products, pricing spreads, or homepage findings where possible.
`;

  let responseText = '';
  let rawJson: any = null;

  try {
    responseText = await callNvidiaAPI(apiKey, systemInstruction, prompt, true);
    rawJson = JSON.parse(responseText);
    validateOpportunities(rawJson);
  } catch (error: any) {
    console.error('[Nvidia Analysis Error] Initial parse/validation failed:', error.message || error);
    
    // Retry once with a stricter reminder prompt
    const retryPrompt = `
Your previous response failed validation. You must return valid JSON that conforms exactly to the schema.
Here is the raw store data:
${JSON.stringify(evidence, null, 2)}

Ensure all fields are present: area (catalog|collections|pdp|cart|merchandising|homepage), finding, recommendation, impact (1-5), confidence (1-5), effort (1-5), evidence_refs (array of strings). Do not invent numbers. Base everything on the provided data.
`;
    try {
      console.log('[Nvidia Analysis] Retrying with stricter instructions...');
      responseText = await callNvidiaAPI(apiKey, systemInstruction, retryPrompt, true);
      rawJson = JSON.parse(responseText);
      validateOpportunities(rawJson);
    } catch (retryErr: any) {
      console.error('[Nvidia Analysis Error] Retry parse/validation also failed:', retryErr.message || retryErr);
      throw new Error(`Failed to generate a valid structured CRO audit from Nvidia. Details: ${retryErr.message}`);
    }
  }

  // Calculate priority score in code for deterministic ranking
  const opportunities: Opportunity[] = (rawJson.opportunities || []).map((opp: any) => {
    const impact = Number(opp.impact) || 1;
    const confidence = Number(opp.confidence) || 1;
    const effort = Number(opp.effort) || 1;
    const score = parseFloat(((impact * confidence) / effort).toFixed(2));
    
    return {
      area: opp.area,
      finding: opp.finding,
      recommendation: opp.recommendation,
      impact,
      confidence,
      effort,
      evidence_refs: opp.evidence_refs,
      priority_score: score,
    };
  });

  return opportunities;
}

// 2. Generate an Experiment Brief for a single Opportunity
export async function generateExperimentBrief(
  opp: Opportunity, 
  storeUrl: string,
  apiKeyOverride?: string
): Promise<ExperimentBrief> {
  const apiKey = getApiKey(apiKeyOverride);
  if (!apiKey) {
    throw new Error('Nvidia API Key is missing.');
  }

  const systemInstruction = `You are an A/B Testing Specialist. Draft an Experiment Brief for a conversion rate optimization test based on the provided opportunity.
You MUST respond with a JSON object conforming exactly to this schema:
{
  "hypothesis": "Clear If/Then statement based on the opportunity",
  "variantDescription": "Detailed description of the Variant (B) to test against the Control (A)",
  "primaryMetric": "The primary success metric to measure (e.g. PDP conversion rate, Add to cart rate)",
  "minimumRuntime": "Estimated runtime based on standard traffic assumptions (e.g. '14 days' or '4 weeks')",
  "implementationSteps": ["step 1", "step 2", "step 3"]
}
Ensure the output is valid, parsable JSON.`;

  const prompt = `
Store URL: ${storeUrl}
Opportunity:
- Area: ${opp.area}
- Finding: ${opp.finding}
- Recommendation: ${opp.recommendation}

Please generate an Experiment Brief. Format the brief matching the JSON schema.
`;

  const text = await callNvidiaAPI(apiKey, systemInstruction, prompt, true);
  const rawBrief = JSON.parse(text);
  
  return {
    opportunityFinding: opp.finding,
    hypothesis: rawBrief.hypothesis,
    variantDescription: rawBrief.variantDescription,
    primaryMetric: rawBrief.primaryMetric,
    minimumRuntime: rawBrief.minimumRuntime,
    implementationSteps: rawBrief.implementationSteps,
  };
}

// 3. Compare Two Stores
export async function compareStores(
  store1: StoreEvidence, 
  store2: StoreEvidence,
  apiKeyOverride?: string
): Promise<ComparisonResult> {
  const apiKey = getApiKey(apiKeyOverride);
  if (!apiKey) {
    throw new Error('Nvidia API Key is missing.');
  }

  const systemInstruction = `You are a retail competitor analyst. Compare the target store (Store 1) against the competitor store (Store 2) using their gathered catalog and metadata evidence. You must reason only from the provided evidence.
You MUST respond with a JSON object conforming exactly to this schema:
{
  "catalogBreadthAnalysis": "Analysis comparing number of products, categories, and inventory assortment.",
  "pricingPositionAnalysis": "Analysis of the price positioning, min/max spreads, and discount patterns between the stores.",
  "merchandisingGaps": ["gap 1", "gap 2"],
  "strategicWins": ["win 1", "win 2"],
  "summary": "Overall high-level strategic summary of the competitive landscape."
}
Ensure the output is valid, parsable JSON.`;

  const prompt = `
Store 1 (Target):
${JSON.stringify(store1, null, 2)}

Store 2 (Competitor):
${JSON.stringify(store2, null, 2)}

Analyze and compare the stores. Focus on catalog size, pricing, variant setups, description quality, and homepage presence of conversion features. Generate a structured JSON response matching the schema.
`;

  const text = await callNvidiaAPI(apiKey, systemInstruction, prompt, true);
  const rawCompare = JSON.parse(text);

  return rawCompare;
}

// Validate that opportunities schema is correctly matching
function validateOpportunities(json: any) {
  if (!json || typeof json !== 'object') {
    throw new Error('Response is not a valid JSON object');
  }
  if (!Array.isArray(json.opportunities)) {
    throw new Error('Response is missing an "opportunities" array');
  }
  for (const opp of json.opportunities) {
    if (!opp.area || !['catalog', 'collections', 'pdp', 'cart', 'merchandising', 'homepage'].includes(opp.area)) {
      throw new Error(`Invalid or missing "area" in opportunity: ${JSON.stringify(opp)}`);
    }
    if (typeof opp.finding !== 'string' || opp.finding.trim() === '') {
      throw new Error(`Invalid or missing "finding" in opportunity: ${JSON.stringify(opp)}`);
    }
    if (typeof opp.recommendation !== 'string' || opp.recommendation.trim() === '') {
      throw new Error(`Invalid or missing "recommendation" in opportunity: ${JSON.stringify(opp)}`);
    }
    if (typeof opp.impact !== 'number' || opp.impact < 1 || opp.impact > 5) {
      throw new Error(`Invalid or out of bounds "impact" in opportunity: ${JSON.stringify(opp)}`);
    }
    if (typeof opp.confidence !== 'number' || opp.confidence < 1 || opp.confidence > 5) {
      throw new Error(`Invalid or out of bounds "confidence" in opportunity: ${JSON.stringify(opp)}`);
    }
    if (typeof opp.effort !== 'number' || opp.effort < 1 || opp.effort > 5) {
      throw new Error(`Invalid or out of bounds "effort" in opportunity: ${JSON.stringify(opp)}`);
    }
    if (!Array.isArray(opp.evidence_refs)) {
      throw new Error(`Invalid or missing "evidence_refs" array in opportunity: ${JSON.stringify(opp)}`);
    }
  }
}

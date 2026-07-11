export interface ProductSample {
  title: string;
  handle: string;
  descriptionWordCount: number;
  imageCount: number;
  variantCount: number;
  options: string[];
  price: number;
  available: boolean;
}

export interface CollectionSample {
  title: string;
  handle: string;
}

export interface StoreEvidence {
  storeUrl: string;
  isShopify: boolean;
  scrapingStatus: {
    products: 'success' | 'blocked' | 'empty' | 'error' | 'insufficient evidence';
    collections: 'success' | 'blocked' | 'empty' | 'error' | 'insufficient evidence';
    homepage: 'success' | 'blocked' | 'error' | 'insufficient evidence';
    pdps: 'success' | 'blocked' | 'empty' | 'error' | 'insufficient evidence';
  };
  productCount: number;
  outOfStockCount: number;
  priceSpread: {
    min: number;
    max: number;
    avg: number;
    currency: string;
  };
  variantsPerProductAvg: number;
  productsWithoutImages: number;
  thinDescriptionsCount: number;
  productsSampled: ProductSample[];
  collections: CollectionSample[];
  homepageHTMLSummary: {
    title: string;
    hasHero: boolean;
    hasTrustBadges: boolean;
    hasNavigation: boolean;
    hasSearch: boolean;
    hasCartUrgency: boolean;
    paymentIcons: string[];
    heroText: string;
  };
  pdpScrapedData: Array<{
    url: string;
    title: string;
    descriptionLength: number;
    imageCount: number;
    hasReviews: boolean;
    hasVariantSelectors: boolean;
    hasTrustSeals: boolean;
  }>;
}

export interface Opportunity {
  area: 'catalog' | 'collections' | 'pdp' | 'cart' | 'merchandising' | 'homepage';
  finding: string;
  recommendation: string;
  impact: number;
  confidence: number;
  effort: number;
  evidence_refs: string[];
  priority_score: number;
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

export interface LoadingStage {
  label: string;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export interface AuditResponse {
  success: boolean;
  evidence: StoreEvidence;
  opportunities: Opportunity[];
}

export interface CompareResponse {
  success: boolean;
  store1Evidence: StoreEvidence;
  store2Evidence: StoreEvidence;
  comparison: ComparisonResult;
}

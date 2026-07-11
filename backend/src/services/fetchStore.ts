import axios from 'axios';
import * as cheerio from 'cheerio';

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

// Common Browser User Agent to avoid scraping blockages
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function cleanUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url.replace(/\/+$/, '');
}

function countWords(text: string): number {
  if (!text) return 0;
  // strip HTML tags
  const clean = text.replace(/<[^>]*>/g, ' ');
  return clean.trim().split(/\s+/).filter(w => w.length > 0).length;
}

export async function fetchStoreEvidence(rawUrl: string): Promise<StoreEvidence> {
  const storeUrl = cleanUrl(rawUrl);
  
  const evidence: StoreEvidence = {
    storeUrl,
    isShopify: false,
    scrapingStatus: {
      products: 'insufficient evidence',
      collections: 'insufficient evidence',
      homepage: 'insufficient evidence',
      pdps: 'insufficient evidence',
    },
    productCount: 0,
    outOfStockCount: 0,
    priceSpread: { min: 0, max: 0, avg: 0, currency: 'USD' },
    variantsPerProductAvg: 0,
    productsWithoutImages: 0,
    thinDescriptionsCount: 0,
    productsSampled: [],
    collections: [],
    homepageHTMLSummary: {
      title: '',
      hasHero: false,
      hasTrustBadges: false,
      hasNavigation: false,
      hasSearch: false,
      hasCartUrgency: false,
      paymentIcons: [],
      heroText: '',
    },
    pdpScrapedData: [],
  };

  const client = axios.create({
    headers: { 'User-Agent': USER_AGENT },
    timeout: 10000,
    validateStatus: () => true, // resolve promise for any HTTP status to handle failures gracefully
  });

  // 1. Fetch Homepage HTML
  console.log(`[Fetch] Fetching homepage HTML for ${storeUrl}...`);
  try {
    const res = await client.get(storeUrl);
    if (res.status >= 200 && res.status < 300) {
      evidence.scrapingStatus.homepage = 'success';
      const html = res.data;
      const $ = cheerio.load(html);
      
      // Determine if Shopify signals exist in HTML
      const htmlStr = typeof html === 'string' ? html : '';
      if (
        htmlStr.includes('shopify.com') ||
        htmlStr.includes('cdn.shopify.com') ||
        htmlStr.includes('Shopify.shop') ||
        htmlStr.includes('shopify-payment-button') ||
        $('script[id*="shopify"]').length > 0 ||
        $('link[href*="cdn.shopify.com"]').length > 0
      ) {
        evidence.isShopify = true;
      }

      evidence.homepageHTMLSummary.title = $('title').text().trim();

      // Navigation detection
      evidence.homepageHTMLSummary.hasNavigation = 
        $('nav').length > 0 || 
        $('[class*="navigation"]').length > 0 || 
        $('[class*="menu"]').length > 0 ||
        $('[id*="menu"]').length > 0;

      // Hero detection
      evidence.homepageHTMLSummary.hasHero = 
        $('[class*="hero"]').length > 0 || 
        $('[id*="hero"]').length > 0 || 
        $('section[class*="banner"]').length > 0 || 
        $('header[class*="hero"]').length > 0;

      // Hero Text Extraction
      const heroHeader = $('[class*="hero"] h1, [id*="hero"] h1, h1').first();
      evidence.homepageHTMLSummary.heroText = heroHeader.text().trim();

      // Search detection
      evidence.homepageHTMLSummary.hasSearch = 
        $('input[type="search"]').length > 0 || 
        $('[action*="/search"]').length > 0 ||
        $('[class*="search"]').length > 0;

      // Trust Badges detection
      const textToSearch = $('body').text().toLowerCase();
      const trustTerms = [
        'guarantee', 'money back', 'secure checkout', 'free shipping', 
        'free returns', 'easy returns', 'satisfaction guaranteed', 
        'warranty', 'ssl secure', 'certified', 'safe payment'
      ];
      evidence.homepageHTMLSummary.hasTrustBadges = trustTerms.some(term => textToSearch.includes(term));

      // Cart urgency keywords
      const urgencyTerms = ['selling fast', 'hurry', 'limited stock', 'only a few left', 'countdown', 'ends soon'];
      evidence.homepageHTMLSummary.hasCartUrgency = urgencyTerms.some(term => textToSearch.includes(term));

      // Payment icons detection
      const paymentKeywords = ['visa', 'mastercard', 'paypal', 'apple-pay', 'stripe', 'american express', 'amex', 'discover'];
      evidence.homepageHTMLSummary.paymentIcons = paymentKeywords.filter(card => {
        return (
          textToSearch.includes(card) || 
          $(`svg[class*="${card}"], svg[id*="${card}"], img[src*="${card}"]`).length > 0
        );
      });
    } else {
      evidence.scrapingStatus.homepage = res.status === 403 || res.status === 401 ? 'blocked' : 'error';
    }
  } catch (error) {
    console.error(`[Scrape Error] Homepage fetch failed:`, error);
    evidence.scrapingStatus.homepage = 'error';
  }

  // 2. Fetch products.json (cap at ~250 products)
  console.log(`[Fetch] Fetching products.json...`);
  try {
    const res = await client.get(`${storeUrl}/products.json?limit=250`);
    if (res.status === 200 && res.data && Array.isArray(res.data.products)) {
      evidence.isShopify = true;
      const products = res.data.products;
      evidence.productCount = products.length;

      if (products.length === 0) {
        evidence.scrapingStatus.products = 'empty';
      } else {
        evidence.scrapingStatus.products = 'success';
        
        // Compute product metrics
        let totalVariants = 0;
        let outOfStock = 0;
        let noImages = 0;
        let thinDescriptions = 0;
        const prices: number[] = [];

        products.forEach((prod: any) => {
          const variants = prod.variants || [];
          const images = prod.images || [];
          const bodyHtml = prod.body_html || '';

          totalVariants += variants.length;
          
          // out of stock if all variants out of stock
          const isAvailable = variants.some((v: any) => v.available !== false);
          if (!isAvailable) {
            outOfStock++;
          }

          if (images.length === 0) {
            noImages++;
          }

          const wordCount = countWords(bodyHtml);
          if (wordCount < 20) {
            thinDescriptions++;
          }

          variants.forEach((v: any) => {
            const p = parseFloat(v.price);
            if (!isNaN(p)) {
              prices.push(p);
            }
          });
        });

        evidence.outOfStockCount = outOfStock;
        evidence.productsWithoutImages = noImages;
        evidence.thinDescriptionsCount = thinDescriptions;
        evidence.variantsPerProductAvg = products.length > 0 ? parseFloat((totalVariants / products.length).toFixed(2)) : 0;

        if (prices.length > 0) {
          const minVal = Math.min(...prices);
          const maxVal = Math.max(...prices);
          const avgVal = prices.reduce((sum, p) => sum + p, 0) / prices.length;
          evidence.priceSpread = {
            min: parseFloat(minVal.toFixed(2)),
            max: parseFloat(maxVal.toFixed(2)),
            avg: parseFloat(avgVal.toFixed(2)),
            currency: 'USD', // defaults to USD
          };
        }

        // Take a small sample of products for detailed LLM analysis (e.g. 5 products)
        evidence.productsSampled = products.slice(0, 10).map((prod: any) => {
          const variants = prod.variants || [];
          const images = prod.images || [];
          const bodyHtml = prod.body_html || '';
          
          return {
            title: prod.title,
            handle: prod.handle,
            descriptionWordCount: countWords(bodyHtml),
            imageCount: images.length,
            variantCount: variants.length,
            options: (prod.options || []).map((o: any) => o.name),
            price: variants[0] ? parseFloat(variants[0].price) || 0 : 0,
            available: variants.some((v: any) => v.available !== false),
          };
        });
      }
    } else {
      evidence.scrapingStatus.products = res.status === 403 || res.status === 401 ? 'blocked' : 'error';
    }
  } catch (error) {
    console.error(`[Scrape Error] products.json fetch failed:`, error);
    evidence.scrapingStatus.products = 'error';
  }

  // 3. Fetch collections.json
  console.log(`[Fetch] Fetching collections.json...`);
  try {
    const res = await client.get(`${storeUrl}/collections.json`);
    if (res.status === 200 && res.data && Array.isArray(res.data.collections)) {
      const colls = res.data.collections;
      if (colls.length === 0) {
        evidence.scrapingStatus.collections = 'empty';
      } else {
        evidence.scrapingStatus.collections = 'success';
        evidence.collections = colls.map((c: any) => ({
          title: c.title,
          handle: c.handle,
        }));
      }
    } else {
      evidence.scrapingStatus.collections = res.status === 403 || res.status === 401 ? 'blocked' : 'error';
    }
  } catch (error) {
    console.error(`[Scrape Error] collections.json fetch failed:`, error);
    evidence.scrapingStatus.collections = 'error';
  }

  // 4. Fetch 2-3 Product Detail Pages (PDP) HTML
  if (evidence.productsSampled.length > 0) {
    // Select top 3 products
    const pdpSamples = evidence.productsSampled.slice(0, 3);
    evidence.scrapingStatus.pdps = 'success';

    for (const p of pdpSamples) {
      const pdpUrl = `${storeUrl}/products/${p.handle}`;
      console.log(`[Fetch] Fetching PDP HTML: ${pdpUrl}...`);
      try {
        const res = await client.get(pdpUrl);
        if (res.status === 200) {
          const $ = cheerio.load(res.data);
          const bodyText = $('body').text().toLowerCase();
          
          // Check for review widgets
          const reviewSelectors = [
            '#shopify-product-reviews', '.spr-badge', '.yotpo', '.loox-rating', 
            '.jdgm-widget', '.judgeme-badge', '.product-single__reviews', 
            '[class*="review"]', '[id*="review"]', '[class*="rating"]', '.star-rating'
          ];
          const hasReviews = reviewSelectors.some(selector => $(selector).length > 0) || 
                             bodyText.includes('review') || bodyText.includes('rating') || bodyText.includes('★');

          // Check for variant selectors (dropdowns, swatches, form action contains cart)
          const variantSelectors = [
            'select[name="id"]', 'input[name="id"]', '[class*="swatch"]', 
            '.product-form__input', 'select[id*="Option"]'
          ];
          const hasVariantSelectors = variantSelectors.some(selector => $(selector).length > 0);

          // Check for PDP specific trust seals
          const pdpTrustTerms = ['satisfaction guarantee', 'secure checkout', 'free shipping', 'warranty'];
          const hasTrustSeals = pdpTrustTerms.some(term => bodyText.includes(term));

          evidence.pdpScrapedData.push({
            url: pdpUrl,
            title: p.title,
            descriptionLength: p.descriptionWordCount,
            imageCount: p.imageCount,
            hasReviews,
            hasVariantSelectors,
            hasTrustSeals,
          });
        }
      } catch (error) {
        console.error(`[Scrape Error] PDP Scrape failed for ${p.handle}:`, error);
      }
    }
    
    if (evidence.pdpScrapedData.length === 0) {
      evidence.scrapingStatus.pdps = 'error';
    }
  } else {
    evidence.scrapingStatus.pdps = 'empty';
  }

  return evidence;
}

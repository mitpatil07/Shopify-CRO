# 🎯 Shopify CRO Opportunity Engine

An AI-powered, light-themed Conversion Rate Optimization (CRO) Audit & Experimentation Dashboard for Shopify storefronts. This tool extracts live product catalogs, collections structures, homepage signals, and product detail page (PDP) metadata, using real-site evidence to compile prioritized audits, generate experiment plans, and run competitor comparisons.

---

## ⚡ Project Write-Up & Key Features

This project was built to address critical conversion friction points on Shopify storefronts using **real site evidence rather than generic, templated advice**.

### 1. Multi-layered Evidence Gathering
Rather than guessing, the backend scraper pulls direct data from several storefront layers:
* **Catalog Analysis**: Fetches `/products.json` (samples up to 250 products) to calculate average price, min/max spreads, variants per product, out-of-stock rates, and tracks catalog flaws (e.g., thin descriptions under 20 words or missing product images).
* **Collection Assortment**: Inspects groupings at `/collections.json` to verify proper categorical listings.
* **Homepage Signals**: Analyzes HTML source elements to check for hero banners, search bars, trust badges (e.g., guarantee keywords), cart urgency triggers, and accepted payment types.
* **PDP Quality Check**: Core products are sampled to confirm the presence of reviews widgets, options swatches, and product-specific trust seals.

### 2. prioritized ICE Scoring (Impact, Confidence, Effort)
The gathered metrics are fed to the **Nvidia API Catalog (Llama 3.1 70B)** with strict instructions to generate structured, evidence-based recommendations. To ensure mathematical sorting, the backend programmatically ranks each opportunity using the formula:
$$\text{Priority Score} = \frac{\text{Impact} \times \text{Confidence}}{\text{Effort}}$$
This highlights the "quick wins" (high impact, low effort) at the top of the dashboard.

### 3. A/B Test Blueprint Generator (Bonus Feature)
Clicking on any identified opportunity generates a full testing blueprint:
* **Hypothesis**: Structured if/then conversion statement.
* **Variant setup**: What Variant B should look like compared to Control A.
* **Primary Success Metric**: Relevant funnel action metrics (e.g., Add-to-cart rate).
* **Estimated Runtime**: Time to statistical significance based on average traffic.
* **Shopify Implementation**: A step-by-step checklist to configure the experiment in Shopify.

### 4. Competitor Side-by-Side Comparison (Bonus Feature)
Enter a competitor URL alongside your target URL to generate a side-by-side CRO audit:
* A comparative matrix checking product counts, price average/range, and features.
* Strategic AI comparative analysis outlining pricing positioning, Assortment breadth, target wins, and merchandising gaps.

---

## 🛠️ Monorepo Architecture & Stack

The application is split into two modular folders:
1. **Frontend (`/frontend`)**: React.js, TypeScript, Vite, Tailwind CSS. Features a premium white/orange layout, fluid micro-interactions, clean cards, and responsive tabular layouts.
2. **Backend (`/backend`)**: Node.js, Express, TypeScript, Cheerio (for HTML parsing), and Axios.

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18.0.0 or higher)
* **Nvidia API Key**: Get a free API key from the [Nvidia API Catalog](https://build.nvidia.com).

### 2. Backend Config & Run
1. Go to `/backend`:
   ```bash
   cd backend
   ```
2. Setup environment keys in `.env`:
   ```env
   PORT=5000
   NVIDIA_API_KEY=your_nvidia_api_key_here
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Config & Run
1. Open a new terminal in `/frontend`:
   ```bash
   cd frontend
   ```
2. Start Vite:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

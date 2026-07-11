# 🎯 Shopify CRO Opportunity Engine

An interactive, AI-powered Conversion Rate Optimization (CRO) Audit Dashboard for Shopify storefronts. By analyzing live product catalog data, collection structures, homepage elements, and product detail page (PDP) metadata, this application generates prioritized, evidence-based recommendations and actionable A/B test experiment blueprints.

---

## ⚡ Key Features

* **Live Store Scraping**: Extracts vital catalog stats, pricing spreads, variant counts, out-of-stock rates, and homepage CRO elements (hero copy, trust badges, payment icons, search bar presence) through a robust backend proxy.
* **Nvidia AI Auditing**: Integrates with the **Nvidia API Catalog (`meta/llama-3.1-70b-instruct`)** to analyze store evidence and generate structured optimization opportunities without inventing metrics or URL routes.
* **ICE Priority Scoring**: Ranks findings using a deterministic priority score formula: `(Impact * Confidence) / Effort`, bubbling the most valuable "quick wins" to the top.
* **A/B Test Blueprint Generator**: Generates comprehensive testing blueprints including hypotheses, variant configurations, target metrics, estimated runtimes, and step-by-step implementation procedures for Shopify.
* **Competitor Comparison**: Side-by-side catalog analysis and strategic positioning grids to benchmark your store's merchandising against competitors.
* **Robust Error Handling**: Gracefully handles scraping blockages (e.g. Cloudflare firewalls) or missing endpoints, returning "insufficient evidence" notes rather than failing or hallucinating.

---

## 🏗️ Architecture

The project is structured as a decoupled monorepo:

1. **Frontend (`/frontend`)**: A React + TypeScript web application built using Vite, styled with Tailwind CSS, utilizing modern typography (Inter/Outfit), and configured with custom micro-interactions.
2. **Backend (`/backend`)**: A Node.js + Express API server compiled via TypeScript.
   * `fetchStore.ts`: Coordinates storefront scraping and uses Cheerio to parse HTML markup.
   * `analyze.ts`: Handles formulation of prompt messages, OpenAI/Nvidia request formatting, schemas, validation, and exponential backoff retry routines.

---

## 🚀 Setup & Execution

### 1. Prerequisites
* **Node.js** (v18.0.0 or higher)
* **Nvidia API Key**: Get a free API key from the [Nvidia API Catalog](https://build.nvidia.com).

### 2. Backend Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Create or edit `.env`:
   ```env
   PORT=5000
   NVIDIA_API_KEY=your_nvidia_api_key_here
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The backend will start on `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to `/frontend` in a new terminal window:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The interface will be accessible at `http://localhost:5173`.

---

## 🛡️ Scraper Limitations
* **Security Firewalls**: Web setups protected by strict Cloudflare or edge protection rules may block raw HTTP requests. The system handles this gracefully by falling back to homepage markup audit inputs.
* **PDP Sampling**: To minimize rate limit hits, the scraper samples a maximum of 3 Product Detail Pages (PDP) per store.

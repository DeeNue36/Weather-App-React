# Weather App

A modern React-based weather application built with Vite. Fetches current weather, daily forecasts, and hourly forecasts using free Open-Meteo APIs. Supports geolocation, city search, unit toggles (metric/imperial), and responsive design.

![Weather App Screenshot]
![alt text](<Weather-app Desktop.png>)
![alt text](<Weather-app Mobile.png>)

## Features
- **Current Weather**: Temperature, feels-like, humidity, wind speed, precipitation from user's location or search.
- **Daily Forecasts**: 7-day min/max temps and conditions.
- **Hourly Forecasts**: Filterable by day, with temps and icons.
- **Geolocation**: Auto-detects user location on first load.
- **Search**: City suggestions powered by Open-Meteo geocoding.
- **Units Toggle**: Celsius/Fahrenheit, metric/imperial (via context).
- **Error Handling**: Loading skeletons, API errors with retry.
- **Icons & Descriptions**: Custom weather icons and textual descriptions.
- **Responsive**: Works on desktop/mobile.
- **Secure APIs**: Netlify serverless for reverse geocoding (see Security section).

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Local Setup (Recommended: Netlify Dev)
1. Navigate (adjust path):
   ```
   cd \"/path/to/React/Weather App\"
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. **Install Netlify CLI** (for serverless functions emulation):
   ```
   npm install -g netlify-cli
   ```
   If permission error (macOS):
   ```
   sudo npm install -g netlify-cli
   ```
   (Enter password when prompted.)

4. Copy `.env.example` to `.env` (Netlify reads `BDC_API_KEY`):
   ```
   cp .env.example .env
   ```
   Edit `.env`: Add `BDC_API_KEY=your_bigdatacloud_api_key_here` (plain `BDC_API_KEY`, not `VITE_` prefixed).

5. **Run main dev environment** (emulates production):
   ```
   netlify dev
   ```
   - Proxies `/api/reverse-geocode` to serverless function.
   - Concurrently runs Vite dev server.
   - Opens at `http://localhost:8888` (or configured port).
   - Tests full stack: geolocation, search, secure proxy.

**Fallback: Pure Vite** (no serverless, uses public BDC fallback):
   ```
   npm run dev
   ```
   (`http://localhost:5173` – reverse geocoding may fail without proxy.)

6. Build:
   ```
   npm run build
   ```

### Environment Variables (Vite)
Vite exposes vars prefixed with `VITE_` via `import.meta.env`.

From `src/api.js` (commented original setup):
```js
// Big Data Cloud API endpoints
// const BDC_REVERSE_GEOCODING_API_URL = 'https://api-bdc.net/data/reverse-geocode?';
// const BDC_API_KEY = import.meta.env.VITE_BDC_API_KEY;
// export { BASE_WEATHER_API_URL, BASE_CITY_API_URL,  BDC_REVERSE_GEOCODING_API_URL, BDC_API_KEY };
```

From `src/components/WeatherData.jsx` (current proxy usage):
```js
// Big Data Cloud reverse geocode via Netlify function
const bdc_endpoint = `/api/reverse-geocode?latitude=${lat}&longitude=${lon}`;

// Previous endpoint
// const bdc_endpoint = `${BDC_REVERSE_GEOCODING_API_URL}latitude=${lat}&longitude=${lon}&localityLanguage=en&key=${BDC_API_KEY}`;
```

- `.env.example` provided for reference/local testing.

## Deployment to Netlify (Recommended)
1. Push to GitHub.
2. Connect repo to [Netlify](https://netlify.com).
3. Set build command: `npm run build`.
4. Publish dir: `dist`.
5. `netlify.toml` auto-configures functions dir (`netlify/functions`).

**Other platforms** (Vercel, GitHub Pages, etc.): Modify proxy:
- Replace `/api/reverse-geocode` in WeatherData.jsx with your serverless endpoint.
- Adapt `netlify.toml` redirects/functions to platform equiv (no serverless = use public fallback).

**Serverless Functions**: 
- `netlify/functions/reverse-geocode.js`: Proxies Big Data Cloud (`https://api-bdc.net/data/reverse-geocode?...&key=${process.env.BDC_API_KEY}`).
- `netlify.toml`: Redirects `/api/reverse-geocode` → `/.netlify/functions/reverse-geocode`.
- Set `BDC_API_KEY` in Netlify dashboard or local `.env`.
- Secure: Key server-side (`process.env`), never client-side.

## API Security & Vite Dev Downsides
**Problem with Vite/Client-Side Env** (Why I Switched):
- BDC requires API key in **URL query param** (e.g., `key=${BDC_API_KEY}`).
- Vite dev/production: Key bundled client-side → exposed in Network tab (DevTools), URL bar, logs.
- Risks: Anyone inspecting (devs, users, attackers) sees key.
- Open-Meteo free/public API, no API key needed
- BDC while also FREE needs securing via proxy etc to prevent API key exposure.

**Solution: Netlify Serverless**:
- `netlify dev`: Emulates production locally (functions + Vite).
- `netlify.toml`: Redirects `/api/reverse-geocode` to `/.netlify/functions/reverse-geocode`.
- Add `BDC_API_KEY` to local `.env` or Netlify dashboard.
- Fallback endpoint handles failures gracefully.
- Secure: Key server-side only.

## Project Structure
```
.
├── public/          # Static assets
├── src/
│   ├── api.js       # API endpoints
│   ├── components/
│   │   └── WeatherData.jsx  # Main component
│   ├── context/     # UnitsContext
│   ├── utilities/   # Date/unit helpers
│   └── weatherIcons.js
├── netlify/         # Serverless functions
├── netlify.toml
├── vite.config.js
├── package.json
└── README.md
```

## Tech Stack
- React 18+, Vite, Tailwind CSS.
- Open-Meteo (weather), Big Data Cloud (geocoding via proxy).

## Local Testing Notes
- Allow geolocation in browser.
- Test search, units toggle, forecasts.
- Simulate errors: Block network to APIs.

## Contributing
1. Fork & PR.
2. Follow ESLint (`eslint.config.js`).
3. Update tests if added.

## License
MIT

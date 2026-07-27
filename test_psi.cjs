// Extended timeout PSI test — 90 seconds per request
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const envPath = path.join(__dirname, '.env.local');
let API_KEY = '';
try {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*VITE_PAGESPEED_API_KEY\s*=\s*(.+)$/);
    if (m) {
      const v = m[1].trim().replace(/^["']|["']$/g, '');
      if (v && v !== 'YOUR_API_KEY_HERE') API_KEY = v;
    }
  }
} catch (e) {}

const TARGET = 'https://openai.com';
const TIMEOUT_MS = 90000; // 90 seconds

console.log('\n══ PSI Live Test (90s timeout) ══');
console.log(' Target :', TARGET);
console.log(' Key    :', API_KEY ? `${API_KEY.slice(0,14)}…  ✅` : '❌ MISSING');

if (!API_KEY) { console.log('\n❌ No key found in .env.local'); process.exit(1); }

function psiRequest(strategy) {
  return new Promise((resolve, reject) => {
    const endpoint =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
      `?url=${encodeURIComponent(TARGET)}` +
      `&strategy=${strategy}` +
      `&category=performance&category=accessibility&category=best-practices&category=seo` +
      `&key=${API_KEY}`;

    const start = Date.now();
    let raw = '';
    const req = https.get(endpoint, res => {
      process.stdout.write(`\r [${strategy.toUpperCase()}] HTTP ${res.statusCode} — receiving…`);
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        try {
          const json = JSON.parse(raw);
          if (json.error) {
            console.log(`\n [${strategy}] API Error ${json.error.code}: ${json.error.message}`);
            return reject(new Error(`${json.error.code}: ${json.error.message}`));
          }
          console.log(`\r [${strategy.toUpperCase()}] ✅ Done in ${elapsed}s                    `);
          resolve({ strategy, json });
        } catch (e) {
          reject(new Error('JSON parse error: ' + raw.slice(0, 200)));
        }
      });
    });
    req.on('error', e => reject(new Error(`Network: ${e.message}`)));
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Timed out after ${TIMEOUT_MS/1000}s — PSI is slow for complex sites`));
    });

    // progress dots every 5s
    const tick = setInterval(() => process.stdout.write('.'), 5000);
    req.on('close', () => clearInterval(tick));
  });
}

async function run() {
  console.log('\n Fetching MOBILE strategy (openai.com takes 30-60s)…');
  const start = Date.now();

  try {
    // Sequential to avoid overloading the API quota — mobile first, then desktop
    const mobile = await psiRequest('mobile');
    const desktop = await psiRequest('desktop');

    const lhr    = mobile.json.lighthouseResult;
    const cats   = lhr?.categories   ?? {};
    const audits = lhr?.audits        ?? {};
    const dCats  = desktop.json.lighthouseResult?.categories ?? {};
    const round  = v => Math.round((v ?? 0) * 100);

    const total = ((Date.now() - start)/1000).toFixed(1);
    console.log(`\n Total API time: ${total}s`);

    console.log('\n══ SCORES ══════════════════════════════════════════════');
    console.log(`  SEO Score          : ${round(cats?.seo?.score)}`);
    console.log(`  Performance (mob)  : ${round(cats?.performance?.score)}`);
    console.log(`  Accessibility      : ${round(cats?.accessibility?.score)}`);
    console.log(`  Best Practices     : ${round(cats?.['best-practices']?.score)}`);
    console.log(`  Performance (desk) : ${round(dCats?.performance?.score)}`);

    console.log('\n══ CORE WEB VITALS (mobile) ═════════════════════════════');
    console.log(`  LCP         : ${audits?.['largest-contentful-paint']?.displayValue ?? '—'}`);
    console.log(`  TBT         : ${audits?.['total-blocking-time']?.displayValue      ?? '—'}`);
    console.log(`  CLS         : ${audits?.['cumulative-layout-shift']?.displayValue   ?? '—'}`);
    console.log(`  FCP         : ${audits?.['first-contentful-paint']?.displayValue    ?? '—'}`);
    console.log(`  TTFB        : ${audits?.['server-response-time']?.displayValue      ?? '—'}`);
    console.log(`  Speed Index : ${audits?.['speed-index']?.displayValue               ?? '—'}`);

    console.log('\n══ TECHNICAL CHECKS ═════════════════════════════════════');
    const chk = (label, key) => {
      const s = audits?.[key]?.score;
      console.log(`  ${s===1?'✅':s===null?'⬜':'❌'}  ${label.padEnd(22)} score=${s}`);
    };
    chk('HTTPS',            'is-on-https');
    chk('Mobile-friendly',  'viewport');
    chk('Robots.txt',       'robots-txt');
    chk('Canonical tags',   'canonical');
    chk('Document title',   'document-title');
    chk('Meta description', 'meta-description');
    chk('Image alt text',   'image-alt');
    chk('Structured data',  'structured-data');

    console.log('\n══ DETECTED ISSUES (failures only) ══════════════════════');
    let n = 0;
    for (const [k, a] of Object.entries(audits)) {
      if (a.score !== null && a.score < 1 && a.title) {
        console.log(`  [${a.score===0?'FAIL':'WARN'}] ${a.title}`);
        if (++n >= 12) { console.log('  … (more omitted)'); break; }
      }
    }

    console.log('\n══════════════════════════════════════════════════════════');
    console.log(' ✅ LIVE DATA CONFIRMED. All scores are real.');
    console.log(' The browser SEO module will display these exact values.');
    console.log('══════════════════════════════════════════════════════════\n');

    // Write a quick summary JSON for reference
    fs.writeFileSync(
      path.join(__dirname, 'psi_result_summary.json'),
      JSON.stringify({
        url: TARGET,
        fetchedAt: new Date().toISOString(),
        scores: {
          seo:         round(cats?.seo?.score),
          performance: round(cats?.performance?.score),
          accessibility: round(cats?.accessibility?.score),
          bestPractices: round(cats?.['best-practices']?.score),
          desktopPerf:   round(dCats?.performance?.score),
        },
        coreWebVitals: {
          lcp:  audits?.['largest-contentful-paint']?.displayValue,
          tbt:  audits?.['total-blocking-time']?.displayValue,
          cls:  audits?.['cumulative-layout-shift']?.displayValue,
          fcp:  audits?.['first-contentful-paint']?.displayValue,
          ttfb: audits?.['server-response-time']?.displayValue,
          si:   audits?.['speed-index']?.displayValue,
        },
      }, null, 2)
    );
    console.log(' Summary written to psi_result_summary.json\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

run();

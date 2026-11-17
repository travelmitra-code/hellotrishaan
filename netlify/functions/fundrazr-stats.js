// netlify/functions/fundrazr-stats.js
export async function handler() {
  const FALLBACK = {
    raisedCad: 26406,
    goalCad: 75000,
    contributions: 195
  };

  try {
    const response = await fetch('https://fundrazr.com/campaigns/d2kPl1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HelloTrishaanBot/1.0)'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    // Extract raised amount (e.g., "$26,406") and contribution count (e.g., "195 contributions")
    const raisedMatch = html.match(/\$([\d,]+)\s*<\/span>\s*<span>\s*raised/i)
                     || html.match(/raised[^$]*\$([\d,]+)/i);
    const contribMatch = html.match(/(\d+)\s*<\/span>\s*<span>\s*contributions/i)
                      || html.match(/(\d+)\s+contributions/i);

    const raisedCad = raisedMatch
      ? parseInt(raisedMatch[1].replace(/,/g, ''), 10)
      : FALLBACK.raisedCad;

    const contributions = contribMatch
      ? parseInt(contribMatch[1], 10)
      : FALLBACK.contributions;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache on Netlify CDN for 10 minutes (600s) so every visitor gets instant loads
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300'
      },
      body: JSON.stringify({
        raisedCad,
        goalCad: 75000,
        contributions
      })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(FALLBACK)
    };
  }
}
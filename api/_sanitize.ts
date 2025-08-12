// api/_sanitize.ts
const WATERMARK_PATTERNS = [
  /script\s*slug\.com/gi,
  /scriptslug\.com/gi,
  /downloaded\s+from\s+.*/gi,
  /page\s+\d+\s+of\s+\d+/gi,
  /internet\s+archive/gi,
  /archive\.org/gi,
];

function stripHeadersFootersByRepetition(raw: string): string {
  const pages = raw.split(/\f|\n\s*-\s*PAGE\s*\d+\s*-\s*\n/);
  if (pages.length < 3) return raw;
  const lineCounts = new Map<string, number>();
  pages.forEach(p => p.split(/\n/).forEach(line => {
    const key = line.trim(); if (!key) return;
    lineCounts.set(key, (lineCounts.get(key) || 0) + 1);
  }));
  const threshold = Math.max(2, Math.floor(pages.length * 0.6));
  const remove = new Set([...lineCounts.entries()].filter(([, c]) => c >= threshold).map(([l]) => l));
  return raw.split(/\n/).filter(l => !remove.has(l.trim())).join('\n');
}

export function sanitizeText(input: string) {
  let raw = input.replace(/\r\n?/g, '\n');
  WATERMARK_PATTERNS.forEach(rx => { raw = raw.replace(rx, ''); });
  raw = stripHeadersFootersByRepetition(raw);
  raw = raw.replace(/[ \t]+\n/g, '\n');
  raw = raw.replace(/\n{3,}/g, '\n\n');
  raw = raw.replace(/([A-Za-z])-\n([a-z])/g, '$1$2'); // de-hyphenate
  return raw.trim();
}

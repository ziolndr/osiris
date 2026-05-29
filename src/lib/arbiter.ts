export type ArbiterCandidate = {
  id: string;
  type: string;
  title: string;
  source?: string;
  location?: string;
  lat?: number;
  lng?: number;
  severity?: string;
  timestamp?: string | number;
  summary?: string;
  url?: string;
  raw?: unknown;

  symbol?: string;
  price?: string | number;
  change?: string | number;
  sector?: string;
  up?: boolean;
};

export type ArbiterRankedResult = {
  score: number;
  text: string;
  record: ArbiterCandidate;
};

const ARBITER_COMPARE_URL = "https://api.arbiter.traut.ai/public/compare";

export function stripHtml(input?: string) {
  if (!input) return "";
  return input
    .replace(/<br\s*\/?>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function osirisToCandidateText(x: ArbiterCandidate) {
  if (x.type === "market") {
    return [
      `Market: ${x.title}`,
      x.symbol ? `Asset: ${x.symbol}` : "",
      x.price !== undefined ? `Price: ${x.price}` : "",
      x.change !== undefined ? `Change percent: ${x.change}` : "",
      x.up !== undefined ? `Direction: ${x.up ? "up" : "down"}` : "",
      x.sector ? `Category: ${x.sector}` : "",
      x.timestamp ? `Time: ${x.timestamp}` : "",
      x.url ? `URL: ${x.url}` : "",
    ].filter(Boolean).join(". ");
  }

  return [
    `${x.type}: ${x.title}`,
    x.summary ? `Summary: ${x.summary}` : "",
    x.source ? `Source: ${x.source}` : "",
    x.location ? `Location: ${x.location}` : "",
    x.severity ? `Status: ${x.severity}` : "",
    x.timestamp ? `Time: ${x.timestamp}` : "",
    x.url ? `URL: ${x.url}` : "",
  ].filter(Boolean).join(". ");
}

function rowText(row: any): string {
  return String(row?.text ?? row?.candidate ?? row?.item ?? row?.document ?? row?.value ?? "");
}

function rowScore(row: any): number {
  const score = Number(row?.score ?? row?.coherence ?? 0);
  return Number.isFinite(score) ? score : 0;
}

export async function compareWithArbiter(
  query: string,
  records: ArbiterCandidate[],
  topK = 20
): Promise<ArbiterRankedResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery || records.length === 0) return [];

  const candidates = records.map(osirisToCandidateText);
  const candidateToRecord = new Map<string, ArbiterCandidate>();
  candidates.forEach((candidate, index) => {
    candidateToRecord.set(candidate, records[index]);
  });

  const res = await fetch(ARBITER_COMPARE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: cleanQuery,
      candidates,
      use_freq: true,
      top_k: topK,
    }),
  });

  if (!res.ok) throw new Error(`ARBITER ${res.status}`);

  const data = await res.json();
  const rows = Array.isArray(data?.all)
    ? data.all
    : Array.isArray(data?.top)
      ? data.top
      : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

  return rows
    .map((row: any, index: number) => {
      const text = rowText(row);
      const record = candidateToRecord.get(text) ?? records[index];
      if (!record) return null;
      return { score: rowScore(row), text, record };
    })
    .filter(Boolean) as ArbiterRankedResult[];
}


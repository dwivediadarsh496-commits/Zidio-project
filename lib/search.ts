/**
 * Project LOOP - Semantic Vector Search & Embeddings Engine
 * Implements normalized vector representations and cosine similarity calculations.
 */

// Domain vocabulary weights for semantic proximity mapping
const VOCABULARY_DOMAINS: Record<string, string[]> = {
  onboarding: ["onboarding", "signup", "register", "invite", "workspace", "setup", "tutorial", "welcome", "getting started", "first time", "team member"],
  billing: ["billing", "invoice", "payment", "card", "checkout", "subscription", "price", "pricing", "charge", "refund", "receipt", "plan", "upgrade", "downgrade"],
  performance: ["slow", "lag", "latency", "timeout", "speed", "performance", "fast", "freeze", "crash", "unresponsive", "loading", "spins", "delay"],
  feature_request: ["feature", "request", "wish", "need", "could you", "please add", "export", "filter", "integration", "slack", "notion", "github", "jira", "sso", "saml"],
  ui_mobile: ["mobile", "ios", "android", "phone", "tablet", "screen", "button", "ui", "ux", "dark mode", "font", "layout", "responsive", "design"],
  support: ["support", "agent", "ticket", "help", "documentation", "guide", "response time", "docs", "chat", "resolution"],
  sentiment_pos: ["great", "love", "amazing", "excellent", "best", "fast", "easy", "intuitive", "helpful", "perfect", "fantastic", "smooth"],
  sentiment_neg: ["terrible", "worst", "bug", "broken", "fail", "hate", "awful", "frustrated", "confusing", "painful", "cannot", "hard", "error", "lost"],
};

const VECTOR_DIM = 64;

/**
 * Generate a deterministic, normalized semantic embedding vector for a given text.
 */
export function generateEmbedding(text: string): number[] {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const vector = new Array(VECTOR_DIM).fill(0);

  // 1. Hash tokens across dimensions
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let hash = 0;
    for (let c = 0; c < token.length; c++) {
      hash = (hash << 5) - hash + token.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % VECTOR_DIM;
    vector[idx] += 1.0;

    // 2. Cross-match against semantic domain vocabulary
    let domainIdx = 0;
    for (const [_, keywords] of Object.entries(VOCABULARY_DOMAINS)) {
      if (keywords.includes(token)) {
        const slot = (domainIdx * 7) % VECTOR_DIM;
        vector[slot] += 2.5;
        vector[(slot + 1) % VECTOR_DIM] += 1.8;
      }
      domainIdx++;
    }
  }

  // 3. Normalize vector to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;

  return vector.map((val) => Number((val / magnitude).toFixed(6)));
}

/**
 * Calculate cosine similarity between two unit-normalized vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}

/**
 * Search feedback embeddings by cosine similarity.
 */
export function rankFeedbackBySimilarity(
  queryVector: number[],
  items: Array<{ id: string; vector: string; feedback: any }>,
  topK: number = 8
) {
  const scored = items.map((item) => {
    let parsedVec: number[] = [];
    try {
      parsedVec = JSON.parse(item.vector);
    } catch {
      parsedVec = [];
    }
    const score = cosineSimilarity(queryVector, parsedVec);
    return {
      ...item,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

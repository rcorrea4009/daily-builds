// In-memory storage layer. Swappable for a real DB later without
// touching the service or route layers.
export class InMemoryLinkRepository {
  constructor() {
    this.linksByCode = new Map();
  }

  save(code, longUrl) {
    this.linksByCode.set(code, { code, longUrl, hits: 0, createdAt: new Date().toISOString() });
  }

  findByCode(code) {
    return this.linksByCode.get(code) ?? null;
  }

  recordHit(code) {
    const entry = this.linksByCode.get(code);
    if (entry) entry.hits += 1;
  }

  has(code) {
    return this.linksByCode.has(code);
  }

  all() {
    return [...this.linksByCode.values()];
  }
}

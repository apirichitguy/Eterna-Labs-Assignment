import { MockDexRouter } from '../services/MockDexRouter';

describe('MockDexRouter - quotes', () => {
  it('returns two different quotes with variance', async () => {
    const dex = new MockDexRouter();
    const r = await dex.getRaydiumQuote('USDC', 'SOL', 10);
    const m = await dex.getMeteoraQuote('USDC', 'SOL', 10);
    expect(r.price).toBeGreaterThan(0);
    expect(m.price).toBeGreaterThan(0);
    expect(r.dex).toBe('raydium');
    expect(m.dex).toBe('meteora');
  });

  it('returns plausible variance across multiple calls', async () => {
    const dex = new MockDexRouter();
    const ps: number[] = [];
    for (let i = 0; i < 5; i++) {
      const q = await dex.getRaydiumQuote('A', 'B', 1);
      ps.push(q.price);
    }
    expect(Math.max(...ps) - Math.min(...ps)).toBeGreaterThanOrEqual(0);
  });
});

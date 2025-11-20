import { MockDexRouter } from '../services/MockDexRouter';

describe('MockDexRouter - executeSwap behavior', () => {
  it('either resolves with txHash or throws (simulate both)', async () => {
    const dex = new MockDexRouter();
    const results = await Promise.allSettled([dex.executeSwap('raydium', {}), dex.executeSwap('meteora', {})]);
    // At least one of them should be fulfilled or rejected; ensure no hang
    expect(results.length).toBe(2);
    const kinds = results.map(r => r.status);
    expect(kinds).toContain('fulfilled');
  });
});

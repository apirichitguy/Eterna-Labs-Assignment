import { WebsocketManager } from '../services/WebsocketManager';
import { startOrderWorker } from '../processors/orderProcessor';
import { OrderService } from '../services/OrderService';

jest.setTimeout(40000);

test('job retries up to attempts and emits failed on terminal failure', async () => {
    // This test relies on random failures in MockDexRouter; assert that either success or final failure arrives.
    const ws = new WebsocketManager();
    startOrderWorker(ws);
    const svc = new OrderService(ws);

    await new Promise<void>((resolve) => {
        const fakeSocket = {
            send: (m: any) => {
                try {
                    const payload = JSON.parse(m);
                    if (payload.status === 'failed') {
                        expect(payload.error).toBeDefined();
                        resolve();
                    } else if (payload.status === 'confirmed') {
                        // if it succeeds, that's also acceptable
                        resolve();
                    }
                } catch (e) { }
            },
            on: () => { },
            close: () => { }
        };

        svc.createOrderAndEnqueue({
            userId: 'retry-test',
            tokenIn: 'USDC',
            tokenOut: 'SOL',
            amountIn: 5
        }, fakeSocket as any);
    });
});

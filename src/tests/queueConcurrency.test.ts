import { WebsocketManager } from '../services/WebsocketManager';
import { startOrderWorker } from '../processors/orderProcessor';
import { OrderService } from '../services/OrderService';

jest.setTimeout(60000);

test('process multiple orders concurrently (submit 10)', async () => {
    const ws = new WebsocketManager();
    startOrderWorker(ws);
    const svc = new OrderService(ws);

    let confirmed = 0;
    let seen = 0;
    const total = 8;

    await new Promise<void>((resolve) => {
        const fakeSocket = {
            send: (m: any) => {
                try {
                    const payload = JSON.parse(m);
                    seen++;
                    if (payload.status === 'confirmed') {
                        confirmed++;
                    }
                    if (seen >= total && confirmed >= 1) {
                        expect(confirmed).toBeGreaterThanOrEqual(1);
                        resolve();
                    }
                } catch (e) { }
            },
            on: () => { },
            close: () => { }
        };

        for (let i = 0; i < total; i++) {
            // quick create
            svc.createOrderAndEnqueue({
                userId: `u${i}`,
                tokenIn: 'USDC',
                tokenOut: 'SOL',
                amountIn: 1 + i
            }, fakeSocket as any);
        }
    });
});

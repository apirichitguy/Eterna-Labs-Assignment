import { WebsocketManager } from '../services/WebsocketManager';
import { startOrderWorker } from '../processors/orderProcessor';
import { OrderService } from '../services/OrderService';
import { orderQueue } from '../queue/orderQueue';

jest.setTimeout(30000);

test('end-to-end order lifecycle emits confirmed status', async () => {
    const ws = new WebsocketManager();
    startOrderWorker(ws);
    const svc = new OrderService(ws);

    await new Promise<void>((resolve) => {
        // fake socket that collects messages
        const messages: any[] = [];
        const fakeSocket = {
            send: (m: any) => {
                try {
                    const payload = JSON.parse(m);
                    messages.push(payload);
                    if (payload.status === 'confirmed') {
                        expect(payload.txHash).toBeDefined();
                        resolve();
                    }
                } catch (e) { }
            },
            on: () => { },
            close: () => { }
        };
        svc.createOrderAndEnqueue({
            userId: 'u1',
            tokenIn: 'USDC',
            tokenOut: 'SOL',
            amountIn: 10
        }, fakeSocket as any);
    });
});

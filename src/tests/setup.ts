import { orderProcessorConnection, closeAllWorkers } from '../processors/orderProcessor';
import { queueConnection } from '../queue/orderQueue';
import db from '../db';

// Set test environment variables
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/orders';
process.env.REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';

// Global cleanup after all tests
afterAll(async () => {
    // Close all worker instances
    await closeAllWorkers();

    // Close Redis connections
    await orderProcessorConnection.quit();
    await queueConnection.quit();

    // Force close PostgreSQL pool and all idle/active clients
    try {
        await db.pool.end();
    } catch (err) {
        // Ignore errors during shutdown
    }

    // Give extra time for all connections to fully close
    await new Promise(resolve => setTimeout(resolve, 1000));
});

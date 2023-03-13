import { Redis } from "@upstash/redis";

/*
 * We will need to handle popping many transactions off of the queue or else the cron will only process
 * one transaction per cycle, which is too slow. For testing purposes however, we will start with a
 * single transaction off of the top of the queue.
 */

/* Transaction type
 * - hash: the transaction hash
 * - endpoint: endpoint to call containing success or error callbacks
 */
type Transaction = {
  hash: string;
  endpoint: string;
};

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});
export async function getPendingTx(): Promise<Transaction | null> {
  /* Get next pending transaction from redis (fifo) */
  return await redis.rpop("pending-txs");
}

export async function addPendingTx(transaction: Transaction) {
  /* push transaction to redis */
  return await redis.lpush("pending-txs", transaction);
}

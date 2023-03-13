import type { NextApiRequest, NextApiResponse } from "next";
import { getPendingTx } from "@/lib/upstash";
import { publicClient } from "@/lib/viem";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const transaction = await getPendingTx();
    console.log("transaction", transaction);

    // instead of automatically creating tx, we should wait the tx, and if success, call API
    if (transaction) {
      const transactionStatus = await publicClient.waitForTransactionReceipt({
        hash: transaction.hash as `0x${string}`,
      });

      // what happens if still pending?

      return res.json({ message: transaction });
    }

    return res.json({ message: "No transactions in queue." });
  } catch (err) {
    console.log("Cron job error:", err);
    await console.error(
      "Cron job error: \n" + "```" + JSON.stringify(err) + "```"
    );
    return res.json({ statusCode: 500, message: err });
  }
}

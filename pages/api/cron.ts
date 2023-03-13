import type { NextApiRequest, NextApiResponse } from "next";
import { getPendingTx, addPendingTx } from "@/lib/upstash";
import { publicClient } from "@/lib/viem";
import { TransactionNotFoundError, TransactionReceipt } from "viem";
import { postData } from "@/lib/fetch";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  let transaction;
  try {
    transaction = await getPendingTx();
    if (transaction) {
      const receipt = (await publicClient.getTransactionReceipt({
        hash: transaction.hash as `0x${string}`,
      })) as TransactionReceipt;

      await postData(`https://web3-fw-demo.vercel.app${transaction.endpoint}`, {
        receipt,
      });

      console.log("transaction is a success");
      return res.json({ message: transaction });
    }

    console.log("No transactions in queue.");
    return res.json({ message: "No transactions in queue." });
  } catch (err) {
    if (err instanceof TransactionNotFoundError) {
      if (transaction) {
        await addPendingTx(transaction);
      }

      console.log("transaction not yet confirmed, pending result...");
      return res.json({
        statusCode: 202,
        message: "Transaction not yet confirmed on chain, pending result...",
      });
    }

    console.log("Cron job error:", err);
    console.error("Cron job error: \n" + "```" + JSON.stringify(err) + "```");
    return res.json({ statusCode: 500, message: err });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { getPendingTx } from "@/lib/upstash";
import { publicClient } from "@/lib/viem";
import { postData } from "@/lib/fetch";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const transaction = await getPendingTx();

    if (transaction) {
      // probably don't want to use the wait hook here either, since its blocking and could timeout the serverless fn
      const transactionStatus = await publicClient.waitForTransactionReceipt({
        hash: transaction.hash as `0x${string}`,
      });

      console.log(transactionStatus);

      // if tx is still pending, we want to push it back onto the queue.
      // otherwise, we would never check it again

      // maybe get api host from env?
      await postData(`https://web3-fw-demo.vercel.app${transaction.endpoint}`, {
        transaction,
      });

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

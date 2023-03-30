import { verifySignature } from "@upstash/qstash/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { publicClient } from "@/lib/viem";
import { TransactionReceiptNotFoundError, TransactionReceipt } from "viem";
import { postData } from "@/lib/fetch";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const receipt = (await publicClient.getTransactionReceipt({
      hash: req.body.hash as `0x${string}`,
    })) as TransactionReceipt;

    const fullEndpoint = `${process.env.API_HOST}${req.body.endpoint}`;
    await postData(fullEndpoint, {
      receipt: {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      },
    });

    res.status(200).end();
  } catch (err) {
    if (err instanceof TransactionReceiptNotFoundError) {
      // 202 seems more appropriate but q-stash only retries if it gets a non 2xx response code
      return res.json({
        statusCode: 500,
        message: "Transaction not yet confirmed on chain, pending result...",
      });
    }
  }
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};

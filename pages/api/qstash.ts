import { verifySignature } from "@upstash/qstash/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { publicClient } from "@/lib/viem";
import { TransactionReceiptNotFoundError, TransactionReceipt } from "viem";
import { postData } from "@/lib/fetch";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let receipt;
  try {
    receipt = (await publicClient.getTransactionReceipt({
      hash: req.body.hash as `0x${string}`,
    })) as TransactionReceipt;

    console.log(receipt);
  } catch (err) {
    if (err instanceof TransactionReceiptNotFoundError) {
      // 202 seems more appropriate but q-stash only retries if it gets a non 2xx response code
      console.log("error, probably failed transaction, pending result...");
      res.status(500).end();
    }
  }

  try {
    const fullEndpoint = `${process.env.API_HOST}${req.body.endpoint}`;
    if (receipt) {
      await postData(fullEndpoint, {
        receipt: {
          status: receipt.status,
          transactionHash: receipt.transactionHash,
        },
      });
    }
    res.status(200).end();
  } catch (err) {
    console.log("Error: \n" + "```" + JSON.stringify(err) + "```");
    res.status(500).end();
  }
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};

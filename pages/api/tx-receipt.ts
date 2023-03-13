import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/prisma/client";
import { TransactionReceipt } from "viem";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { receipt } = req.body as { receipt: TransactionReceipt };
  try {
    if (receipt.status === "success") {
      await db.txReceipt.create({
        data: {
          hash: receipt.transactionHash,
        },
      });

      return res.json({ statusCode: 200, message: "Success" });
    } else if (receipt.status === "reverted") {
      // pass, nothing to handle here, but in theory we could add something
      // if the app was interested in firing some effect on the revert case
      return res.json({ statusCode: 200, message: "Reverted" });
    }
  } catch (err) {
    console.log("Error:", err);
    return res.json({ statusCode: 500, message: err });
  }
}

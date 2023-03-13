import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { transaction } = req.body;
  try {
    await db.txReceipt.create({
      data: {
        hash: transaction.hash,
      },
    });

    return res.json({ message: transaction });
  } catch (err) {
    console.log("Cron job error:", err);
    await console.error(
      "Cron job error: \n" + "```" + JSON.stringify(err) + "```"
    );
    return res.json({ statusCode: 500, message: err });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";

import db from "@/prisma/client";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const receipts = await db.txReceipt.findMany();
    return res.json({ receipts });
  } catch (err) {
    console.log("Error finding receipts:", err);
    await console.error("Error: \n" + "```" + JSON.stringify(err) + "```");
    return res.json({ statusCode: 500, message: err });
  }
}

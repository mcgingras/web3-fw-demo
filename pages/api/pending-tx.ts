import type { NextApiRequest, NextApiResponse } from "next";
import { addPendingTx } from "@/lib/upstash";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { hash } = req.body;
  try {
    await addPendingTx({
      hash,
      endpoint: "/api/tx-receipt",
    });
    return res.json({ message: "Adding transaction successful!" });
  } catch (err) {
    console.log("Error adding transaction:", err);
    await console.error("Error: \n" + "```" + JSON.stringify(err) + "```");
    return res.json({ statusCode: 500, message: err });
  }
}

import { createPublicClient, http } from "viem";
import { goerli } from "viem/chains";

// only going to support goerli for this demo
export const publicClient = createPublicClient({
  chain: goerli,
  transport: http(),
});

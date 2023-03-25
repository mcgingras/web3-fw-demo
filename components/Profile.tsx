"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  usePrepareSendTransaction,
  useSendTransaction,
} from "wagmi";
import { utils } from "ethers";
import ClientOnly from "@/components/ClientOnly";
import { postData } from "@/lib/fetch";

export function Profile() {
  const { address, connector, isConnected } = useAccount();
  const { data: ensAvatar } = useEnsAvatar({
    address,
    chainId: 1,
  });
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const { config } = usePrepareSendTransaction({
    request: {
      to: to,
      value: amount ? utils.parseEther(amount) : undefined,
      chainId: 5,
    },
  });

  const { data, sendTransaction } = useSendTransaction(config);

  useEffect(() => {
    if (data?.hash) {
      if (process.env.NEXT_PUBLIC_QUEUE_TYPE === "qstash") {
        // wouldn't suggest doing this in production because we leak our key in the browser, but this is a demo
        fetch(
          `${process.env.NEXT_PUBLIC_QSTASH_URL}https://frog-ff.vercel.app/api/qstash/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_QSTASH_TOKEN}`,
            },
            body: JSON.stringify({ hash: data?.hash }),
          }
        );
      } else {
        postData("/api/pending-tx", { hash: data?.hash });
      }
    }
  }, [data]);

  const publish = () => {
    if (process.env.NEXT_PUBLIC_QUEUE_TYPE === "qstash") {
      // wouldn't suggest doing this in production because we leak our key in the browser, but this is a demo
      fetch(
        `${process.env.NEXT_PUBLIC_QSTASH_URL}https://frog-ff.vercel.app/api/qstash/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_QSTASH_TOKEN}`,
          },
          body: JSON.stringify({ hash: data?.hash }),
        }
      );
    }
  };

  if (isConnected) {
    return (
      <ClientOnly>
        <div className="border rounded-lg p-4">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row space-x-2 items-center">
              <img
                src={ensAvatar || "./account_placeholder.png"}
                alt="ENS Avatar"
                className="h-12 w-12 rounded-full bg-gray-100"
              />
              <div className="flex flex-col">
                <div className="text-lg">
                  {ensName ? `${ensName} (${address})` : address}
                </div>
                <div className="text-gray-700">
                  Connected to {connector?.name}
                </div>
              </div>
            </div>
            <button
              // @ts-ignore
              onClick={disconnect}
              className="bg-blue-500 text-blue-100 rounded-lg p-3 self-start"
            >
              Disconnect
            </button>
          </div>
          <form
            className="flex flex-col mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              sendTransaction?.();
            }}
          >
            <input
              onChange={(e) => setTo(e.target.value)}
              aria-label="Recipient"
              placeholder="0xA0Cf…251e"
              className="border w-full rounded-lg bg-gray-100 p-2"
              value={to}
            />
            <input
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Amount (ether)"
              placeholder="0.05"
              className="border w-full rounded-lg bg-gray-100 p-2"
              value={amount}
            />
            <button
              className="bg-blue-500 w-full text-blue-100 rounded-lg p-3"
              disabled={!to || !amount}
            >
              Send
            </button>
          </form>
          <button onClick={() => publish()}>test publish</button>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div>
        {connectors.map((connector) => (
          <button
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => connect({ connector })}
          >
            {connector.name}
            {!connector.ready && " (unsupported)"}
            {isLoading &&
              connector.id === pendingConnector?.id &&
              " (connecting)"}
          </button>
        ))}

        {error && <div>{error.message}</div>}
      </div>
    </ClientOnly>
  );
}

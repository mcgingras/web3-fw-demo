import useSWR from "swr";

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

export function TxReceiptList() {
  const { data, isLoading } = useSWR("/api/getReceipts", fetcher);
  console.log(data);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data.receipts.length === 0) {
    return <p>No receipts yet...</p>;
  }

  return (
    <>
      {data.receipts.map((tx: any, idx: number) => {
        return <div key={`tx-${idx}`}>{tx.hash}</div>;
      })}
    </>
  );
}

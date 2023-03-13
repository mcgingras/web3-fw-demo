-- CreateTable
CREATE TABLE "TxReceipt" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "TxReceipt_pkey" PRIMARY KEY ("id")
);

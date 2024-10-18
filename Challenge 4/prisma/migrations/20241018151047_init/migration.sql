/*
  Warnings:

  - You are about to drop the column `bankAccountNumber` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `identityNumber` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `identityType` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `destinationAccountId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `sourceAccountId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverAccountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderAccountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_destinationAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_sourceAccountId_fkey";

-- DropIndex
DROP INDEX "BankAccount_bankAccountNumber_key";

-- DropIndex
DROP INDEX "Profile_identityNumber_key";

-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "bankAccountNumber",
DROP COLUMN "bankName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "address",
DROP COLUMN "identityNumber",
DROP COLUMN "identityType",
ADD COLUMN     "bio" TEXT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "destinationAccountId",
DROP COLUMN "sourceAccountId",
ADD COLUMN     "receiverAccountId" INTEGER NOT NULL,
ADD COLUMN     "senderAccountId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password";

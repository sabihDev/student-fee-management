/*
  Warnings:

  - You are about to drop the column `email` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Student` table. All the data in the column will be lost.
  - Added the required column `name` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Student_email_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "name" TEXT NOT NULL;

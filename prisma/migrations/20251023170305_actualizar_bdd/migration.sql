/*
  Warnings:

  - You are about to drop the column `roomNumber` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `roomTypeId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `RoomType` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('disponible', 'ocupada', 'mantenimiento', 'limpieza');

-- DropForeignKey
ALTER TABLE "public"."Reservation" DROP CONSTRAINT "Reservation_roomTypeId_fkey";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "roomNumber",
DROP COLUMN "roomTypeId",
ADD COLUMN     "roomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RoomType" DROP COLUMN "quantity";

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'disponible',
    "roomTypeId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

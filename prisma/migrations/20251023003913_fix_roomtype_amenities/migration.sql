/*
  Warnings:

  - You are about to drop the `_AmenityToRoomType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_AmenityToRoomType" DROP CONSTRAINT "_AmenityToRoomType_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AmenityToRoomType" DROP CONSTRAINT "_AmenityToRoomType_B_fkey";

-- AlterTable
ALTER TABLE "RoomType" ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "public"."_AmenityToRoomType";

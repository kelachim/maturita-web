/*
  Warnings:

  - You are about to drop the column `station_id` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `usbdevice_id` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `station_id` on the `UsbDevice` table. All the data in the column will be lost.
  - Added the required column `stationId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usbdeviceId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_station_id_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_usbdevice_id_fkey";

-- DropForeignKey
ALTER TABLE "UsbDevice" DROP CONSTRAINT "UsbDevice_station_id_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "station_id",
DROP COLUMN "updatedAt",
DROP COLUMN "usbdevice_id",
ADD COLUMN     "stationId" TEXT NOT NULL,
ADD COLUMN     "usbdeviceId" TEXT NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Station" ADD COLUMN     "classroomId" TEXT;

-- AlterTable
ALTER TABLE "UsbDevice" DROP COLUMN "station_id",
ADD COLUMN     "stationId" TEXT;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_endpoint_key" ON "Subscription"("endpoint");

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsbDevice" ADD CONSTRAINT "UsbDevice_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_usbdeviceId_fkey" FOREIGN KEY ("usbdeviceId") REFERENCES "UsbDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

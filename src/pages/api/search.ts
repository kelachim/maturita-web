import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from "@prisma/client"

export type Models = 'Station' | 'Event' | 'Device'

type Fields =
  | Record<"id" | "name" | "status" | "devices" | "events", boolean>
  | Record<"id" | "vendor_id" | "product_id" | "files" | "description" | "serial_number" | "event" | "station", boolean>
  | Record<"id" | "user" | "variation" | "tracked" | "station" | "station_id" | "usbdevice" | "createdAt" | "updatedAt", boolean>

interface SearchProps{
  searchText: string;
  searchField: string;
  activeTab: Models;
  fields: Fields;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | null>
) {
  const { searchText, searchField, activeTab, fields }: SearchProps = req.body;

  const prisma = new PrismaClient();

  let whereClause = {};

  if (searchText) {
    whereClause = {
      //@ts-ignore
      [searchField]: {
        contains: searchText,
        mode: 'insensitive',
      },
    };
  }

  let selectFields = {};
  if (fields) {
    const fieldMap = fields as Fields;
    selectFields = { select: { ...fields, ...fieldMap } };
  } else {
    selectFields = { select: fields };
  }

  let data;
  switch (activeTab) {
    case 'Station':
      data = await prisma.station.findMany({
        where: whereClause,
        ...selectFields,
      });
      break;

    case 'Event':
      data = await prisma.event.findMany({
        where: whereClause,
        ...selectFields,
      });
      break;

    case 'Device':
      data = await prisma.usbDevice.findMany({
        where: whereClause,
        ...selectFields,
      });
      break;

    default:
      res.status(400).json([]);
      return;
  }
  res.status(200).json(data);
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Event } from "@prisma/client"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any[] | null>
) {
    const { text, field, tab } = req.query;

    const prisma = new PrismaClient();

    console.log(req.query);

    let whereClause = {};

    if (text) {
        whereClause = {
            //@ts-ignore
            [field]: {
                contains: text,
                mode: 'insensitive'
            },
        };
    }
    console.log(text, field)

    let data;
    switch (tab) {
        case 'Station':
            data = await prisma.station.findMany({ where: whereClause, include: { devices: true } });
            break;

        case 'Event':
            data = await prisma.event.findMany({ where: whereClause, include: { usbdevice: true, station: true } });
            break;

        case 'Device':
            data = await prisma.usbDevice.findMany({ where: whereClause, include: { station: true } });
            break;

        default:
            res.status(400).json([]);
            return;
    }
    res.status(200).json(data);
}
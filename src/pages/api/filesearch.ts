import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Variation, type Event } from '@prisma/client';
import prisma from '../../utils/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { filename } = req.query;
        const events = await prisma.event.findMany({
            where: {
                variation: Variation.Connect,
                usbdevice: {
                    files: {
                        has: filename as string
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for the given filename.' });
        }

        const firstEvent = events[0];
        const lastEvent = events[events.length - 1];

        res.status(200).json({ firstEvent, lastEvent });
    } else {
        res.status(405).json({ message: 'Method not allowed.' });
    }
}
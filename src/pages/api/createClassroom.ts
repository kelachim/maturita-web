import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../utils/prisma'
import { PrismaClient, type Station } from "@prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {

    const { name, stationIds } = req.body;
    console.log(name, stationIds)

    try {
      const classroom = await prisma.classroom.create({
        data: {
          name,
          stations: {
            connect: stationIds.map((id: string) => ({ id })),
          },
        },
        include: {
          stations: true,
        },
      });

      res.status(200).json(classroom);
    } catch (error) {
      console.error('Error creating classroom:', error);
      res.status(500).json({ message: 'Error creating classroom' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(400).json({ message: "Wrong request method." });
  }
}
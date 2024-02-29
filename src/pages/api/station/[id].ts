import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, PrismaClient, Station } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const prisma = new PrismaClient();

  try {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    if (req.method === 'GET') {

      const station = await prisma.station.findUnique({
        where: { id },
        include: {
          devices: true
        }
      });

      return res.status(200).json(station ?? undefined);

    } else if (req.method === 'PUT') {

      const data = req.body.data as Prisma.StationUpdateInput;
      await prisma.station.update({
        where: { id },
        data  
      });

      return res.status(200);
    
    } else {
      return res.status(405); 
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {  
    await prisma.$disconnect();
  }

}
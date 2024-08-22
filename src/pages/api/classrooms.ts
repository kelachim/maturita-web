import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, type Classroom } from "@prisma/client"
import prisma from '../../utils/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  switch (req.method) {
    case 'GET':
      {
        const classrooms = await prisma.classroom.findMany({
          include: {
            stations: true,
          },
        });
        res.status(200).json(classrooms);
      }
      break;
    case 'PUT':
      {
        const { id, name, stationIds } = req.body;
        const updatedClassroom = await prisma.classroom.update({
          where: { id },
          data: {
            name,
            stations: {
              connect: stationIds.map((id: string) => ({ id })),
            },
          },
        });
        res.status(200).json(updatedClassroom);
      }
      break;
    case 'DELETE':
      {
        const { classroomId } = req.query;
        await prisma.classroom.delete({
          where: { id: String(classroomId) },
        });
        res.status(204).end()
      };
      break;
    default:
      res.status(405).end();
  }
}
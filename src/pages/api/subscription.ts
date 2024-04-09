import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const subscription = req.body.subscription;

    try {
      await prisma.subscription.create({
        data: {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(200).json({ message: 'Subscription already exists' });
      } else {
        console.error('Error saving subscription:', error);
        res.status(500).json({ message: 'Error saving subscription' });
      }
    }
    }
}
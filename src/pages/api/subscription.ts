import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

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
    } catch (error) {
      console.error('Error saving subscription:', error);
      res.status(500).json({ error: 'Failed to save subscription' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
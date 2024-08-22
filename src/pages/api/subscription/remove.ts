import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import webPush, { PushSubscription } from 'web-push';
import prisma from '../../../utils/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { subscription } = req.body;

    try {
      await prisma.subscription.delete({
        where: {
          endpoint: subscription.endpoint,
        },
      });

      

      res.status(200).json({ success: true, message: 'Subscription removed successfully' });
    } catch (error) {
      console.error('Error removing subscription:', error);
      res.status(500).json({ message: 'Error removing subscription' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
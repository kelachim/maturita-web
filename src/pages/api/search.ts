import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import { z } from 'zod';

const prisma = new PrismaClient();

// Define types
type Model = 'Station' | 'Event' | 'Device';

const searchPropsSchema = z.object({
  searchText: z.string(),
  searchField: z.string(),
  activeTab: z.enum(['Station', 'Event', 'Device']),
  fields: z.record(z.boolean())
});

function createWhereClause(searchText: string, searchField: string) {
  return searchText ? {
    [searchField]: {
      contains: searchText,
      mode: 'insensitive' as const,
    }
  } : {};
}

function createSelectClause(fields: Record<string, boolean>, activeTab: Model) {
  const select = Object.entries(fields).reduce((acc, [key, value]) => {
    if (value) acc[key] = true;
    return acc;
  }, { id: true } as Record<string, boolean>); // Always include 'id'
  
  return Object.keys(select).length > 1 ? { select } : {};
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { searchText, searchField, activeTab, fields } = searchPropsSchema.parse(req.body);

    const whereClause = createWhereClause(searchText, searchField);
    const selectClause = createSelectClause(fields);

    let data;
    switch (activeTab) {
      case 'Station':
        data = await prisma.station.findMany({
          where: whereClause,
          ...selectClause,
        });
        break;
      case 'Event':
        data = await prisma.event.findMany({
          where: whereClause,
          ...selectClause,
        });
        break;
      case 'Device':
        data = await prisma.usbDevice.findMany({
          where: whereClause,
          ...selectClause,
        });
        break;
    }
    
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', details: error.errors });
    }
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
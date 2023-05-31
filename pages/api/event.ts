import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const eventData = JSON.parse(req.body);
  const location = eventData.location;
  const date = eventData.date;
  const savedEvent = await prisma.event.create({ data: { location: location, date: date } });

  res.json(savedEvent);
};
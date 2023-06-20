import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const rawEvents = await prisma.event.findMany();

  const events = rawEvents?.filter((event: any) => {
    const eventDate = new Date(event.date).getTime();
    const todayDate = new Date().getTime();
    if (eventDate >= todayDate) {
      return true;
    }
    prisma.event.delete({ where: { id: event.id } });
    return false;
  });

  res.json(events);
};
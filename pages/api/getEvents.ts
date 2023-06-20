import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const rawEvents = await prisma.event.findMany();

  const events = rawEvents?.filter(async (event: any) => {
    const eventDate = new Date(event.date).getTime();
    const todayDate = new Date().getTime();
    if (eventDate >= todayDate) {
      return true;
    }
    const eventDuration = event.duration;
    const eventUsers = event.users?.map((user: any) => user.username);
    const users = (await prisma.user.findMany({
      include: {clan : true}
    })).filter((user: any) => eventUsers?.includes(user.username) && user.clan);

    users?.map(async (user: any) => {
      const clan = user.clan;
      await prisma.clan.update({
        where: { name: clan.name },
        data: { points: clan.points + eventDuration }});
      });
    prisma.event.delete({ where: { id: event.id } });
    return false;
  });

  res.json(events);
};
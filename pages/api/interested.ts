import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const data = JSON.parse(req.body);
  const interestGiven = data.interestGiven;
  const id = data.id;
  var savedEvent;

  if (interestGiven) {
          savedEvent = await prisma.event.update({
            where: {
              id: id
            },
            data: {
              interested: {increment: -1},
            },
          })
        }
        else {
          savedEvent = await prisma.event.update({
            where: {
              id: id
            },
            data: {
              interested: {increment: 1},
            },
          })
        }

  res.json(savedEvent);
};
import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const data = JSON.parse(req.body);
  const interestGiven = data.interestGiven;
  const id = data.id;
  const name = data.user;
  var savedEvent;

  if (interestGiven) {
          savedEvent = await prisma.event.update({
            where: {
              id: id
            },
            data: {
              users: {
                disconnect: {
                  username: name
                }
              },
              interested: {increment: -1}
            },
          })
        }
        else {
          savedEvent = await prisma.event.update({
            where: {
              id: id
            },
            data: {
              users: {
                connect: {
                  username: name
                }
              },
              interested: {increment: 1}
            },
          })
        }

  res.json(savedEvent);
};
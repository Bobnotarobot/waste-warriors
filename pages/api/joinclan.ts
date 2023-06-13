import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const data = JSON.parse(req.body);
  const joined = data.joined;
  const user = data.user;
  const clan = data.clan;
  var joinedClan;

  if (joined) {
    joinedClan = await prisma.clan.update({
        where: {
          name: clan
        },
        data: {
          members: {
            disconnect : {
                username: user
                }
            },
        },
    })
  }
  else {
    joinedClan = await prisma.clan.update({
        where: {
        name: clan
        },
        data: {
        members: {
            connect : {
                username: user
            }
        },
        },
    })
  }

  res.json(joinedClan);
};
import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const clanData = JSON.parse(req.body);
  const oldName = clanData.oldName;
  const name = clanData.name;
  const location = clanData.location;
  const lat = Number(clanData.lat);
  const lng = Number(clanData.lng);
  const logo = clanData.logo;
  const description = clanData.description;
  const savedEvent = await prisma.clan.update({
    where: {
      name: oldName
    },
    data: {
      name: name,
      location: location,
      lat: lat,
      lng: lng,
      logo: logo,
      description: description,
    }
  });

  res.json(savedEvent);
};
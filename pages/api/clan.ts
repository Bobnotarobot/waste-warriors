import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const clanData = JSON.parse(req.body);
  const location = clanData.location;
  const lat = Number(clanData.lat);
  const lng = Number(clanData.lng);
  const name = clanData.name;
  const logo = clanData.logo;
  const creationDate = clanData.creationDate;
  const description = clanData.description;
  const data = { location: location, lat: lat, lng: lng, name: name, logo: logo, creationDate: creationDate, description: description, points: 0 };
  const savedEvent = await prisma.clan.create({ data: data });

  res.json(savedEvent);
};
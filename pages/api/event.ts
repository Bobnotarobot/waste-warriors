import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const eventData = JSON.parse(req.body);
  const location = eventData.location;
  const date = eventData.date;
  const duration = eventData.duration;
  const creationDate = eventData.creationDate;
  const description = eventData.description;
  const social = eventData.social;
  const socialDescription = eventData.socialDescription;
  const savedEvent = await prisma.event.create({ data: { location: location, date: date, duration: duration, creationDate: creationDate, description: description, social: social, socialDescription: socialDescription } });

  res.json(savedEvent);
};
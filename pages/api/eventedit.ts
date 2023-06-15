import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const eventData = JSON.parse(req.body);
  const id = eventData.id;
  const location = eventData.location;
  const lat = Number(eventData.lat);
  const lng = Number(eventData.lng);
  const date = eventData.date;
  const duration = Number(eventData.duration);
  const description = eventData.description;
  const social = eventData.social;
  const socialDescription = eventData.socialDescription;
  const savedEvent = await prisma.event.update({
      where: {
        id: id
      },
      data: {
        location: location,
        lat: lat,
        lng: lng,
        date: date,
        duration: duration,
        description: description,
        social: social,
        socialDescription: socialDescription
      }
  });

  res.json(savedEvent);
};
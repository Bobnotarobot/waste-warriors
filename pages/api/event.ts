import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const eventData = JSON.parse(req.body);
  const organiser = eventData.organiser;
  const location = eventData.location;
  const lat = Number(eventData.lat);
  const lng = Number(eventData.lng);
  const date = eventData.date;
  const duration = Number(eventData.duration);
  const creationDate = eventData.creationDate;
  const description = eventData.description;
  const social = eventData.social;
  const socialDescription = eventData.socialDescription;
  const data = { location: location, lat: lat, lng: lng, date: date, duration: duration, creationDate: creationDate, description: description, interested: 0, social: social, socialDescription: socialDescription, orgKey: organiser };
  const savedEvent = await prisma.event.create({ data: data });

  res.json(savedEvent);
};
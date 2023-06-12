import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const accountData = JSON.parse(req.body);
  const username = accountData.username;
  const password = accountData.password;
  const data = { username: username, password: password };
  const savedEvent = await prisma.user.create({ data: data });
  res.json(savedEvent);
};
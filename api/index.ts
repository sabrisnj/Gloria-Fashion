import { getApp } from '../server';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  const app = await getApp();
  return app(req, res);
};

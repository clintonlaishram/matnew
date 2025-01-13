import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import { verify } from 'jsonwebtoken';
import { Message } from '../../types/message';

const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: 5432,
});

client.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const token = authorization.split(' ')[1]; // Bearer <token>
      const decoded = verify(token, process.env.JWT_SECRET as string) as { email: string }; // JWT_SECRET from .env
      const userEmail = decoded.email;

      // Query the database for messages where the email matches the logged-in user's email
      const result = await client.query<Message>('SELECT * FROM message_data WHERE email = $1', [userEmail]);

      return res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Invalid token or error fetching data' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

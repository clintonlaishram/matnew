import { Client } from 'pg';

const client = new Client({
  user: process.env.PG_USER, // Store your credentials securely, e.g., in environment variables
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: 5432,
});

client.connect();

export default client;

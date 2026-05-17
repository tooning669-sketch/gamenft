import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://nft-tooning669-sketch.aws-ap-northeast-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default db;

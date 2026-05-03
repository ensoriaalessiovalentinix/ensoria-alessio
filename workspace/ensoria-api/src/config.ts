import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'ensoria-dev-secret-change-in-production',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
};

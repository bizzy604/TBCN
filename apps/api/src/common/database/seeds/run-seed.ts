import { DataSource } from 'typeorm';
import { seedPrograms } from './seed-programs';

async function run(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5433', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'brandcoach',
  });

  await dataSource.initialize();
  try {
    await seedPrograms(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed run failed:', error);
    process.exit(1);
  });


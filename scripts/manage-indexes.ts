import { connectDB, disconnectDB } from '../src/config/db';
import { ensureIndexes, listIndexes, dropIndexes, getIndexStats } from '../src/services/index.service';

async function main() {
  const command = process.argv[2];

  await connectDB();

  try {
    switch (command) {
      case 'create':
        await ensureIndexes();
        break;

      case 'list':
        await listIndexes();
        break;

      case 'drop':
        await dropIndexes();
        break;

      case 'stats':
        const stats = await getIndexStats();
        console.log('\n=== Index Statistics ===');
        console.log(JSON.stringify(stats, null, 2));
        break;

      default:
        console.log('Usage: npm run indexes [create|list|drop|stats]');
        break;
    }
  } catch (error: any) {
    console.error('Error:', error);

    process.exit(1);
  } finally {
    await disconnectDB();

    process.exit(0);
  }
}

main();

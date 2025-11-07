import { createServer } from './app';
import { env } from '@/core/infrastructure/config/env';
import { connectDB, disconnectDB } from '@/core/infrastructure/config/db';
import { DIContainer } from '@/core/infrastructure/config/di-container';

async function main(): Promise<void> {
  await connectDB();

  const container = DIContainer.getInstance();
  await container.initialize();

  const app = createServer(container);
  const server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`API Docs: http://localhost:${env.PORT}/api-docs`);
  });

  const shutdownHandler = (signal: string) => {
    console.log(`\nCaught ${signal}. Shutting down...`);

    server.close(async () => {
      try {
        await disconnectDB();
      } finally {
        console.log('Server closed');

        process.exit(0);
      }
    });

    setTimeout(() => {
      console.error('Force exiting after timeout');

      process.exit(1);
    }, 5_000);
  };

  process.on('SIGINT', () => shutdownHandler('SIGINT'));
  process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
  process.on('uncaughtException', (error: any) => {
    console.error('Uncaught Exception:', error);

    shutdownHandler('uncaughtException');
  });
}

main().catch((error: any) => {
  console.error('Fatal error:', error);

  process.exit(1);
});

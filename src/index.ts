import { createServer } from './app';
import { env } from './config/env';

async function main() {
  const app = createServer();
  const server = app.listen(env.PORT, () => console.log(`Server running on http://localhost:${env.PORT}`));

  const shutdownHandler = (signal: string) => {
    console.log(`\nCaught ${signal}. Shutting down...`);

    server.close(() => {
      console.log('Server closed');

      process.exit(0);
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

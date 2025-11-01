import { env } from './config/env';
import { createServer } from './app';

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
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);

    shutdownHandler('uncaughtException');
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);

  process.exit(1);
});

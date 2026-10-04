import http from 'node:http';
import process from 'node:process';
import { scaffoldApp } from './app.js';
import { type Request, type Response } from 'express';

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const SHUTDOWN_TIMEOUT = 10_000;

let server: http.Server | undefined;
let isShuttingDown = false;

const bootStrap = async (): Promise<void> => {
  try {
    const app = scaffoldApp();
    server = http.createServer(app);

    app.get('/', (req: Request, res: Response) => {
      res.json({ message: 'Server is running' });
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
      } else if (error.code === 'EACCES') {
        console.error(`Permission denied while attempting to bind to ${HOST}:${PORT}.`);
      } else {
        console.error('HTTP server error:', error);
      }

      process.exit(1);
    });

    server.on('listening', () => {
      const address = server?.address();

      if (typeof address === 'object' && address !== null) {
        console.log(`HTTP server listening on ${address.address}:${address.port}`);
      } else {
        console.log(`HTTP server listening on ${HOST}:${PORT}`);
      }
    });

    server.listen(PORT, HOST);
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
};

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  const forceShutdownTimer = setTimeout(() => {
    console.error(`Graceful shutdown exceeded ${SHUTDOWN_TIMEOUT}ms. Forcing process termination.`);

    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  forceShutdownTimer.unref();

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close(error => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      console.log('HTTP server closed successfully.');
    }

    clearTimeout(forceShutdownTimer);

    process.exit(0);
  } catch (error) {
    clearTimeout(forceShutdownTimer);

    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
  void shutdown('uncaughtException');
});

process.on('unhandledRejection', reason => {
  console.error('Unhandled promise rejection:', reason);
  void shutdown('unhandledRejection');
});

await bootStrap();

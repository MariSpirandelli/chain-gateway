import bunyan from 'bunyan';
import config from './config';
import api from './express';

const log = bunyan.createLogger({ name: 'api' });

process.on('uncaughtException', (err) => {
  log.error('[UncaughtException] SERVER ERROR:', err);

  // prevent undefined state of the application
  process.exit(-500);
});

process.on('unhandledRejection', (err: any, promise) =>
  log.error('[UnhandledRejection]', err.message, '\n', err, promise)
);

const exitSignalHandler = (arg) => {
  log.info('Exit code received', arg);
};
process.on('SIGINT', exitSignalHandler);
process.on('SIGUSR1', exitSignalHandler);
process.on('SIGUSR2', exitSignalHandler);

log.info('[STARTING] Server process at UTC:', new Date());

const app = api();

app.listen(config.port, () => {
  log.info(`Server running on http://localhost:${config.port}/`);
});

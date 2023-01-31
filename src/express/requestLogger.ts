import bunyan from 'bunyan';
import { NextFunction, Request, Response } from 'express';
import onHeaders from 'on-headers';

/**
 * Execute a listener when a response is about to write headers.
 * The listener is passed the response object as it's context (this). Headers are
 * considered to be emitted only once, right before they are sent to the client.
 */
export default function requestLogger() {
  const log = bunyan.createLogger({ name: 'requests' });

  return (req: Request, res: Response, next: NextFunction) => {
    const startAt = process.hrtime();

    onHeaders(res, () => {
      const diff = process.hrtime(startAt);
      const diffMilliseconds = diff[0] * 1e3 + Math.round(diff[1] * 1e-6);

      const logData = {
        method: req.method,
        path: req.url,
        remoteAddress: req.ip,
        statusCode: res.statusCode,
        responseTime: diffMilliseconds,
      };

      log.info(logData);
    });

    next();
  };
}

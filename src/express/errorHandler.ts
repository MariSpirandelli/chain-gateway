import bunyan from 'bunyan';
import { NextFunction, Request, Response } from 'express';
import { HttpBaseError } from './errors/base';
import { InternalError } from './errors/internal';

const logger = bunyan.createLogger({ name: 'ErrorHandler' });

export const asyncHandler = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const errorHandler = (err: any, _: any, res: any, next: any) => {
  if (res.headersSent) {
    return next(err);
  }

  const errorOutput = err.resultOutput ? err.resultOutput() : err;

  logger.error(`Request error: `, errorOutput);

  if (err instanceof HttpBaseError) {
    res.status(err.code).send(errorOutput);

    return;
  }

  const internalError = new InternalError(err);

  res.status(internalError.code).send(internalError.resultOutput());

  return;
};

export default errorHandler;

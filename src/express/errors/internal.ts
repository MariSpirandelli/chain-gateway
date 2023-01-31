import { HttpBaseError } from './base';

export class InternalError extends HttpBaseError {
  constructor(msg: string = 'Internal error') {
    super(msg, 500);
  }
}

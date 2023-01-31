import { HttpBaseError } from './base';

export class NotFoundError extends HttpBaseError {
  constructor(msg: string = 'Not found') {
    super(msg, 404);
  }
}

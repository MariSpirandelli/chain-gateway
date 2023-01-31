import { HttpBaseError } from './base';

export class ForbiddenError extends HttpBaseError {
  constructor(msg: string = 'Forbidden') {
    super(msg, 403);
  }
}

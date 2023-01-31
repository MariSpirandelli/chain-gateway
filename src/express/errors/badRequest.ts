import { HttpBaseError } from './base';

export class BadRequestError extends HttpBaseError {
  constructor(msg: string = 'Bad request') {
    super(msg, 400);
  }
}

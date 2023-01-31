import { HttpBaseError } from './base';

export class ValidationError extends HttpBaseError {
  constructor(msg: string = 'Not valid') {
    super(msg, 400);
  }
}

export abstract class HttpBaseError extends Error {
  public message: string;
  public code: number;

  constructor(message, code) {
    super();

    this.message = message;
    this.code = code;
  }

  resultOutput() {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

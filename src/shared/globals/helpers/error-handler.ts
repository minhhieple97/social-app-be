import HTTP_STATUS_CODE from 'http-status-codes';
export interface IErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  serializeErrors(): IError;
}

export interface IError {
  message: string;
  statusCode: number;
  status: string;
}

export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract status: string;

  constructor(message: string) {
    super(message);
  }

  serializeErrors(): IError {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status
    };
  }
}

export class BadRequestError extends CustomError {
  statusCode = HTTP_STATUS_CODE.BAD_REQUEST;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends CustomError {
  statusCode = HTTP_STATUS_CODE.NOT_FOUND;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}

export class UnAuthorizedError extends CustomError {
  statusCode = HTTP_STATUS_CODE.UNAUTHORIZED;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}

export class IntervalServerError extends CustomError {
  statusCode = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}

export class FilTooLargeError extends CustomError {
  statusCode = HTTP_STATUS_CODE.REQUEST_TOO_LONG;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}

export class JoiValidationError extends CustomError {
  statusCode = HTTP_STATUS_CODE.REQUEST_TOO_LONG;
  status = 'error';
  constructor(message: string) {
    super(message);
  }
}

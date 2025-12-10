import { ApiResponse } from '../interfaces/response.interface';

export class ResponseHelper {
  static success<T>(
    data?: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): ApiResponse<T> {
    return {
      statusCode,
      message,
      data,
    };
  }

  static created<T>(
    data?: T,
    message: string = 'Created successfully',
  ): ApiResponse<T> {
    return {
      statusCode: 201,
      message,
      data,
    };
  }

  static error(
    message: string = 'An error occurred',
    statusCode: number = 500,
  ): ApiResponse {
    return {
      statusCode,
      message,
    };
  }
}

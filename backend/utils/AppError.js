class AppError extends Error {
  constructor(statusCode = 500, message = "Something went wrong!", data = {}) {
    super(message); // Call the Error constructor
    this.statusCode = statusCode;
    this.data = data;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
const BadRequestError = require("./badrequest");
const NotFoundError = require("./not-found");
const UnauthenticatedError = require("./unauthenticated");
const UnauthorizedError = require("./unauthorized");
const CustomError = require('./custom-errors')

class APIError extends CustomError {
  constructor (message, statusCode) {
    super(message)
    this.StatusCodes = statusCode
  }
}

module.exports = {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
  APIError
};

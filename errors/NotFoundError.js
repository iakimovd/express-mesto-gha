class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.errorMessage = message;
    this.name = 'NotFoundError';
    this.errorCode = 404;
  }
}

module.exports = NotFoundError;

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = 'NotFoundError';
    this.errorCode = 404;
  }
}

module.exports = NotFoundError;

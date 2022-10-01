class DefaultError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = 'DefaultError';
    this.errorCode = 500;
  }
}

module.exports = DefaultError;

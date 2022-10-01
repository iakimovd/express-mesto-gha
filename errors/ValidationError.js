class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.errorMessage = message;
    this.name = 'ValidationError';
    this.errorCode = 400;
  }
}

module.exports = ValidationError;

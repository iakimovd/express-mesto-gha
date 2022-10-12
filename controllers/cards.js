const Card = require('../models/card');

const { NOT_FOUND_CODE, SERVER_ERROR_CODE, VALIDATION_ERROR_CODE } = require('../utils/constants');
const DefaultError = require('../errors/InternalServerError');
const NotFoundError = require('../errors/NotFound');
const ValidationError = require('../errors/BadRequest');

const defaultError = new DefaultError('Ошибка по умолчанию');
const notFoundError = new NotFoundError('Карточка или пользователь не найден');
const validationError = new ValidationError('Переданы некорректные данные в методы');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(SERVER_ERROR_CODE).send({ message: defaultError.message }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(VALIDATION_ERROR_CODE).send({ message: validationError.message });
      } else {
        res.status(SERVER_ERROR_CODE).send({ message: defaultError.message });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new NotFoundError(`Карточка с id '${req.params.cardId}' не найдена`))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.errorCode === NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: notFoundError.message });
      }
      if (err.name === 'CastError') {
        res.status(VALIDATION_ERROR_CODE).send({ message: validationError.message });
      } else {
        res.status(SERVER_ERROR_CODE).send({ message: defaultError.message });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  ).orFail(new NotFoundError(`Карточка с id '${req.params.cardId}' не найдена`))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.errorCode === NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: notFoundError.message });
      }
      if (err.name === 'CastError') {
        res.status(VALIDATION_ERROR_CODE).send({ message: validationError.message });
      } else {
        res.status(SERVER_ERROR_CODE).send({ message: defaultError.message });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  ).orFail(new NotFoundError(`Карточка с id '${req.params.cardId}' не найдена`))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.errorCode === NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: notFoundError.message });
      }
      if (err.name === 'CastError') {
        res.status(VALIDATION_ERROR_CODE).send({ message: validationError.message });
      } else {
        res.status(SERVER_ERROR_CODE).send({ message: defaultError.message });
      }
    });
};

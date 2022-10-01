const Card = require('../models/card');

const DefaultError = require('../errors/DefaultError');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');

const defaultError = new DefaultError('Ошибка по умолчанию');
const notFoundError = new NotFoundError('Карточка или пользователь не найден');
const validationError = new ValidationError('Переданы некорректные данные в методы');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: defaultError.message }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: validationError.message });
      } else {
        res.status(500).send({ message: defaultError.message });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new NotFoundError(`Карточка с id '${req.params.cardId}' не найдена`))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'NotFound') {
        res.status(404).send({ message: notFoundError.message });
      }
      if (err.name === 'CastError') {
        res.status(400).send({ message: validationError.message });
      } else {
        res.status(500).send({ message: defaultError.message });
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
      if (err.name === 'NotFound') {
        res.status(404).send({ message: notFoundError.message });
      }
      if (err.name === 'CastError') {
        res.status(400).send({ message: validationError.message });
      } else {
        res.status(500).send({ message: defaultError.message });
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
      if (err.name === 'NotFound') {
        res.status(404).send({ message: notFoundError.message });
      }
      if (err.name === 'CastError') {
        res.status(400).send({ message: validationError.message });
      } else {
        res.status(500).send({ message: defaultError.message });
      }
    });
};

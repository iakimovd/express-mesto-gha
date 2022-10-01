const User = require('../models/user');

const DefaultError = require('../errors/DefaultError');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');

const defaultError = new DefaultError('Ошибка по умолчанию');
const notFoundError = new NotFoundError('Карточка или пользователь не найден');
const validationError = new ValidationError('Переданы некорректные данные в методы');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: validationError.message });
      } else {
        res.status(500).send({ message: defaultError.message });
      }
    });
};

module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(new NotFoundError(`Пользователь с id '${req.params.userId}' не найден`))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: validationError.message });
      }
      if (err.errorCode === 404) {
        res.status(404).send({ message: notFoundError.message });
      } else {
        res.status(500).send({ message: defaultError.message });
      }
    });
};

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(new NotFoundError(`Пользователь с id '${req.params.userId}' не найден`))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'NotFound') {
        res.status(404).send({ message: notFoundError.message });
      }
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: validationError.message });
      } else {
        res.status(500).send({ message: defaultError.message });
      }
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(new NotFoundError(`Пользователь с id '${req.params.userId}' не найден`))
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

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NOT_FOUND_CODE, SERVER_ERROR_CODE, VALIDATION_ERROR_CODE } = require('../utils/constants');
const DefaultError = require('../errors/InternalServerError');
const NotFoundError = require('../errors/NotFound');
const ValidationError = require('../errors/BadRequest');

const defaultError = new DefaultError('Ошибка по умолчанию');
const notFoundError = new NotFoundError('Карточка или пользователь не найден');
const validationError = new ValidationError('Переданы некорректные данные в методы');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(SERVER_ERROR_CODE).send({ message: defaultError.message }));
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash, // записываем хеш в базу
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
    }))
    .then((user) => {
      res.status(201).send({ _id: user._id, email: user.email });
    })
    .catch(next);
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password);
    })
    .then((user) => {
      if (!user) {
        // хеши не совпали — отклоняем промис
        Promise.reject(new Error('Неправильные почта или пароль'));
      }
      const token = jwt.sign(
        { _id: user._id },
        { expiresIn: '7d' }, // токен будет просрочен через час после создания
      );
      // аутентификация успешна
      res.send({ token });
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err.message });
    });
};

module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(new NotFoundError(`Пользователь с id '${req.params.userId}' не найден`))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(VALIDATION_ERROR_CODE).send({ message: validationError.message });
      }
      if (err.errorCode === NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: notFoundError.message });
      } else {
        res.status(SERVER_ERROR_CODE).send({ message: defaultError.message });
      }
    });
};

module.exports.getUserInfo = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(new NotFoundError(`Пользователь с id '${req.params.userId}' не найден`))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(VALIDATION_ERROR_CODE).send({ message: validationError.message });
      }
      if (err.errorCode === NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: notFoundError.message });
      } else {
        res.status(SERVER_ERROR_CODE).send({ message: defaultError.message });
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
        res.status(NOT_FOUND_CODE).send({ message: notFoundError.message });
      }
      if (err.name === 'ValidationError') {
        res.status(VALIDATION_ERROR_CODE).send({ message: validationError.message });
      } else {
        res.status(SERVER_ERROR_CODE).send({ message: defaultError.message });
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
        res.status(NOT_FOUND_CODE).send({ message: notFoundError.message });
      }
      if (err.name === 'ValidationError') {
        res.status(VALIDATION_ERROR_CODE).send({ message: validationError.message });
      } else {
        res.status(SERVER_ERROR_CODE).send({ message: defaultError.message });
      }
    });
};

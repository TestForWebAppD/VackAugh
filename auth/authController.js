// Подключение необходимых библиотек и модулей
const bcrypt = require('bcryptjs'); // Для хеширования паролей
const { validationResult } = require('express-validator'); // Для валидации данных из запросов
const jwt = require('jsonwebtoken'); // Для генерации JWT-токенов
const { secret } = require('../config'); // Секретный ключ для JWT
const multer = require('multer'); // Для обработки загрузки файлов
const fs = require('fs'); // Для работы с файловой системой
const path = require('path'); // Для работы с путями файлов

const User = require('../models/User'); // Модель пользователя
const Role = require('../models/Role'); // Модель ролей
const crypto = require("crypto"); // Для генерации случайных строк, например, паролей

// Функция генерации JWT-токена
const generateAccessToken = (id, roles) => {
    const payload = {
        id, // ID пользователя
        roles, // Роли пользователя
    }

    // Возвращаем токен, который будет действовать 24 часа
    return jwt.sign(payload, secret, {expiresIn: '24h'});
}

// Настройка хранения файлов для загрузки через multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Указываем папку для загрузки файлов
        const uploadPath = path.join(__dirname, 'uploads', 'recipes');
        // Создаем папку, если ее нет
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath); // Указываем путь для хранения файлов
    },
    filename: (req, file, cb) => {
        // Генерация уникального имени файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

// Экземпляр загрузчика файлов с указанными настройками
const upload = multer({ storage });

// Класс для работы с аутентификацией и авторизацией
class authController {
    // Обработчик для callback-урла после входа через GitHub
    async githubCallback(req, res) {
        try {
            const user = req.user; // Получаем информацию о пользователе
            const username = user.username; // Извлекаем имя пользователя

            // Проверяем, существует ли пользователь в базе данных
            let existingUser = await User.findOne({ username });

            if (!existingUser) { // Если пользователь не найден
                // Генерируем случайный пароль
                const randomPassword = crypto.randomBytes(8).toString('hex');
                // Хешируем пароль
                const hashedPassword = bcrypt.hashSync(randomPassword, 8);

                // Находим роль "USER"
                const userRole = await Role.findOne({ value: "USER" });
                if (!userRole) {
                    return res.status(400).json({ message: 'Role "USER" not found' });
                }

                // Создаем нового пользователя
                existingUser = new User({
                    username: username,
                    password: hashedPassword,
                    roles: [userRole.value],
                    git: 'git', // Указываем, что пользователь зарегистрирован через GitHub
                });
                await existingUser.save(); // Сохраняем пользователя в базе данных
            }

            // Генерируем токен для аутентификации
            const userId = existingUser._id;
            const userRoles = existingUser.roles;
            const token = generateAccessToken(userId, userRoles);

            // Перенаправляем на фронтенд с токеном
            res.redirect(`http://localhost:3000/login?token=${token}&name=${username}`);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'GitHub Login Error' });
        }
    }

    // Обработчик регистрации нового пользователя
    async registration(req, res) {
        try {
            // Проверка на ошибки валидации
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "username must not be empty" });
            }

            const { username, password } = req.body; // Получаем данные из тела запроса

            // Проверка, существует ли уже пользователь с таким именем
            const candidate = await User.findOne({ username });
            if (candidate) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Хешируем пароль
            const hashPassword = bcrypt.hashSync(password, 8);

            // Находим роль "USER"
            const userRole = await Role.findOne({ value: "USER" });
            if (!userRole) {
                return res.status(400).json({ message: 'Role "USER" not found' });
            }

            // Создаем нового пользователя
            const user = new User({ username, password: hashPassword, roles: [userRole.value] });
            await user.save(); // Сохраняем пользователя в базе данных
            return res.json({ message: 'Registration successfully' });
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Registration error' });
        }
    }

    // Обработчик для авторизации пользователя
    async login(req, res) {
        try {
            const { username, password } = req.body; // Получаем данные из тела запроса
            const user = await User.findOne({ username }); // Ищем пользователя по имени

            if (!user) {
                return res.status(400).json({ message: 'User not find' }); // Если пользователя нет, возвращаем ошибку
            }

            // Проверяем правильность пароля
            const validatePassword = await bcrypt.compareSync(password, user.password);
            if (!validatePassword) {
                return res.status(400).json({ message: 'Password not correct' }); // Если пароль неверный, возвращаем ошибку
            }

            // Генерируем токен и отправляем его пользователю
            const token = generateAccessToken(user._id, user.roles);
            return res.json({ token });
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Login error' });
        }
    }

    // Обработчик для получения профиля пользователя
    async getProfile(req, res) {
        try {
            const userId = req.user.id; // Получаем userId из токена
            const user = await User.findById(userId).select('-password'); // Ищем пользователя по ID без пароля

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Возвращаем информацию о пользователе
            res.json(user);
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Error fetching profile' });
        }
    }

    // Обработчик для обновления профиля пользователя
    async updateProfile(req, res) {
        try {
            const userId = req.user.id; // Получаем userId из токена
            const { username, description } = req.body; // Получаем данные из тела запроса

            // Ищем пользователя по ID
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Обновляем данные пользователя
            if (username) {
                user.username = username;
            }
            if (description) {
                user.description = description;
            }

            await user.save(); // Сохраняем обновленного пользователя

            res.json(user); // Возвращаем обновленного пользователя
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Error updating profile' });
        }
    }
}

// Экспортируем экземпляр класса
module.exports = new authController();

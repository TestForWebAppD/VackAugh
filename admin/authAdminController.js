// Импортируем необходимые модули
const bcrypt = require('bcryptjs'); // Для хэширования паролей
const jwt = require('jsonwebtoken'); // Для создания JWT токенов
const { secret } = require('../config'); // Секретный ключ для подписи JWT токенов из конфигурации
const User = require('../models/User'); // Модель пользователя для работы с базой данных
const Artist = require('../music/Music.model'); // Модель артиста для работы с музыкальными данными
const crypto = require("crypto"); // Модуль для генерации случайных данных, используется для создания пароля

// Функция для генерации access токена с указанным id и ролями
const generateAccessToken = (id, roles) => {
    const payload = { id, roles }; // Формируем payload для токена
    return jwt.sign(payload, secret, { expiresIn: '24h' }); // Подписываем токен с истечением через 24 часа
};

// Основной контроллер для административных операций
class authAdminController {
    // Обработка callback после успешной аутентификации через GitHub
    async githubCallback(req, res) {
        try {
            const user = req.user; // Получаем данные пользователя из запроса
            const username = user.username; // Извлекаем имя пользователя

            // Проверяем, существует ли уже пользователь с таким именем
            let existingUser = await User.findOne({ username });

            // Если пользователь не найден, создаём нового
            if (!existingUser) {
                const randomPassword = crypto.randomBytes(8).toString('hex'); // Генерация случайного пароля
                const hashedPassword = bcrypt.hashSync(randomPassword, 8); // Хэширование пароля

                // Проверка роли пользователя
                const userRole = await Role.findOne({ value: "USER" });
                if (!userRole) {
                    return res.status(400).json({ message: 'Role "USER" not found' }); // Если роль не найдена
                }

                // Проверка, является ли пользователь администратором
                if (!user.roles.includes('ADMIN')) {
                    return res.status(403).json({ message: 'Access denied. Not an admin.' }); // Если нет, доступ запрещён
                }

                // Создание нового пользователя с ролью "USER"
                existingUser = new User({
                    username: username,
                    password: hashedPassword,
                    roles: [userRole.value],
                    git: 'git',
                });
                await existingUser.save(); // Сохраняем нового пользователя
            }

            // Генерация токена для пользователя
            const userId = existingUser._id;
            const userRoles = existingUser.roles;
            const token = generateAccessToken(userId, userRoles);

            // Перенаправляем пользователя на фронтенд с токеном
            res.redirect(`http://localhost:3000/login?token=${token}&name=${username}`);
        } catch (e) {
            console.error(e); // Логирование ошибки
            res.status(500).json({ message: 'GitHub Login Error' }); // Ответ с ошибкой
        }
    }

    // Метод для входа пользователя
    async login(req, res) {
        try {
            const { username, password } = req.body; // Извлекаем данные из тела запроса

            // Проверяем, существует ли пользователь с таким именем
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: 'Invalid login or password' }); // Если нет, возвращаем ошибку
            }

            // Проверяем, есть ли у пользователя роль "ADMIN"
            if (!user.roles.includes('ADMIN')) {
                return res.status(403).json({ message: 'Access denied. Not an admin.' }); // Если нет, доступ запрещён
            }

            // Проверка пароля
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid login or password' }); // Если пароль неверный
            }

            // Генерация токена и отправка его в ответ
            const token = generateAccessToken(user._id, user.roles);
            return res.status(200).json({ token });
        } catch (e) {
            console.error('Login error:', e); // Логирование ошибки
            return res.status(500).json({ message: 'Invalid login or password' }); // Ответ с ошибкой
        }
    }

    // Получение всех пользователей
    async getAllUsers(req, res) {
        try {
            const users = await User.find(); // Получаем всех пользователей из базы данных
            res.status(200).json(users); // Отправляем список пользователей
        } catch (error) {
            console.error("Error fetching users:", error); // Логирование ошибки
            res.status(500).json({ error: "Error fetching users" }); // Ответ с ошибкой
        }
    }

    // Удаление пользователя
    async deleteUser(req, res) {
        try {
            const { userId } = req.body;

            const deletedUser = await User.findOneAndDelete({ username: userId });

            if (!deletedUser) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            res.status(200).json({ message: 'Пользователь удалён' });
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера при удалении пользователя' });
        }
    }

    // Получение профиля пользователя
    async getProfile(req, res) {
        try {
            const userId = req.user.id; // Получаем id пользователя из данных сессии
            const user = await User.findById(userId).select('-password'); // Ищем пользователя, исключая пароль

            // Если пользователь не найден
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Отправляем профиль пользователя
            res.status(200).json(user);
        } catch (e) {
            console.error('Error fetching profile:', e); // Логирование ошибки
            res.status(500).json({ message: 'Error fetching profile' }); // Ответ с ошибкой
        }
    }

    // Создание нового артиста
    async createArtist(req, res) {
        try {
            const artistData = req.body; // Извлекаем данные артиста из тела запроса

            const newArtist = new Artist(artistData); // Создаём нового артиста
            await newArtist.save(); // Сохраняем в базе данных

            res.status(201).json(newArtist); // Отправляем созданного артиста в ответ
        } catch (error) {
            console.error(error); // Логирование ошибки
            res.status(500).json({ message: 'Error creating artist' }); // Ответ с ошибкой
        }
    }

    // Получение всех артистов
    async getArtists(req, res) {
        try {
            const artists = await Artist.find(); // Получаем всех артистов
            res.status(200).json(artists); // Отправляем список артистов
        } catch (error) {
            console.error(error); // Логирование ошибки
            res.status(500).json({ message: 'Error fetching artists' }); // Ответ с ошибкой
        }
    }

    // Получение артиста по id
    async getArtistById(req, res) {
        try {
            const { id } = req.params; // Получаем id артиста из параметров
            const artist = await Artist.findById(id); // Ищем артиста по id

            if (!artist) return res.status(404).json({ message: 'Artist not found' }); // Если не найден, возвращаем ошибку

            res.status(200).json(artist); // Отправляем информацию об артисте
        } catch (error) {
            console.error(error); // Логирование ошибки
            res.status(500).json({ message: 'Error fetching artist' }); // Ответ с ошибкой
        }
    }

    // Обновление песен по автору
    async updateSongsByAuthor(req, res) {
        try {
            const { author } = req.body;
            const { songs } = req.body;

            if (!songs || !Array.isArray(songs)) {
                return res.status(400).json({ message: "Invalid songs data provided." });
            }

            const authorData = await Artist.findOne({ title: author });

            if (!authorData) {
                return res.status(404).json({ message: "Author not found." });
            }

            // Обновление или добавление песен
            songs.forEach((updatedSong) => {
                const songIndex = authorData.songs.findIndex(
                    (song) => song.title === updatedSong.title
                );

                if (songIndex !== -1) {
                    authorData.songs[songIndex] = {
                        ...authorData.songs[songIndex],
                        ...updatedSong,
                    };
                } else {
                    authorData.songs.push(updatedSong);
                }
            });

            await authorData.save(); // Сохраняем обновлённого автора

            return res.status(200).json({ message: "Songs updated successfully.", songs: authorData.songs });
        } catch (error) {
            console.error("Error updating songs:", error);
            return res.status(500).json({ message: "Server error.", error: error.message });
        }
    }

    // Создание новой песни для автора
    async createNewSongByAuthor(req, res) {
        try {
            const { artist, title, duration, genre, releaseDate, description, rating } = req.body;

            if (!artist || !title) {
                return res.status(400).json({ message: "Artist and title are required." });
            }

            const author = await Artist.findOne({ title: artist });
            if (!author) {
                return res.status(404).json({ message: "Artist not found." });
            }

            const newSong = { title, duration, genre, releaseDate, description, rating };
            author.songs.push(newSong); // Добавляем новую песню

            await author.save(); // Сохраняем изменения

            res.status(201).json({ message: "Song created successfully.", song: newSong });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error.", error: error.message });
        }
    }

    // Удаление песни
    async deleteSong(req, res) {
        try {
            const { artist, songTitle } = req.body;

            if (!artist || !songTitle) {
                return res.status(400).json({ message: "Artist and song title are required." });
            }

            const author = await Artist.findOne({ title: artist });
            if (!author) {
                return res.status(404).json({ message: "Artist not found." });
            }

            const songIndex = author.songs.findIndex(song => song.title === songTitle);
            if (songIndex === -1) {
                return res.status(404).json({ message: "Song not found." });
            }

            author.songs.splice(songIndex, 1); // Удаляем песню

            await author.save(); // Сохраняем изменения

            res.status(200).json({ message: "Song deleted successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error.", error: error.message });
        }
    }
}

// Экспортируем контроллер
module.exports = new authAdminController();

// Подключаем переменные окружения из файла .env
require('dotenv').config();

// Подключаем необходимые библиотеки
const passport = require('passport'); // Для аутентификации
const GitHubStrategy = require('passport-github2').Strategy; // Стратегия для аутентификации через GitHub

// Используем стратегию аутентификации GitHub
passport.use(
    new GitHubStrategy(
        {
            // Получаем данные для GitHub из переменных окружения
            clientID: process.env.GITHUB_CLIENT_ID, // ID приложения GitHub
            clientSecret: process.env.GITHUB_CLIENT_SECRET, // Секрет приложения GitHub
            callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`, // URL, на который GitHub вернет пользователя после аутентификации
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Извлекаем данные профиля пользователя из GitHub
                const { id, username, emails, photos } = profile;
                // Берем первый email, если он есть
                const email = emails && emails[0]?.value;
                // Берем URL фотографии пользователя, если она есть
                const avatarUrl = photos && photos[0]?.value;

                // Завершаем процесс аутентификации и передаем данные пользователя
                done(null, { id, username, email, avatarUrl });
            } catch (error) {
                // Если произошла ошибка, передаем её в функцию done
                done(error);
            }
        }
    )
);

// Сериализация пользователя (сохранение информации о пользователе в сессии)
passport.serializeUser((user, done) => {
    done(null, user); // Сохраняем пользователя в сессии
});

// Десериализация пользователя (получение информации из сессии)
passport.deserializeUser((obj, done) => {
    done(null, obj); // Восстанавливаем пользователя из сессии
});

// Экспортируем объект passport для использования в других модулях
module.exports = passport;

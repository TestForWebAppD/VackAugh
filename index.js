// Импортируем необходимые библиотеки и модули
const express = require('express');  // Express для создания сервера
const mongoose = require('mongoose');  // Mongoose для работы с MongoDB

const cors = require('cors');  // CORS для обработки кросс-доменных запросов
const compression = require('compression');  // Compression для сжатия HTTP-ответов

const session = require('express-session');  // Express-session для работы с сессиями
const passport = require('./config/passport');  // Passport для аутентификации

// Импортируем маршруты
const authRouter = require('./auth/authRouter');  // Маршрут для аутентификации пользователей
const musicRouter = require('./music/Music.router');  // Маршрут для работы с музыкой
const albumRouter = require('./album/Album.router');  // Маршрут для работы с альбомами
const adminRouter = require('./admin/authAdminRouter');  // Маршрут для административной аутентификации

// Устанавливаем порт сервера
const PORT = 5000;

// Создаем экземпляр приложения Express
const app = express();

// Используем middleware для разрешения кросс-доменных запросов
app.use(cors());

// Используем middleware для сжатия HTTP-ответов
app.use(compression());

// Парсим JSON из запросов
app.use(express.json());

// Подключаемся к базе данных MongoDB с использованием mongoose
mongoose.connect('mongodb+srv://admin:ZxcGul1000minus7@cluster0.r7acfi5.mongodb.net/web?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('DB OK');  // Если подключение успешно, выводим сообщение
    })
    .catch((err) => console.log('DB error: ' + err));  // Если ошибка подключения, выводим ошибку

// Настроим сессии с помощью express-session
app.use(
    session({
        secret: 'd19bc55ce44f382387238d89f21fd709add39645',  // Секрет для подписи сессий
        resave: false,  // Не сохраняем сессию, если она не была изменена
        saveUninitialized: true,  // Сохраняем сессию, даже если она не была изменена
    })
);

app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

// Инициализируем passport для аутентификации
app.use(passport.initialize());
app.use(passport.session());  // Используем сессию для сохранения состояния аутентификации

// Устанавливаем маршруты
app.use('/auth', authRouter);  // Маршрут для аутентификации
app.use('/musics', musicRouter);  // Маршрут для работы с музыкой
app.use('/album', albumRouter);  // Маршрут для работы с альбомами
app.use('/auth/admin', adminRouter);  // Маршрут для административной аутентификации

// Запускаем сервер и слушаем указанный порт
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));  // Логируем сообщение о запуске сервера

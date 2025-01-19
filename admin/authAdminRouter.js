// Импортируем необходимые модули
const Router = require('express'); // Импортируем модуль Router из express
const router = new Router(); // Создаем новый экземпляр Router
const controller = require('./authAdminController'); // Импортируем контроллер для обработки маршрутов
const authMiddleware = require('../middleware/authMiddleWare'); // Импортируем middleware для аутентификации пользователя
const adminMiddleware = require('../middleware/authAdminMiddleware'); // Импортируем middleware для проверки прав администратора
const passport = require("passport"); // Импортируем библиотеку passport для аутентификации с помощью сторонних сервисов (например, GitHub)

// Маршрут для получения профиля, с применением middleware для аутентификации и прав администратора
router.get('/profile', authMiddleware, adminMiddleware, controller.getProfile);

// Маршрут для аутентификации через GitHub с запросом email пользователя
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Маршрут для обработки callback после аутентификации через GitHub, если аутентификация не удалась, редирект на страницу входа
router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }), // Обрабатываем результат аутентификации
    controller.githubCallback // В случае успешной аутентификации вызываем контроллер
);

// Маршрут для входа (логина) с обработкой POST-запроса
router.post('/login', controller.login);

// Маршрут для получения списка артистов (POST-запрос)
router.get('/artists', controller.getArtists);

// Маршрут для обновления песен автора (PUT-запрос)
router.put('/updateSongsByAuthor', controller.updateSongsByAuthor);

// Маршрут для создания новой песни автором (POST-запрос)
router.post('/createNewSongByAuthor', controller.createNewSongByAuthor);

// Маршрут для удаления песни (DELETE-запрос)
router.delete('/deleteSong', controller.deleteSong);

// Маршрут для получения всех пользователей (GET-запрос)
router.get('/getAllUsers', controller.getAllUsers);

// Маршрут для удаления пользователя (DELETE-запрос)
router.delete('/deleteUser', controller.deleteUser);

// Маршрут для создания нового артиста (POST-запрос)
router.post('/createArtist', controller.createArtist);

// Маршрут для получения артиста по его ID (POST-запрос)
router.post('/getArtistById', controller.getArtistById);

// Экспортируем маршруты для использования в других частях приложения
module.exports = router;

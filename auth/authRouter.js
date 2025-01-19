// Импортируем необходимые модули
const Router = require('express'); // Импортируем Router из express для создания маршрутов
const router = new Router(); // Создаем новый экземпляр Router
const controller = require('./authController'); // Импортируем контроллер для обработки маршрутов аутентификации
const { check } = require('express-validator'); // Импортируем функцию для валидации данных из express-validator
const authMiddleware = require('../middleware/authMiddleWare'); // Импортируем middleware для проверки аутентификации
const passport = require('passport'); // Импортируем passport для аутентификации через сторонние сервисы (например, GitHub)

// Маршрут для получения профиля пользователя, доступен только аутентифицированным пользователям
router.get('/profile', authMiddleware, controller.getProfile);

// Маршрут для проверки валидности токена, возвращает положительный ответ, если токен действителен
router.get('/validate-token', authMiddleware, (req, res) => {
    res.status(200).json({ valid: true }); // Ответ с подтверждением валидности токена
});

// Маршрут для аутентификации через GitHub, с запросом доступа к email пользователя
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Маршрут для обработки callback после аутентификации через GitHub
// Если аутентификация не удалась, перенаправляется на страницу входа
router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }), // Обрабатываем результат аутентификации
    controller.githubCallback // В случае успешной аутентификации вызываем контроллер для дальнейшей обработки
);

// Маршрут для регистрации нового пользователя, с валидацией введенных данных
// Проверяется, чтобы username не был пустым, а password имел длину от 8 до 64 символов
router.post('/registration', [
    check('username', "username must not be empty").notEmpty(), // Валидация поля username
    check('password', "password must not be empty").isLength({ min: 8, max: 64 }), // Валидация поля password
], controller.registration); // Вызов метода регистрации из контроллера

// Маршрут для входа пользователя (логин)
router.post('/login', controller.login); // Вызов метода входа из контроллера

// Маршрут для обновления профиля пользователя, доступен только аутентифицированным пользователям
router.post('/updateProfile', authMiddleware, controller.updateProfile); // Вызов метода обновления профиля из контроллера

// Экспортируем маршруты, чтобы они могли быть использованы в других частях приложения
module.exports = router;

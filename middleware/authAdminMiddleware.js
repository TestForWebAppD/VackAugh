// Импортируем библиотеку jsonwebtoken для работы с JWT и секретный ключ из конфигурации
const jwt = require('jsonwebtoken');
const { secret } = require('../config');

// Создаем middleware для аутентификации администраторов
const authAdminMiddleware = (req, res, next) => {
    try {
        // Извлекаем токен из заголовка Authorization. Формат: 'Bearer <token>'
        const token = req.headers.authorization?.split(' ')[1];

        // Если токен отсутствует, возвращаем ошибку 401 (Unauthorized) с соответствующим сообщением
        if (!token) {
            return res.status(401).json({ message: 'Authorization required' });
        }

        // Проверяем токен с помощью секретного ключа и декодируем данные
        const decoded = jwt.verify(token, secret);

        // Проверяем, содержит ли роль 'ADMIN' в декодированных данных
        if (!decoded.roles.includes('ADMIN')) {
            // Если роль не найдена, возвращаем ошибку 403 (Forbidden) с сообщением
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Если пользователь является администратором, сохраняем данные о пользователе в объект запроса
        req.user = decoded;

        // Переходим к следующему middleware
        next();
    } catch (e) {
        // В случае ошибки при проверке токена (например, токен недействителен или истек)
        console.error('Admin authentication error:', e);  // Логируем ошибку
        // Возвращаем ошибку 401 с сообщением о недействительном токене
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Экспортируем middleware, чтобы использовать его в других частях приложения
module.exports = authAdminMiddleware;

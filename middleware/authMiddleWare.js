// Импортируем необходимые модули
const { verify } = require("jsonwebtoken");  // Для проверки JSON Web Token (JWT)
const { secret } = require("../config");  // Секретный ключ для верификации JWT из конфигурации

// Экспортируем middleware для проверки аутентификации пользователя
module.exports = function(req, res, next) {
    // Если запрос типа OPTIONS (например, для CORS), пропускаем его
    if(req.method === 'OPTIONS'){
        next();  // Переходим к следующему middleware
    }

    try{
        // Извлекаем токен из заголовка Authorization (обычно вида 'Bearer <token>')
        const token = req.headers.authorization.split(' ')[1];

        // Если токен отсутствует, возвращаем ошибку 403 (Forbidden) с сообщением
        if (!token) return res.status(403).json({message: 'User not auth'});

        // Проверяем токен с использованием секретного ключа и декодируем данные
        const decodedData = verify(token, secret);

        // Сохраняем информацию о пользователе в объекте запроса (req.user)
        req.user = decodedData;

        // Переходим к следующему middleware
        next();
    } catch (e) {
        // В случае ошибки при верификации токена (например, токен недействителен или просрочен)
        console.log(e);  // Логируем ошибку
        // Возвращаем ошибку 403 с сообщением
        return res.status(403).json({message: 'User not auth'});
    }
}

const Router = require('express');
const router = new Router();
const controller = require('../music/Music.controller');

router.get("/allMusic", controller.getSongs);
router.post("/musicById", controller.getSongById);
router.post("/musicByAuthor", controller.getMusicByAuthor);
router.post("/musicByGenre", controller.getMusicByGenre);

module.exports = router;

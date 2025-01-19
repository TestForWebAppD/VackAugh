const express = require('express');
const router = express.Router();
const AlbumController = require('./Album.controller');

router.get('/AllAlbums', AlbumController.getAllAlbums);

router.get('/AlbumsByAuthor', AlbumController.getAlbumsByArtist);

module.exports = router;

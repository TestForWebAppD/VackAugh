const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: String, required: true },
    genre: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    album: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, default: 0 }
});

const albumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    songs: [songSchema],
    songsCount: { type: Number, required: true },
    artist: { type: String, required: true },
    year: { type: Number, required: true }
});

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;

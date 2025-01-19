const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const musicSchema = new Schema({
    title: {type: String, required: true},
    artist: {type: String, required: true},
    albums: [{
        title: {type: String, required: true},
        coverImage: {type: String, required: true},
        songCount: {type: Number, required: true}
    }],
    songs: [{
        title: {type: String, required: true},
        duration: {type: String, required: true},
        genre: {type: String, required: true},
        releaseDate: {type: String, required: true},
        album: {type: String, required: false},
        description: {type: String},
        rating: {type: Number, min: 0, max: 10}
    }],
    mostPopularSong: {
        title: {type: String},
        duration: {type: String},
        genre: {type: String},
        releaseDate: {type: Date},
        album: {type: String},
        description: {type: String},
        rating: {type: Number, min: 0, max: 10}
    },
    genre: {type: String},
    artistImage: {type: String},
    rating: {type: Number, min: 0, max: 10},
    description: {type: String}
});

const MusicModel = mongoose.model('MusicModel', musicSchema);

module.exports = MusicModel;

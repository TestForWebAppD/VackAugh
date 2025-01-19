const MusicModel = require("../music/Music.model");

class MusicController {
    async getSongs () {
        return await MusicModel.find();
    }

    async getSongById ({id}) {
        return await MusicModel.findById(id);
    }

    async getMusicByAuthor ({title}) {
        try {
            // Поиск всех песен, где поле "artist" соответствует переданному title
            const musicData = await MusicModel.find({artist: title});

            // Собираем все песни из найденных записей
            let songs = [];
            Array.isArray(musicData) && musicData.forEach(music => {
                songs = songs.concat(music.songs);
            });

            return songs;
        } catch (error) {
            throw new Error('Error fetching music by author');
        }
    }
}

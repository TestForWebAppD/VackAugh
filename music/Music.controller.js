const MusicModel = require("./Music.model");

class MusicController {
    async getSongs(req, res) {
        try {
            const data = await MusicModel.find();
            const songs = data.map(item => item.toObject());
            res.status(200).json(songs);
        } catch (error) {
            console.error("Error fetching songs:", error);
            res.status(500).json({ error: "Error fetching songs" });
        }
    }

    async getSongById(req) {
        const { id } = req.body;
        return await MusicModel.findById(id);
    }

    async getMusicByAuthor(req, res) {
        try {
            const { title } = req.body;
            const musicData = await MusicModel.find({ title: title });

            res.status(200).json(musicData);
        } catch (error) {
            throw new Error("Error fetching music by author");
            res.status(403).json("Error fetching music by author");

        }
    }

    async getMusicByGenre(req, res) {
        try {
            const { genre } = req.body;

            if (!genre) {
                return res.status(400).json({ error: "Genre is required" });
            }

            const songsByGenre = await MusicModel.aggregate([
                { $unwind: "$albums" },
                { $unwind: "$albums.songs" },
                {
                    $match: {
                        "albums.songs.genre": {
                            $regex: genre,        // ищем частичное совпадение жанра
                            $options: "i"         // 'i' делает поиск нечувствительным к регистру
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        title: "$albums.songs.title",
                        artist: "$title",
                        genre: "$albums.songs.genre",
                        duration: "$albums.songs.duration",
                        releaseDate: "$albums.songs.releaseDate",
                        description: "$albums.songs.description",
                        rating: "$albums.songs.rating"
                    }
                }
            ]);

            res.status(200).json(songsByGenre);
        } catch (error) {
            console.error("Error fetching music by genre:", error);
            res.status(500).json({ error: "Error fetching music by genre" });
        }
    }
}

module.exports = new MusicController();

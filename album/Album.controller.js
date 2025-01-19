const Album = require('./Album.model');

class AlbumController {
    async getAllAlbums(req, res) {
        try {
            const albums = await Album.find();
            res.status(200).json(albums);
        } catch (error) {
            console.error("Error fetching albums:", error);
            res.status(500).json({ error: "Failed to fetch albums" });
        }
    }

    async getAlbumsByArtist(req, res) {
        const { artist } = req.body;

        try {
            const albums = await Album.find({ artist });
            if (albums.length === 0) {
                return res.status(404).json({ error: "No albums found for this artist" });
            }

            res.status(200).json(albums);
        } catch (error) {
            console.error("Error fetching albums by artist:", error);
            res.status(500).json({ error: "Failed to fetch albums by artist" });
        }
    }
}

module.exports = new AlbumController();

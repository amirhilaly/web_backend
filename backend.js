const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 8080;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const db = new sqlite3.Database('./movies.db');



app.get('/api', (req, res) => {
    res.json({ message: 'Hello depuis Vercel !' });
});


module.exports = app;



app.get('/movies', (req, res) => {
    const { origine, categorie, noteMax } = req.query;

    let sql = "SELECT * FROM movies WHERE 1=1";
    const params = [];

    if (origine && origine !== "all") {
        sql += " AND origine = ?";
        params.push(origine);
    }

    if (categorie && categorie !== "standard") {
        sql += " AND categorie = ?";
        params.push(categorie);
    }

    /*
    if (noteMin) {
        sql += " AND note >= ?";
        params.push(parseFloat(noteMin));
    } else if (noteMax) {
        sql += " AND note <= ?";
        params.push(parseFloat(noteMax));
    }
    */

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


app.put('/movies/:id', (req, res) => {
    const movieId = req.params.id;
    const { nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine } = req.body;

    const sql = `UPDATE movies 
                 SET nom = ?, realisateur = ?, compagnie = ?, dateDeSortie = ?, note = ?, notePublic = ?, description = ?, lienImage = ?, origine = ?
                 WHERE id = ?`;
    const params = [nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine, movieId];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
            return;
        }
        res.json({ success: true });
    });
});


app.post('/movies', (req, res) => {
    const { nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine, categorie } = req.body;
    const sql = `INSERT INTO movies (nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine, categorie)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine, categorie];

    db.run(sql, params, function (err) {
        res.json({ success: true, id: this.lastID });
    });
});


app.delete('/movies/:id', (req, res) => {
    const movieId = req.params.id;

    console.log("OOOHHH EHHH Y'A UN TRUK LA!!!!!!!!");

    db.run("DELETE FROM movies WHERE id = ?", [movieId], function (err) {
        res.json({ success: true });
    });
});


app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

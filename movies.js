const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// CORS configuration pour GitHub Pages
app.use(cors({
    origin: ['https://amirhilaly.github.io/web_cours/', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Configuration de la base de données
const db = new sqlite3.Database(path.join(__dirname, 'movies.db'));

// Handler principal pour les requêtes Vercel
module.exports = async (req, res) => {
    // Configuration CORS pour les requêtes préflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { origine, categorie, noteMin, noteMax } = req.query;

    if (req.method === 'GET') {
        let sql = 'SELECT * FROM movies WHERE 1=1';
        let params = [];

        if (origine && origine !== 'all') {
            sql += ' AND origine = ?';
            params.push(origine);
        }

        if (categorie && categorie !== 'standard') {
            sql += ' AND categorie = ?';
            params.push(categorie);
        }

        if (noteMin) {
            sql += ' AND note >= ?';
            params.push(parseFloat(noteMin));
        }

        if (noteMax) {
            sql += ' AND note <= ?';
            params.push(parseFloat(noteMax));
        }

        try {
            const movies = await new Promise((resolve, reject) => {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            res.json(movies);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    else if (req.method === 'POST') {
        const { nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine, categorie } = req.body;
        const sql = `INSERT INTO movies (nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine, categorie)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine, categorie];

        try {
            await new Promise((resolve, reject) => {
                db.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    else if (req.method === 'DELETE') {
        const id = req.query.id;
        try {
            await new Promise((resolve, reject) => {
                db.run("DELETE FROM movies WHERE id = ?", [id], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    else if (req.method === 'PUT') {
        const id = req.query.id;
        const { nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine } = req.body;

        const sql = `UPDATE movies 
                     SET nom = ?, realisateur = ?, compagnie = ?, dateDeSortie = ?, note = ?, 
                         notePublic = ?, description = ?, lienImage = ?, origine = ?
                     WHERE id = ?`;
        const params = [nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine, id];

        try {
            await new Promise((resolve, reject) => {
                db.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
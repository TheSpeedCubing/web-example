const express = require('express');
const sqlite3 = require('sqlite3');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Todo API', version: '1.0.0' },
        servers: [{ url: '/api', description: '透過 Nginx (Port 80)' }]
    },
    apis: ['./index.js'],
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

const db = new sqlite3.Database('./todos.db', (err) => {
    if (err) console.error("Database error:", err.message);
    db.run("CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, completed INTEGER DEFAULT 0)");
});

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: get all todo
 *     responses:
 *       200:
 *         description: return all todo
 */
app.get("/todos", (req, res) => {
    db.all("SELECT * FROM todos", (err, rows) => res.json(rows || []));
});

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: add todo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *     responses:
 *       201:
 *         description: created
 */
app.post("/todos", (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).send("title required");

    db.run("INSERT INTO todos (title, completed) VALUES (?, 0)", [title], function () {
        res.status(201).json({ id: this.lastID, title, completed: 0 });
    });
});

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: toggle completed
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed: { type: boolean }
 *     responses:
 *       200:
 *         description: ok
 */
app.put("/todos/:id", (req, res) => {
    const isCompleted = req.body.completed ? 1 : 0;

    db.run("UPDATE todos SET completed = ? WHERE id = ?", [isCompleted, req.params.id], function () {
        if (this.changes === 0) return res.status(404).send("not found");
        res.send("ok");
    });
});

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: remove todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: no content
 */
app.delete("/todos/:id", (req, res) => {
    db.run("DELETE FROM todos WHERE id = ?", [req.params.id], function () {
        if (this.changes === 0) return res.status(404).send("not found");
        res.status(204).send();
    });
});

app.listen(4000, () => console.log("Backend running on 4000"));
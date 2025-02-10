// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// We need __dirname in ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// A single, shared in-memory "catalog" store. Replaces your Durable Object.
const catalog = {};

// Create a shared "API router" that implements the same CRUD logic on /api/books.
function createApiRouter() {
  const router = express.Router();

  // parse JSON bodies
  router.use(express.json());

  // GET /api/books => list all
  router.get("/books", (req, res) => {
    res.json(catalog);
  });

  // GET /api/books/:id => get one
  router.get("/books/:id", (req, res) => {
    let book = catalog[req.params.id];
    if (!book) return res.status(404).send(`Book ${req.params.id} not found`);
    res.json(book);
  });

  // POST /api/books => create
  router.post("/books", (req, res) => {
    let newId = Math.random().toString(36).slice(2, 10);
    let book = { id: newId, ...req.body };
    catalog[newId] = book;
    res.status(201).json(book);
  });

  // PUT /api/books/:id => update
  router.put("/books/:id", (req, res) => {
    let existing = catalog[req.params.id];
    if (!existing) {
      return res.status(404).send(`Book ${req.params.id} not found`);
    }
    catalog[req.params.id] = { ...existing, ...req.body };
    res.json(catalog[req.params.id]);
  });

  // DELETE /api/books/:id => remove
  router.delete("/books/:id", (req, res) => {
    let existing = catalog[req.params.id];
    if (!existing) {
      return res.status(404).send(`Book ${req.params.id} not found`);
    }
    delete catalog[req.params.id];
    res.send(`Book ${req.params.id} removed`);
  });

  return router;
}

// Create an app that serves a specific front-end file on "/".
function createFrontApp(frontFile, apiRouter) {
  const app = express();
  // Attach the shared API router at /api
  app.use("/api", apiRouter);

  // Serve the front end's HTML on the root path
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, frontFile));
  });

  return app;
}

// 1) Create the shared API router
const apiRouter = createApiRouter();

// 2) Set up "front1" server on port 8081
const front1App = createFrontApp("front1.html", apiRouter);
front1App.listen(8084, () => {
  console.log("Front1 (CRUD) server at http://localhost:8084/");
});

// 3) Set up "front2" server on port 8082
const front2App = createFrontApp("front2.html", apiRouter);
front2App.listen(8085, () => {
  console.log("Front2 (read-only) server at http://localhost:8085/");
});

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalog = {};

function createApiRouter() {
  const router = express.Router();

  router.use(express.json());

  router.get("/books", (req, res) => {
    res.json(catalog);
  });

  router.get("/books/:id", (req, res) => {
    let book = catalog[req.params.id];
    if (!book) return res.status(404).send(`Book ${req.params.id} not found`);
    res.json(book);
  });

  router.post("/books", (req, res) => {
    let newId = Math.random().toString(36).slice(2, 10);
    let book = { id: newId, ...req.body };
    catalog[newId] = book;
    res.status(201).json(book);
  });

  router.put("/books/:id", (req, res) => {
    let existing = catalog[req.params.id];
    if (!existing) {
      return res.status(404).send(`Book ${req.params.id} not found`);
    }
    catalog[req.params.id] = { ...existing, ...req.body };
    res.json(catalog[req.params.id]);
  });

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

function createFrontApp(frontFile, apiRouter) {
  const app = express();
  app.use("/api", apiRouter);

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, frontFile));
  });

  return app;
}

const apiRouter = createApiRouter();

const front1App = createFrontApp("front1.html", apiRouter);
front1App.listen(8084, () => {
  console.log("Front1 (CRUD) server at http://localhost:8084/");
});

const front2App = createFrontApp("front2.html", apiRouter);
front2App.listen(8085, () => {
  console.log("Front2 (read-only) server at http://localhost:8085/");
});

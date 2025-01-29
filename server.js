const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Importa le route
const pdiRoutes = require("./routes/pdi");
const comuniRoutes = require("./routes/comuni");
const provinceRoutes = require("./routes/province");
const categorieRoutes = require("./routes/categorie");
const tourRoutes = require("./routes/tours");
const categorieTourRoutes = require("./routes/categorie-tour");

// Registra le route
app.use("/api/pdi", pdiRoutes);
app.use("/api/comuni", comuniRoutes);
app.use("/api/province", provinceRoutes);
app.use("/api/categorie", categorieRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/categorie-tour", categorieTourRoutes);

// Log delle richieste
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Body:", req.body);
  next();
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});

const express = require("express");
const router = express.Router();
const fs = require("fs");

const categoriesPath = "./categorie-tour.json";

// Ottieni tutte le categorie dei tour
router.get("/", (req, res) => {
  fs.readFile(categoriesPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({
        message: "Errore nel leggere le categorie dei tour.",
        error: err,
      });
    }
    res.json(JSON.parse(data));
  });
});

// Aggiungi una nuova categoria
router.post("/", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Il nome della categoria è obbligatorio." });
  }

  fs.readFile(categoriesPath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Errore nel leggere le categorie.", error: err });
    }

    const categories = JSON.parse(data);
    const newId =
      categories.length > 0
        ? Math.max(...categories.map((cat) => cat.id)) + 1
        : 1;
    const newCategory = { id: newId, name };

    categories.push(newCategory);

    fs.writeFile(
      categoriesPath,
      JSON.stringify(categories, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          return res.status(500).json({
            message: "Errore nel salvare la categoria.",
            error: writeErr,
          });
        }
        res.status(201).json(newCategory);
      }
    );
  });
});

// Modifica una categoria
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Il nome della categoria è obbligatorio." });
  }

  fs.readFile(categoriesPath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Errore nel leggere le categorie.", error: err });
    }

    const categories = JSON.parse(data);
    const index = categories.findIndex((cat) => cat.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ message: "Categoria non trovata." });
    }

    // Aggiorna il nome della categoria
    categories[index].name = name;

    // Aggiorna il file dei tour con il nuovo nome della categoria
    fs.readFile("./tours.json", "utf8", (tourErr, tourData) => {
      if (tourErr) {
        return res
          .status(500)
          .json({ message: "Errore nel leggere i tour.", error: tourErr });
      }

      const tours = JSON.parse(tourData);

      // Aggiorna il nome della categoria nei tour
      tours.forEach((tour) => {
        tour.categorie.forEach((cat) => {
          if (cat.id === parseInt(id)) {
            cat.name = name;
          }
        });
      });

      // Salva i tour aggiornati
      fs.writeFile(
        "./tours.json",
        JSON.stringify(tours, null, 2),
        "utf8",
        (writeTourErr) => {
          if (writeTourErr) {
            return res.status(500).json({
              message: "Errore nel salvare i tour.",
              error: writeTourErr,
            });
          }

          // Salva le categorie aggiornate
          fs.writeFile(
            categoriesPath,
            JSON.stringify(categories, null, 2),
            "utf8",
            (writeErr) => {
              if (writeErr) {
                return res.status(500).json({
                  message: "Errore nel salvare la categoria.",
                  error: writeErr,
                });
              }
              res.status(200).json(categories[index]);
            }
          );
        }
      );
    });
  });
});

// Elimina una categoria
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(categoriesPath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Errore nel leggere le categorie.", error: err });
    }

    const categories = JSON.parse(data);
    const filteredCategories = categories.filter(
      (cat) => cat.id !== parseInt(id)
    );

    // Aggiorna il file dei tour per rimuovere la categoria
    fs.readFile("./tours.json", "utf8", (tourErr, tourData) => {
      if (tourErr) {
        return res
          .status(500)
          .json({ message: "Errore nel leggere i tour.", error: tourErr });
      }

      const tours = JSON.parse(tourData);

      // Rimuovi la categoria dai tour
      tours.forEach((tour) => {
        tour.categorie = tour.categorie.filter(
          (cat) => cat.id !== parseInt(id)
        );
      });

      // Salva i tour aggiornati
      fs.writeFile(
        "./tours.json",
        JSON.stringify(tours, null, 2),
        "utf8",
        (writeTourErr) => {
          if (writeTourErr) {
            return res.status(500).json({
              message: "Errore nel salvare i tour.",
              error: writeTourErr,
            });
          }

          // Salva le categorie aggiornate
          fs.writeFile(
            categoriesPath,
            JSON.stringify(filteredCategories, null, 2),
            "utf8",
            (writeErr) => {
              if (writeErr) {
                return res.status(500).json({
                  message: "Errore nel salvare le categorie.",
                  error: writeErr,
                });
              }
              res.status(204).send();
            }
          );
        }
      );
    });
  });
});

module.exports = router;

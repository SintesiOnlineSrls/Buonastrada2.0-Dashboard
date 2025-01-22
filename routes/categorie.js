const express = require("express");
const router = express.Router();
const fs = require("fs");

const categoriesPath = "./categorie.json";
const pdiPath = "./pdi.json"; // Percorso al file dei PDI

// Leggi le categorie
router.get("/", (req, res) => {
  fs.readFile(categoriesPath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Errore nel leggere le categorie.", error: err });
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
          return res
            .status(500)
            .json({
              message: "Errore nel salvare le categorie.",
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

    categories[index].name = name;

    // Aggiorna anche i PDI con il nuovo nome della categoria
    fs.readFile(pdiPath, "utf8", (pdiErr, pdiData) => {
      if (pdiErr) {
        return res
          .status(500)
          .json({ message: "Errore nel leggere i PDI.", error: pdiErr });
      }

      const pdiList = JSON.parse(pdiData);
      pdiList.forEach((pdi) => {
        pdi.categorie.forEach((cat) => {
          if (cat.id === parseInt(id)) {
            cat.name = name; // Aggiorna il nome della categoria
          }
        });
      });

      fs.writeFile(
        pdiPath,
        JSON.stringify(pdiList, null, 2),
        "utf8",
        (writePdiErr) => {
          if (writePdiErr) {
            return res
              .status(500)
              .json({
                message: "Errore nel salvare i PDI.",
                error: writePdiErr,
              });
          }

          // Salva le categorie aggiornate
          fs.writeFile(
            categoriesPath,
            JSON.stringify(categories, null, 2),
            "utf8",
            (writeErr) => {
              if (writeErr) {
                return res
                  .status(500)
                  .json({
                    message: "Errore nel salvare le categorie.",
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

    // Rimuovi la categoria anche dai PDI
    fs.readFile(pdiPath, "utf8", (pdiErr, pdiData) => {
      if (pdiErr) {
        return res
          .status(500)
          .json({ message: "Errore nel leggere i PDI.", error: pdiErr });
      }

      const pdiList = JSON.parse(pdiData);
      pdiList.forEach((pdi) => {
        pdi.categorie = pdi.categorie.filter((cat) => cat.id !== parseInt(id));
      });

      fs.writeFile(
        pdiPath,
        JSON.stringify(pdiList, null, 2),
        "utf8",
        (writePdiErr) => {
          if (writePdiErr) {
            return res
              .status(500)
              .json({
                message: "Errore nel salvare i PDI.",
                error: writePdiErr,
              });
          }

          // Salva le categorie aggiornate
          fs.writeFile(
            categoriesPath,
            JSON.stringify(filteredCategories, null, 2),
            "utf8",
            (writeErr) => {
              if (writeErr) {
                return res
                  .status(500)
                  .json({
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

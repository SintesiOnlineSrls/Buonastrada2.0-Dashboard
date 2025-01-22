const express = require("express");
const router = express.Router();
const fs = require("fs");
const { readJsonFile, writeJsonFile } = require("../utils/fileHandler");
const { formatDate } = require("../utils/dateUtils");

const toursPath = "./tours.json";
const categoriesPath = "./categorie-tour.json";

// Funzione per generare lo slug del tour
const generateTourSlug = (nome) => {
  return nome
    .trim()
    .toLowerCase() // Converte tutto in minuscolo
    .normalize("NFD") // Normalizza i caratteri Unicode
    .replace(/[\u0300-\u036f]/g, "") // Rimuove i segni diacritici
    .replace(/[^a-z0-9\s-]/g, "") // Rimuove caratteri non alfanumerici
    .replace(/\s+/g, "-") // Converte gli spazi in trattini
    .replace(/^-+|-+$/g, ""); // Rimuove i trattini iniziali e finali
};

// Funzione per risolvere i nomi delle categorie
const resolveCategoryNames = (categoryIds) => {
  return new Promise((resolve, reject) => {
    fs.readFile(categoriesPath, "utf8", (err, data) => {
      if (err) return reject(err);

      try {
        const categories = JSON.parse(data);
        const resolvedCategories = categoryIds.map((id) => {
          const category = categories.find((cat) => cat.id === id);
          if (!category) throw new Error(`Categoria con ID ${id} non trovata.`);
          return category; // Restituisce { id, name }
        });

        resolve(resolvedCategories);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
};

// Aggiorna una categoria nei tour associati
router.put("/update-category/:id", (req, res) => {
  const { id } = req.params; // ID della categoria da aggiornare
  const { name } = req.body; // Nuovo nome della categoria

  if (!name) {
    return res.status(400).json({
      message: "Il nome della categoria è obbligatorio.",
    });
  }

  readJsonFile(toursPath, (err, tours) => {
    if (err) {
      console.error("Errore nella lettura del file tours.json:", err);
      return res.status(500).json({
        message: "Errore nel leggere i tour.",
        error: err,
      });
    }

    // Aggiorna la categoria nei tour associati
    const updatedTours = tours.map((tour) => {
      tour.categorie = tour.categorie.map((cat) =>
        cat.id === parseInt(id, 10) ? { ...cat, name } : cat
      );
      return tour;
    });

    writeJsonFile(toursPath, updatedTours, (writeErr) => {
      if (writeErr) {
        console.error("Errore nella scrittura del file tours.json:", writeErr);
        return res.status(500).json({
          message: "Errore nel salvare i dati.",
          error: writeErr,
        });
      }

      res.status(200).json({
        message: `Categoria aggiornata con successo nei tour.`,
      });
    });
  });
});

// Rimuovi una categoria dai tour associati
router.put("/remove-category/:id", (req, res) => {
  const { id } = req.params; // ID della categoria da rimuovere

  readJsonFile(toursPath, (err, tours) => {
    if (err) {
      console.error("Errore nella lettura del file tours.json:", err);
      return res.status(500).json({
        message: "Errore nel leggere i tour.",
        error: err,
      });
    }

    // Rimuovi la categoria dai tour associati
    const updatedTours = tours.map((tour) => {
      tour.categorie = tour.categorie.filter(
        (cat) => cat.id !== parseInt(id, 10)
      );
      return tour;
    });

    writeJsonFile(toursPath, updatedTours, (writeErr) => {
      if (writeErr) {
        console.error("Errore nella scrittura del file tours.json:", writeErr);
        return res.status(500).json({
          message: "Errore nel salvare i dati.",
          error: writeErr,
        });
      }

      res.status(200).json({
        message: `Categoria rimossa con successo dai tour.`,
      });
    });
  });
});

// Ottieni la lista completa dei tour
router.get("/", (req, res) => {
  readJsonFile(toursPath, (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file tours.json:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere i tour.", error: err });
    }

    res.json(data);
  });
});

// Ottieni un singolo tour per ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  readJsonFile(toursPath, (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file tours.json:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere i tour.", error: err });
    }

    const tour = data.find((tour) => tour.id === parseInt(id));
    if (!tour) {
      return res.status(404).json({ message: "Tour non trovato." });
    }

    res.json(tour);
  });
});

// Crea un nuovo tour
router.post("/", async (req, res) => {
  const { nome, categorie } = req.body;

  if (
    !nome ||
    !categorie ||
    !Array.isArray(categorie) ||
    categorie.length === 0
  ) {
    return res.status(400).json({
      message:
        "Nome e categorie sono obbligatori e le categorie devono essere un array.",
    });
  }

  try {
    const resolvedCategories = await resolveCategoryNames(categorie);

    readJsonFile(toursPath, (err, data) => {
      if (err) {
        console.error("Errore nella lettura del file tours.json:", err);
        return res
          .status(500)
          .json({ message: "Errore nel leggere i tour.", error: err });
      }

      // Genera un nuovo ID per il tour
      const nextId =
        data.length > 0 ? Math.max(...data.map((tour) => tour.id)) + 1 : 1;
      const timestamp = formatDate();

      // Genera lo slug del tour
      const slug = generateTourSlug(nome);

      // Crea il nuovo oggetto tour
      const newTour = {
        id: nextId,
        nome,
        slug,
        categorie: resolvedCategories, // Usa i nomi risolti delle categorie
        pdi: [], // Nessun PDI inizialmente
        dataCreazione: timestamp,
        ultimaModifica: timestamp,
      };

      // Aggiungi il nuovo tour alla lista
      data.push(newTour);

      // Salva il file aggiornato
      writeJsonFile(toursPath, data, (writeErr) => {
        if (writeErr) {
          console.error(
            "Errore nella scrittura del file tours.json:",
            writeErr
          );
          return res.status(500).json({
            message: "Errore nel salvare il nuovo tour.",
            error: writeErr,
          });
        }

        res.status(201).json(newTour);
      });
    });
  } catch (error) {
    console.error("Errore nella risoluzione delle categorie:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// Aggiorna un tour specifico
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, categorie } = req.body;

  if (!nome || !categorie || !Array.isArray(categorie)) {
    return res.status(400).json({
      message: "Il nome e le categorie devono essere forniti correttamente.",
    });
  }

  try {
    const resolvedCategories = await resolveCategoryNames(categorie);

    readJsonFile(toursPath, (err, data) => {
      if (err) {
        console.error("Errore nella lettura del file tours.json:", err);
        return res
          .status(500)
          .json({ message: "Errore nel leggere i tour.", error: err });
      }

      const index = data.findIndex((tour) => tour.id === parseInt(id, 10));
      if (index === -1) {
        return res.status(404).json({ message: "Tour non trovato." });
      }

      const timestamp = formatDate();

      // Genera lo slug del tour
      const slug = generateTourSlug(nome);

      // Aggiorna i dettagli del tour
      const updatedTour = {
        ...data[index],
        nome,
        slug,
        categorie: resolvedCategories,
        ultimaModifica: timestamp,
      };

      data[index] = updatedTour;

      writeJsonFile(toursPath, data, (writeErr) => {
        if (writeErr) {
          console.error(
            "Errore nella scrittura del file tours.json:",
            writeErr
          );
          return res.status(500).json({
            message: "Errore nel salvare il tour aggiornato.",
            error: writeErr,
          });
        }

        res.json(updatedTour);
      });
    });
  } catch (error) {
    console.error("Errore nella risoluzione delle categorie:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// Elimina un tour specifico
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  readJsonFile(toursPath, (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file tours.json:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere i tour.", error: err });
    }

    const tourIndex = data.findIndex((tour) => tour.id === parseInt(id, 10));
    if (tourIndex === -1) {
      return res.status(404).json({ message: "Tour non trovato." });
    }

    const removedTour = data[tourIndex];
    data.splice(tourIndex, 1);

    // Scrivi i dati aggiornati nel file JSON
    writeJsonFile(toursPath, data, (writeErr) => {
      if (writeErr) {
        console.error("Errore nella scrittura del file tours.json:", writeErr);
        return res.status(500).json({ message: "Errore nel salvare i dati." });
      }

      res.status(200).json({
        message: `Tour con ID ${id} eliminato con successo.`,
        tour: removedTour,
      });
    });
  });
});

module.exports = router;

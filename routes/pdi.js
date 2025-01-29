const express = require("express");
const router = express.Router();
const fs = require("fs");
const { readJsonFile, writeJsonFile } = require("../utils/fileHandler");
const { formatDate } = require("../utils/dateUtils");

const filePath = "./pdi.json";
const categoriesPath = "./categorie.json";
const toursPath = "./tours.json";

const generatePdiSlug = (slugComune, nomePdi) => {
  const safeNomePdi = nomePdi
    .trim()
    .toLowerCase() // Solo il nome del PDI diventa minuscolo
    .normalize("NFD") // Normalizza i caratteri Unicode
    .replace(/[\u0300-\u036f]/g, "") // Rimuove i segni diacritici
    .replace(/[^a-z0-9\s-]/g, "") // Rimuove caratteri non alfanumerici
    .replace(/\s+/g, "-") // Converte gli spazi in trattini
    .replace(/^-+|-+$/g, ""); // Rimuove i trattini iniziali e finali

  return `${slugComune}-${safeNomePdi}`;
};

const getComuneSlug = (comuneNome) => {
  try {
    const comuni = JSON.parse(fs.readFileSync("./comuni.json", "utf8"));
    const comuneData = comuni.find((c) => c.nome === comuneNome);
    if (!comuneData || !comuneData.slug) {
      throw new Error("Comune non trovato o slug mancante.");
    }
    return comuneData.slug;
  } catch (error) {
    console.error("Errore nell'ottenere lo slug del comune:", error.message);
    throw error;
  }
};

// Funzione: Elimina un PDI
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  readJsonFile(filePath, (err, pdiData) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Errore nel leggere i PDI.", error: err });
    }

    const pdiIndex = pdiData.findIndex((pdi) => pdi.id === parseInt(id, 10));
    if (pdiIndex === -1) {
      return res.status(404).json({ message: "PDI non trovato." });
    }

    pdiData.splice(pdiIndex, 1); // Elimina il PDI senza assegnarlo

    // Rimuovi il PDI dai tour associati
    fs.readFile(toursPath, "utf8", (err, tourData) => {
      if (err) {
        console.error("Errore nella lettura dei tour:", err);
        return;
      }

      const tours = JSON.parse(tourData);
      const updatedTours = tours.map((tour) => {
        tour.pdi = tour.pdi.filter((pdi) => pdi.id !== parseInt(id, 10));
        return tour;
      });

      fs.writeFile(
        toursPath,
        JSON.stringify(updatedTours, null, 2),
        (writeErr) => {
          if (writeErr) {
            console.error("Errore nella scrittura dei tour:", writeErr);
          }
        }
      );
    });

    // Salva i PDI aggiornati
    writeJsonFile(filePath, pdiData, (writeErr) => {
      if (writeErr) {
        return res
          .status(500)
          .json({ message: "Errore nel salvare i PDI.", error: writeErr });
      }
      res.status(204).send();
    });
  });
});

// Ottieni l'ID del PDI a partire dallo slug
router.get("/slug/:slug", (req, res) => {
  const slug = req.params.slug; // Lo slug passato dal frontend
  console.log(`Ricerca PDI con slug: ${slug}`); // Aggiungi log per debug
  readJsonFile(filePath, (err, pdiData) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Errore nel leggere i PDI.", error: err });
    }
    const pdi = pdiData.find((pdi) => pdi.slug.toLowerCase() === slug.toLowerCase());
    if (pdi) {
      res.json(pdi);
    } else {
      console.error("PDI non trovato per slug:", slug);
      res.status(404).json({ message: "PDI non trovato" });
    }
  });
});

// Funzione per aggiornare i tour associati a un PDI
const updateToursForPdi = (pdiId, resolvedTours, pdiDetails) => {
  fs.readFile(toursPath, "utf8", (err, data) => {
    if (err) {
      console.error("Errore nella lettura dei tour:", err);
      return;
    }

    const tours = JSON.parse(data);

    const updatedTours = tours.map((tour) => {
      // Controlla se il tour è selezionato
      const isSelected = resolvedTours.some((rt) => rt.id === tour.id);

      if (isSelected) {
        // Aggiungi o aggiorna il PDI nel tour
        const pdiIndex = tour.pdi.findIndex((pdi) => pdi.id === pdiId);
        if (pdiIndex !== -1) {
          // Aggiorna i dettagli del PDI
          tour.pdi[pdiIndex] = {
            id: pdiId,
            nome: pdiDetails.nome,
            comune: pdiDetails.comune,
          };
        } else {
          // Aggiungi il PDI al tour
          tour.pdi.push({
            id: pdiId,
            nome: pdiDetails.nome,
            comune: pdiDetails.comune,
          });
        }
      } else {
        // Rimuovi il PDI dai tour non selezionati
        tour.pdi = tour.pdi.filter((pdi) => pdi.id !== pdiId);
      }

      return tour;
    });

    // Salva i tour aggiornati
    fs.writeFile(
      toursPath,
      JSON.stringify(updatedTours, null, 2),
      (writeErr) => {
        if (writeErr) {
          console.error("Errore nella scrittura dei tour:", writeErr);
        }
      }
    );
  });
};

// Ottieni la lista completa dei PDI
router.get("/", (req, res) => {
  readJsonFile(filePath, (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Errore nel leggere i PDI.", error: err });
    }
    res.json(data);
  });
});

// Ottieni un singolo PDI
router.get("/:id", (req, res) => {
  const { id } = req.params;

  readJsonFile(filePath, (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Errore nel leggere i PDI.", error: err });
    }

    const pdi = data.find((pdi) => pdi.id === parseInt(id));
    if (!pdi) {
      return res.status(404).json({ message: "PDI non trovato." });
    }

    res.json(pdi);
  });
});

// Funzione per risolvere i nomi dei tour
const resolveTourNames = (tourIds) => {
  return new Promise((resolve, reject) => {
    fs.readFile(toursPath, "utf8", (err, data) => {
      if (err) return reject(err);

      try {
        const tours = JSON.parse(data);
        const resolvedTours = tourIds
          .filter((id) => id != null)
          .map((id) => {
            const tour = tours.find((t) => t.id === id);
            if (!tour) throw new Error(`Tour con ID ${id} non trovato.`);
            return { id: tour.id, nome: tour.nome };
          });

        resolve(resolvedTours);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
};

// Risolvi gli ID delle categorie in oggetti completi (id e nome)
const resolveCategoryNames = (categoryIds) => {
  return new Promise((resolve, reject) => {
    fs.readFile(categoriesPath, "utf8", (err, data) => {
      if (err) return reject(err);

      try {
        const categories = JSON.parse(data);
        const resolvedCategories = categoryIds
          .filter((id) => id != null) // Filtra valori null o undefined
          .map((id) => {
            const category = categories.find((cat) => cat.id === id);
            if (!category)
              throw new Error(`Categoria con ID ${id} non trovata.`);
            return category; // Restituisce { id, name }
          });

        resolve(resolvedCategories);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
};

// Crea un nuovo PDI
router.post("/", async (req, res) => {
  const { nome, comune, provincia, categorie, tours = [] } = req.body;

  if (
    !nome ||
    !comune ||
    !categorie ||
    !Array.isArray(categorie) ||
    categorie.length === 0 ||
    !Array.isArray(tours)
  ) {
    return res.status(400).json({
      message:
        "Tutti i campi sono obbligatori e le categorie devono essere un array.",
    });
  }

  try {
    const slugComune = getComuneSlug(comune); // Usa la funzione per ottenere lo slug del comune
    const slugPdi = generatePdiSlug(slugComune, nome); // Crea lo slug del PDI

    const resolvedCategories = await resolveCategoryNames(categorie);
    const resolvedTours = await resolveTourNames(tours);

    readJsonFile(filePath, (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Errore nel leggere i PDI.", error: err });
      }

      const nextId =
        data.length > 0 ? Math.max(...data.map((pdi) => pdi.id)) + 1 : 1;
      const timestamp = formatDate();

      const newPdi = {
        id: nextId,
        nome,
        slug: slugPdi,
        comune,
        provincia,
        categorie: resolvedCategories,
        tours: resolvedTours,
        dataCreazione: timestamp,
        ultimaModifica: timestamp,
      };

      data.push(newPdi);

      writeJsonFile(filePath, data, (writeErr) => {
        if (writeErr) {
          return res
            .status(500)
            .json({ message: "Errore nel salvare i PDI.", error: writeErr });
        }
        updateToursForPdi(nextId, resolvedTours, newPdi);
        res.status(201).json(newPdi);
      });
    });
  } catch (error) {
    console.error("Errore durante la creazione del PDI:", error.message);
    res.status(500).json({ message: "Errore interno al server." });
  }
});

// Percorso per aggiornare un PDI
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, comune, provincia, categorie, tours, ...updatedPdi } = req.body;

  if (!nome || !comune || !categorie || !Array.isArray(categorie)) {
    return res.status(400).json({ message: "Dati mancanti o non validi." });
  }

  try {
    const slugComune = getComuneSlug(comune); // Usa la funzione per ottenere lo slug del comune
    const slugPdi = generatePdiSlug(slugComune, nome); // Crea lo slug del PDI

    const resolvedCategories = await resolveCategoryNames(categorie);
    const resolvedTours = await resolveTourNames(tours);

    readJsonFile(filePath, (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Errore nel leggere i PDI.", error: err });
      }

      const index = data.findIndex((pdi) => pdi.id === parseInt(id, 10));
      if (index === -1) {
        return res.status(404).json({ message: "PDI non trovato." });
      }

      const timestamp = formatDate();
      const updatedPdiDetails = {
        ...data[index],
        ...updatedPdi,
        nome,
        slug: slugPdi,
        comune,
        categorie: resolvedCategories,
        tours: resolvedTours,
        ultimaModifica: timestamp,
      };

      data[index] = updatedPdiDetails;

      writeJsonFile(filePath, data, (writeErr) => {
        if (writeErr) {
          return res
            .status(500)
            .json({ message: "Errore nel salvare i PDI.", error: writeErr });
        }
        updateToursForPdi(parseInt(id, 10), resolvedTours, updatedPdiDetails);
        res.json(updatedPdiDetails);
      });
    });
  } catch (error) {
    console.error("Errore durante la modifica del PDI:", error.message);
    res.status(500).json({ message: "Errore interno al server." });
  }
});

// Rimuovi un tour dai PDI
router.put("/remove-tour/:tourId", (req, res) => {
  const { tourId } = req.params;

  readJsonFile(filePath, (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file PDI:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere i PDI.", error: err });
    }

    const updatedPdi = data.map((pdi) => {
      // Verifica se pdi.tours è un array prima di eseguire .filter
      if (Array.isArray(pdi.tours)) {
        pdi.tours = pdi.tours.filter(
          (tour) => tour.id !== parseInt(tourId, 10)
        );
      }
      return pdi;
    });

    writeJsonFile(filePath, updatedPdi, (writeErr) => {
      if (writeErr) {
        console.error("Errore nella scrittura del file PDI:", writeErr);
        return res
          .status(500)
          .json({ message: "Errore nel salvare i PDI.", error: writeErr });
      }

      res.status(200).json({ message: "Tour rimosso dai PDI." });
    });
  });
});

const pdiData = require("../pdi.json"); // Assicurati che il percorso sia corretto

// Endpoint per ottenere un PDI tramite slug
router.get("/slug/:slug", (req, res) => {
  const slug = req.params.slug;
  console.log(`Ricerca PDI con slug: ${slug}`); // Aggiungi log per debug
  const pdi = pdiData.find((pdi) => pdi.slug === slug);
  if (pdi) {
    res.json(pdi);
  } else {
    console.error("PDI non trovato per slug:", slug);
    res.status(404).json({ message: "PDI non trovato" });
  }
});

module.exports = router;

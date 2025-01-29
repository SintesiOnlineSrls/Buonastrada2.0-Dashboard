const express = require("express");
const router = express.Router();
const fs = require("fs");

const comuniPath = "./comuni.json";

const generateCmnSlug = (nome, provincia) => {
  const safeProvincia = provincia ? provincia.toUpperCase() : ""; // Provincia in maiuscolo
  const safeNome = nome
    .trim()
    .toLowerCase() // Solo il nome diventa minuscolo
    .normalize("NFD") // Normalizza i caratteri Unicode
    .replace(/[\u0300-\u036f]/g, "") // Rimuove i segni diacritici
    .replace(/[^a-z0-9\s-]/g, "") // Rimuove caratteri non alfanumerici
    .replace(/\s+/g, "-") // Converte gli spazi in trattini
    .replace(/^-+|-+$/g, ""); // Rimuove i trattini iniziali e finali

  const slug = `${safeProvincia}-${safeNome}`;
  return slug;
};

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

// Ottieni un comune tramite slug
router.get("/slug/:slug", (req, res) => {
  const { slug } = req.params;

  fs.readFile(comuniPath, "utf8", (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file comuni.json:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere i comuni.", error: err });
    }

    try {
      const comuni = JSON.parse(data);
      const comune = comuni.find((comune) => comune.slug.toLowerCase() === slug.toLowerCase());

      if (!comune) {
        return res.status(404).json({ message: "Comune non trovato." });
      }

      res.json(comune);
    } catch (parseError) {
      console.error("Errore nel parsing del file comuni.json:", parseError);
      res
        .status(500)
        .json({ message: "Errore nella lettura dei dati.", error: parseError });
    }
  });
});

// Ottieni la lista completa dei comuni
router.get("/", (req, res) => {
  fs.readFile(comuniPath, "utf8", (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file comuni.json:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere i comuni.", error: err });
    }

    try {
      const comuni = JSON.parse(data);
      res.json(comuni);
    } catch (parseError) {
      console.error("Errore nel parsing del file comuni.json:", parseError);
      res
        .status(500)
        .json({ message: "Errore nella lettura dei dati.", error: parseError });
    }
  });
});

router.get("/province", (req, res) => {
  const provinceSiciliane = [
    "AG",
    "CL",
    "CT",
    "EN",
    "ME",
    "PA",
    "RG",
    "SR",
    "TP",
  ];
  res.json(provinceSiciliane);
});

// Ottieni un comune specifico
router.get("/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(comuniPath, "utf8", (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file comuni.json:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere i comuni.", error: err });
    }

    try {
      const comuni = JSON.parse(data);
      const comune = comuni.find((comune) => comune.id === parseInt(id, 10));

      if (!comune) {
        console.warn(`Comune con ID ${id} non trovato.`);
        return res.status(404).json({ message: "Comune non trovato." });
      }

      res.json(comune);
    } catch (parseError) {
      console.error("Errore nel parsing del file comuni.json:", parseError);
      res
        .status(500)
        .json({ message: "Errore nella lettura dei dati.", error: parseError });
    }
  });
});

// Crea un nuovo comune
router.post("/", (req, res) => {
  const { nome, provincia } = req.body;

  if (!nome || !provincia) {
    return res
      .status(400)
      .json({ message: "Nome e provincia sono obbligatori." });
  }

  const slug = generateCmnSlug(nome, provincia); // Genera slug automaticamente

  fs.readFile(comuniPath, "utf8", (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file comuni.json:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere i comuni.", error: err });
    }

    try {
      const comuni = JSON.parse(data);
      const newId =
        comuni.length > 0 ? Math.max(...comuni.map((c) => c.id)) + 1 : 1;

      const nuovoComune = { id: newId, nome, slug, provincia };
      comuni.push(nuovoComune);

      fs.writeFile(comuniPath, JSON.stringify(comuni, null, 2), (writeErr) => {
        if (writeErr) {
          console.error(
            "Errore nella scrittura del file comuni.json:",
            writeErr
          );
          return res.status(500).json({
            message: "Errore nel salvare i comuni.",
            error: writeErr,
          });
        }

        res.status(201).json(nuovoComune);
      });
    } catch (parseError) {
      console.error("Errore nel parsing del file comuni.json:", parseError);
      res.status(500).json({
        message: "Errore nella lettura dei dati.",
        error: parseError,
      });
    }
  });
});

// Aggiorna un comune
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nome, provincia } = req.body;

  if (!nome || !provincia) {
    return res
      .status(400)
      .json({ message: "Nome e provincia sono obbligatori." });
  }

  const slug = generateCmnSlug(nome, provincia); // Genera nuovo slug

  fs.readFile(comuniPath, "utf8", (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file comuni.json:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere i comuni.", error: err });
    }

    try {
      const comuni = JSON.parse(data);
      const index = comuni.findIndex(
        (comune) => comune.id === parseInt(id, 10)
      );

      if (index === -1) {
        return res.status(404).json({ message: "Comune non trovato." });
      }

      // Memorizza il nome precedente del comune
      const oldNome = comuni[index].nome;

      // Aggiorna i dati del comune
      const updatedComune = { ...comuni[index], nome, slug, provincia };
      comuni[index] = updatedComune;

      // Scrivi i nuovi dati del comune
      fs.writeFile(comuniPath, JSON.stringify(comuni, null, 2), (writeErr) => {
        if (writeErr) {
          console.error(
            "Errore nella scrittura del file comuni.json:",
            writeErr
          );
          return res.status(500).json({
            message: "Errore nel salvare i comuni.",
            error: writeErr,
          });
        }

        // Aggiorna i PDI associati al comune
        fs.readFile("./pdi.json", "utf8", (pdiErr, pdiData) => {
          if (pdiErr) {
            console.error("Errore nella lettura del file pdi.json:", pdiErr);
            return res.status(500).json({
              message: "Errore nel leggere i PDI.",
              error: pdiErr,
            });
          }

          const pdiList = JSON.parse(pdiData);
          const updatedPdiList = pdiList.map((pdi) => {
            // Aggiorna solo i PDI associati al vecchio nome del comune
            if (pdi.comune === oldNome) {
              return {
                ...pdi,
                comune: nome, // Aggiorna il nome del comune
                provincia: provincia, // Aggiorna la provincia
                slug: generatePdiSlug(slug, pdi.nome), // Aggiorna lo slug
              };
            }
            return pdi;
          });

          // Scrivi i nuovi dati dei PDI
          fs.writeFile(
            "./pdi.json",
            JSON.stringify(updatedPdiList, null, 2),
            (writeErr) => {
              if (writeErr) {
                console.error(
                  "Errore nella scrittura del file pdi.json:",
                  writeErr
                );
                return res.status(500).json({
                  message: "Errore nel salvare i PDI.",
                  error: writeErr,
                });
              }

              // Rispondi con i dati aggiornati del comune
              res.json(updatedComune);
            }
          );
        });
      });
    } catch (parseError) {
      console.error("Errore nel parsing del file comuni.json:", parseError);
      res.status(500).json({
        message: "Errore nella lettura dei dati.",
        error: parseError,
      });
    }
  });
});

// Elimina un comune
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(comuniPath, "utf8", (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file comuni.json:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere i comuni.", error: err });
    }

    try {
      const comuni = JSON.parse(data);
      const comuneToDelete = comuni.find(
        (comune) => comune.id === parseInt(id, 10)
      );

      if (!comuneToDelete) {
        return res.status(404).json({ message: "Comune non trovato." });
      }

      const updatedComuni = comuni.filter(
        (comune) => comune.id !== parseInt(id, 10)
      );

      // Aggiorna i PDI associati
      fs.readFile("./pdi.json", "utf8", (err, pdiData) => {
        if (err) {
          console.error("Errore nella lettura del file pdi.json:", err);
          return res
            .status(500)
            .json({ message: "Errore nel leggere i PDI.", error: err });
        }

        const pdiList = JSON.parse(pdiData);
        const updatedPdiList = pdiList.map((pdi) => {
          if (pdi.comune === comuneToDelete.nome) {
            return {
              ...pdi,
              comune: "Da assegnare",
              provincia: "",
              comune_id: 0,
            };
          }
          return pdi;
        });

        fs.writeFile(
          "./pdi.json",
          JSON.stringify(updatedPdiList, null, 2),
          (writeErr) => {
            if (writeErr) {
              console.error(
                "Errore nella scrittura del file pdi.json:",
                writeErr
              );
              return res.status(500).json({
                message: "Errore nel salvare i PDI.",
                error: writeErr,
              });
            }

            // Salva i comuni aggiornati
            fs.writeFile(
              comuniPath,
              JSON.stringify(updatedComuni, null, 2),
              (writeErr) => {
                if (writeErr) {
                  console.error(
                    "Errore nella scrittura del file comuni.json:",
                    writeErr
                  );
                  return res.status(500).json({
                    message: "Errore nel salvare i comuni.",
                    error: writeErr,
                  });
                }
                res.status(204).send(); // Successo
              }
            );
          }
        );
      });
    } catch (parseError) {
      console.error("Errore nel parsing del file comuni.json:", parseError);
      res
        .status(500)
        .json({ message: "Errore nella lettura dei dati.", error: parseError });
    }
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const fs = require("fs");
const provincePath = "./province.json";
const comuniPath = "./comuni.json";

// Ottieni una provincia tramite slug
router.get("/slug/:slug", (req, res) => {
  const { slug } = req.params;

  fs.readFile(provincePath, "utf8", (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file province.json:", err);
      return res
        .status(500)
        .json({ message: "Errore nel leggere le province.", error: err });
    }

    try {
      const province = JSON.parse(data);
      const provincia = province.find((prov) => prov.slug.toLowerCase() === slug.toLowerCase());

      if (!provincia) {
        return res.status(404).json({ message: "Provincia non trovata." });
      }

      res.json(provincia);
    } catch (parseError) {
      console.error("Errore nel parsing del file province.json:", parseError);
      return res
        .status(500)
        .json({ message: "Errore nel parsing delle province.", error: parseError });
    }
  });
});

// Ottieni i comuni di una provincia tramite slug
router.get("/comuni/:slug", (req, res) => {
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
      const comuniDellaProvincia = comuni.filter((comune) => comune.provincia.toLowerCase() === slug.toLowerCase());

      if (comuniDellaProvincia.length === 0) {
        return res.status(404).json({ message: "Nessun comune trovato per questa provincia." });
      }

      res.json(comuniDellaProvincia);
    } catch (parseError) {
      console.error("Errore nel parsing del file comuni.json:", parseError);
      return res
        .status(500)
        .json({ message: "Errore nel parsing dei comuni.", error: parseError });
    }
  });
});

module.exports = router;
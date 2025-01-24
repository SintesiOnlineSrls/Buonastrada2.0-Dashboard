import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePdi } from "../../context/PdiContext";
import { useDirty } from "../../context/DirtyContext";
import "./PdiEdit.css";
import axios from "axios";

const PdiEdit = () => {
  const { slug } = useParams();
  const [pdiId, setPdiId] = useState(null);
  const navigate = useNavigate();
  const { fetchSinglePdi, updatePdi } = usePdi();
  const [comuni, setComuni] = useState([]);
  const [categorie, setCategorie] = useState([]);
  const [filteredComuni, setFilteredComuni] = useState([]);
  const [tourList, setTourList] = useState([]);
  const { isDirty, setIsDirty } = useDirty();
  const [formData, setFormData] = useState({
    nome: "",
    slug: "",
    comune: "",
    provincia: "",
    categorieSelezionate: [],
    toursSelezionati: [],
    dataCreazione: "",
    ultimaModifica: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPdiId = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/pdi/slug/${slug}`
        );
        if (response.data && response.data.id) {
          setPdiId(response.data.id);
        } else {
          throw new Error("PDI non trovato.");
        }
      } catch (error) {
        console.error("Errore nel recupero dell'ID:", error);
        setErrorMessage("PDI non trovato. Verifica che lo slug sia corretto.");
        navigate("/error"); // Reindirizza a una pagina di errore
      }
    };
    fetchPdiId();
  }, [slug, navigate]);

  useEffect(() => {
    if (pdiId) {
      const loadData = async () => {
        try {
          const selectedPdi = await fetchSinglePdi(pdiId);
          if (!selectedPdi) {
            throw new Error("Punto di interesse non trovato.");
          }

          const comuniRes = await axios.get("http://localhost:3001/api/comuni");
          const categorieRes = await axios.get(
            "http://localhost:3001/api/categorie"
          );
          const toursRes = await axios.get("http://localhost:3001/api/tours");

          setFormData({
            nome: selectedPdi.nome || "",
            slug: selectedPdi.slug || "",
            comune: selectedPdi.comune || "",
            provincia: selectedPdi.provincia || "",
            categorieSelezionate: Array.isArray(selectedPdi.categorie)
              ? selectedPdi.categorie.map((cat) => cat.id)
              : [],
            toursSelezionati: Array.isArray(selectedPdi.tours)
              ? selectedPdi.tours.map((tour) => tour.id)
              : [],
            dataCreazione: selectedPdi.dataCreazione || "",
            ultimaModifica:
              selectedPdi.ultimaModifica || selectedPdi.dataCreazione,
          });

          setComuni(comuniRes.data || []);
          setCategorie(categorieRes.data || []);
          setTourList(toursRes.data || []);

          setIsDirty(false);
        } catch (error) {
          console.error("Errore nel caricamento dei dati:", error);
          setErrorMessage(
            "Errore nel caricamento dei dati. Riprova più tardi."
          );
        }
      };

      loadData();
    }
  }, [pdiId, fetchSinglePdi, setIsDirty]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; // Mostra un messaggio generico per i browser moderni
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = comuni.filter((comune) =>
      comune.nome.toLowerCase().includes(term)
    );
    setFilteredComuni(filtered);
  };

  useEffect(() => {
    if (comuni.length > 0) {
      setFilteredComuni(comuni);
    }
  }, [comuni]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setIsDirty(true); // Segna il modulo come modificato
  };

  const handleComuneSelect = (comune) => {
    setFormData((prevData) => ({
      ...prevData,
      comune: comune.nome,
      provincia: comune.provincia,
    }));
    setIsDirty(true);
  };

  const handleCategorieChange = (categoriaId) => {
    setFormData((prevData) => {
      const { categorieSelezionate } = prevData;
      const updatedCategorie = categorieSelezionate.includes(categoriaId)
        ? categorieSelezionate.filter((catId) => catId !== categoriaId)
        : [...categorieSelezionate, categoriaId];
      return { ...prevData, categorieSelezionate: updatedCategorie };
    });
    setIsDirty(true);
  };

  const handleTourChange = (tourId) => {
    setFormData((prevData) => {
      const { toursSelezionati } = prevData;
      const updatedTours = toursSelezionati.includes(tourId)
        ? toursSelezionati.filter((id) => id !== tourId)
        : [...toursSelezionati, tourId];
      return { ...prevData, toursSelezionati: updatedTours };
    });
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedPdi = {
      id: parseInt(pdiId, 10), // Garantisce che sia un numero
      nome: formData.nome,
      slug: formData.slug,
      comune: formData.comune,
      provincia: formData.provincia,
      categorie: formData.categorieSelezionate.map(Number),
      tours: formData.toursSelezionati,
      dataCreazione: formData.dataCreazione,
      ultimaModifica: new Date().toISOString(),
    };

    try {
      await updatePdi(updatedPdi);
      setIsDirty(false);
      setSuccessMessage("Modifiche salvate con successo!");
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      setErrorMessage("Errore durante il salvataggio. Riprova più tardi.");
    }
  };

  const handleBackClick = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "Ci sono modifiche non salvate. Vuoi davvero tornare all'elenco?"
      );
      if (!confirmLeave) return;
    }
    setIsDirty(false);
    navigate("/pdi");
  };

  if (!pdiId) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="pdi-edit">
      <button
        onClick={handleBackClick}
        className="back-button"
        style={{
          marginBottom: "20px",
          padding: "10px 15px",
          backgroundColor: "#007BFF",
          color: "#FFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        ← Torna all'elenco
      </button>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      <h1>Modifica Punto di Interesse</h1>
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>Nome:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Slug:</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Comune:</label>
          <input
            type="text"
            placeholder="Cerca comune..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="scrollable-box">
            {filteredComuni.map((comune, index) => (
              <div
                key={comune.id || `comune-${index}`}
                className={`list-item ${
                  formData.comune === comune.nome ? "selected" : ""
                }`}
                onClick={() => handleComuneSelect(comune)}
              >
                {comune.nome}
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Categorie:</label>
          <div className="scrollable-box">
            {categorie.map((categoria, index) => (
              <div
                key={categoria.id || `categoria-${index}`}
                className={`list-item ${
                  formData.categorieSelezionate.includes(categoria.id)
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleCategorieChange(categoria.id)}
              >
                {categoria.name}
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Tour:</label>
          <div className="scrollable-box">
            {tourList.map((tour) => (
              <div
                key={tour.id}
                className={`list-item ${
                  formData.toursSelezionati.includes(tour.id) ? "selected" : ""
                }`}
                onClick={() => handleTourChange(tour.id)}
              >
                {tour.nome}
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="submit-button">
          Salva Modifiche
        </button>
      </form>
    </div>
  );
};

export default PdiEdit;

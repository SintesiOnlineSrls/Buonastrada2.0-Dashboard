import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TourEdit.css";

const TourEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    categorieSelezionate: [],
    pdiSelezionati: [],
    dataCreazione: "",
    ultimaModifica: "",
  });

  const [categorie, setCategorie] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const tourRes = await axios.get(
          `http://localhost:3001/api/tours/${id}`
        );
        const categorieRes = await axios.get(
          "http://localhost:3001/api/categorie-tour"
        );

        const tour = tourRes.data;

        setFormData({
          nome: tour.nome || "",
          categorieSelezionate: Array.isArray(tour.categorie)
            ? tour.categorie.map((cat) => cat.id)
            : [],
          pdiSelezionati: Array.isArray(tour.pdi)
            ? tour.pdi.map((pdi) => pdi.id)
            : [],
          dataCreazione: tour.dataCreazione || "",
          ultimaModifica: tour.ultimaModifica || tour.dataCreazione,
        });

        setCategorie(categorieRes.data || []);
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
        setErrorMessage("Errore nel caricamento dei dati. Riprova più tardi.");
      }
    };

    loadData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCategorieChange = (id) => {
    setFormData((prevData) => {
      const updated = prevData.categorieSelezionate.includes(id)
        ? prevData.categorieSelezionate.filter((catId) => catId !== id)
        : [...prevData.categorieSelezionate, id];
      return { ...prevData, categorieSelezionate: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nome, categorieSelezionate, pdiSelezionati, dataCreazione } =
      formData;

    if (!nome || categorieSelezionate.length === 0) {
      setErrorMessage("Tutti i campi obbligatori devono essere compilati.");
      return;
    }

    const updatedTour = {
      id: parseInt(id, 10),
      nome,
      categorie: categorieSelezionate.map(Number),
      pdi: pdiSelezionati,
      dataCreazione,
      ultimaModifica: new Date().toISOString().slice(0, 16),
    };

    try {
      await axios.put(`http://localhost:3001/api/tours/${id}`, updatedTour);
      setSuccessMessage("Tour aggiornato con successo!");
      setErrorMessage("");
    } catch (error) {
      console.error("Errore durante l'aggiornamento:", error);
      setErrorMessage("Errore durante l'aggiornamento. Riprova più tardi.");
    }
  };

  return (
    <div className="tour-edit">
      <button onClick={() => navigate("/tour")} className="back-button"
        style={{
          marginBottom: "20px",
          padding: "10px 15px",
          backgroundColor: "#007BFF",
          color: "#FFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}>
        ← Torna all'elenco
      </button>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      <h1>Modifica Tour</h1>
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
          <label>Categorie:</label>
          <div className="scrollable-box">
            {categorie.map((categoria) => (
              <div
                key={categoria.id}
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
        <button type="submit" className="submit-button">
          Salva Modifiche
        </button>
      </form>
    </div>
  );
};

export default TourEdit;

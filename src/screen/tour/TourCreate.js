import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TourCreate.css";

const TourCreate = () => {
  const navigate = useNavigate();
  const [categorie, setCategorie] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    categorieSelezionate: [], // ID delle categorie selezionate
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Carica le categorie dal server
  useEffect(() => {
    axios.get("http://localhost:3001/api/categorie-tour").then((res) => {
      setCategorie(res.data); // Res.data contiene { id, name }
    });
  }, []);

  // Aggiorna i campi del form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Gestione della selezione/deselezione delle categorie
  const handleCategorieChange = (id) => {
    setFormData((prevData) => {
      const { categorieSelezionate } = prevData;
      const updatedCategorie = categorieSelezionate.includes(id)
        ? categorieSelezionate.filter((catId) => catId !== id) // Rimuove ID
        : [...categorieSelezionate, id]; // Aggiunge ID

      return {
        ...prevData,
        categorieSelezionate: updatedCategorie.filter(Boolean),
      };
    });
  };

  // Invia il form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nome, categorieSelezionate } = formData;

    if (!nome || !categorieSelezionate.length) {
      setErrorMessage("Tutti i campi sono obbligatori!");
      return;
    }

    const dataCreazione = new Date().toISOString().slice(0, 16);

    const newTour = {
      nome,
      categorie: categorieSelezionate,
      dataCreazione,
    };

    try {
      await axios.post("http://localhost:3001/api/tours", newTour);
      navigate("/tour");
    } catch (error) {
      console.error("Errore durante la creazione del Tour:", error.message);
      setErrorMessage("Errore durante la creazione. Riprova più tardi.");
    }
  };

  return (
    <div className="tour-create">
      <h1>Crea Nuovo Tour</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <form onSubmit={handleSubmit} className="create-form">
        {/* Campo Nome */}
        <div className="form-group">
          <label>Nome:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
          />
        </div>

        {/* Selezione Categoria */}
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

        <button type="submit" className="submit-button">
          Crea Tour
        </button>
      </form>
    </div>
  );
};

export default TourCreate;

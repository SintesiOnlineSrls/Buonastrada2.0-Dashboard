import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePdi } from "../../context/PdiContext";
import "./PdiCreate.css";
import axios from "axios";

const PdiCreate = () => {
  const { createPdi } = usePdi();
  const navigate = useNavigate();
  const [comuni, setComuni] = useState([]);
  const [categorie, setCategorie] = useState([]);
  const [filteredComuni, setFilteredComuni] = useState([]);
  const [tourList, setTourList] = useState([]);

  const [formData, setFormData] = useState({
    nome: "",
    comune: "",
    provincia: "",
    categorieSelezionate: [], // ID delle categorie selezionate
    toursSelezionati: [], // ID dei tour selezionati
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Carica i comuni e le categorie dal server
  useEffect(() => {
    axios.get("http://localhost:3001/api/comuni").then((res) => {
      setComuni(res.data);
      setFilteredComuni(res.data);
    });

    axios.get("http://localhost:3001/api/categorie").then((res) => {
      setCategorie(res.data); // Res.data contiene { id, name }
    });
  }, []);

  useEffect(() => {
    // Carica i tour dal server
    axios.get("http://localhost:3001/api/tours").then((res) => {
      setTourList(res.data);
    });
  }, []);

  const handleTourChange = (id) => {
    setFormData((prevData) => {
      const { toursSelezionati } = prevData;
      const updatedTours = toursSelezionati.includes(id)
        ? toursSelezionati.filter((tourId) => tourId !== id) // Rimuovi ID
        : [...toursSelezionati, id]; // Aggiungi ID

      return {
        ...prevData,
        toursSelezionati: updatedTours.filter(Boolean), // Filtra null o undefined
      };
    });
  };

  // Gestione della ricerca nei comuni
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredComuni(
      comuni.filter((comune) => comune.nome.toLowerCase().includes(term))
    );
  };

  // Aggiorna i campi del form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Gestione della selezione di un comune
  const handleComuneSelect = (comune) => {
    setFormData((prevData) => ({
      ...prevData,
      comune: comune.nome,
      provincia: comune.provincia,
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
      }; // Filtra null o undefined
    });
  };

  // Invia il form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nome, comune, provincia, categorieSelezionate, toursSelezionati } =
      formData;

    if (!nome || !comune || !categorieSelezionate.length) {
      setErrorMessage("Tutti i campi sono obbligatori!");
      return;
    }

    const dataCreazione = new Date().toISOString().slice(0, 16);

    const newPdi = {
      nome,
      comune,
      provincia,
      categorie: categorieSelezionate,
      tours: toursSelezionati,
      dataCreazione,
    };

    try {
      await createPdi(newPdi);
      navigate("/pdi");
    } catch (error) {
      console.error("Errore durante la creazione del PDI:", error.message);
      setErrorMessage("Errore durante la creazione. Riprova più tardi.");
    }
  };

  return (
    <div className="pdi-create">
      <h1>Crea Nuovo Punto di Interesse</h1>
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
        {/* Selezione Comune */}
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
                key={comune.id || `comune-${index}`} // Assicurati che `key` sia unico
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
        {/* Selezione Categoria */}
        <div className="form-group">
          <label>Categorie:</label>
          <div className="scrollable-box">
            {categorie.map((categoria, index) => (
              <div
                key={categoria.id || `categoria-${index}`} // Assicurati che `key` sia unico
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

        {/* Seleziona Tour */}
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
          Crea Punto di Interesse
        </button>
      </form>
    </div>
  );
};

export default PdiCreate;

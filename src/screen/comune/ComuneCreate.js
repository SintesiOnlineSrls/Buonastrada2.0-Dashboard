import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComuni } from "../../context/ComuniContext";

const ComuneCreate = () => {
  const navigate = useNavigate();
  const { createComune } = useComuni();

  const provinceData = [
    { name: "Agrigento", code: "AG" },
    { name: "Caltanissetta", code: "CL" },
    { name: "Catania", code: "CT" },
    { name: "Enna", code: "EN" },
    { name: "Messina", code: "ME" },
    { name: "Palermo", code: "PA" },
    { name: "Ragusa", code: "RG" },
    { name: "Siracusa", code: "SR" },
    { name: "Trapani", code: "TP" },
  ];

  const [formData, setFormData] = useState({ nome: "", provincia: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProvinciaSelect = (province) => {
    setFormData((prevData) => ({
      ...prevData,
      provincia: province.code, // Salva la sigla
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nome, provincia } = formData;

    if (!nome || !provincia) {
      setErrorMessage("Tutti i campi sono obbligatori!");
      return;
    }

    try {
      await createComune({ nome, provincia });
      setSuccessMessage("Comune creato con successo!");
      setTimeout(() => navigate("/comuni"), 2000);
    } catch (error) {
      console.error("Errore durante la creazione del comune:", error.message);
      setErrorMessage("Errore durante la creazione. Riprova più tardi.");
    }
  };

  return (
    <div className="comune-create">
      <button
        onClick={() => navigate("/comuni")}
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
      <h1>Crea Nuovo Comune</h1>
      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label>Nome del Comune:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Provincia:</label>
          <div className="scrollable-box">
            {provinceData.map((province) => (
              <div
                key={province.code}
                className={`list-item ${
                  formData.provincia === province.code ? "selected" : ""
                }`}
                onClick={() => handleProvinciaSelect(province)}
              >
                {province.name}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button">
          Crea Comune
        </button>
      </form>
    </div>
  );
};

export default ComuneCreate;

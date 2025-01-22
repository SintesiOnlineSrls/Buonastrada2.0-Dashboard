import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useComuni } from "../../context/ComuniContext";
import { useDirty } from "../../context/DirtyContext";
import "./ComuneEdit.css";

const ComuneEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSingleComune, updateComune } = useComuni();
  const { isDirty, setIsDirty } = useDirty();
  const [formData, setFormData] = useState({
    nome: "",
    slug: "",
    provincia: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Carica i dati del comune
  useEffect(() => {
    const loadData = async () => {
      try {
        const comuneData = await fetchSingleComune(parseInt(id, 10));
        if (!comuneData) {
          throw new Error("Comune non trovato.");
        }
        setFormData({
          nome: comuneData.nome || "",
          slug: comuneData.slug || "",
          provincia: comuneData.provincia || "",
        });
        setIsDirty(false);
      } catch (error) {
        console.error("Errore nel caricamento del comune:", error);
        setErrorMessage(
          "Errore nel caricamento del comune. Riprova più tardi."
        );
      }
    };
    loadData();
  }, [id, fetchSingleComune, setIsDirty]);
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

  // Funzione per gestire i campi del form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setIsDirty(true);
  };

  // Gestione del submit del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nome, provincia } = formData;

    if (!nome || !provincia) {
      setErrorMessage("Tutti i campi sono obbligatori.");
      return;
    }

    try {
      await updateComune({ id: parseInt(id, 10), nome, provincia });
      setIsDirty(false);
      setSuccessMessage("Comune aggiornato con successo!");
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
      if (!confirmLeave) {
        return;
      }
    }
    setIsDirty(false);
    navigate("/comuni");
  };

  return (
    <div className="comune-edit">
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
      <h1>Modifica Comune</h1>
      <form onSubmit={handleSubmit} className="edit-form">
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
          <label>Slug:</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            readOnly // Campo solo in lettura, popolato dal server
          />
        </div>
        <div className="form-group">
          <label>Provincia:</label>
          <select
            name="provincia"
            value={formData.provincia}
            onChange={handleInputChange}
          >
            <option value="">Seleziona una provincia</option>
            {["AG", "CL", "CT", "EN", "ME", "PA", "RG", "SR", "TP"].map(
              (provincia) => (
                <option key={provincia} value={provincia}>
                  {provincia}
                </option>
              )
            )}
          </select>
        </div>
        <button type="submit" className="submit-button">
          Salva Modifiche
        </button>
      </form>
    </div>
  );
};

export default ComuneEdit;

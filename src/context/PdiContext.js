import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const PdiContext = createContext();

export const usePdi = () => {
  return useContext(PdiContext);
};

export const PdiProvider = ({ children }) => {
  const [pdiList, setPdiList] = useState([]);

  // Funzione per caricare tutti i PDI
  const fetchPdi = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/pdi");
      setPdiList(response.data);
    } catch (error) {
      console.error("Errore nel caricamento dei PDI:", error);
    }
  }, []);

  // Funzione per caricare un singolo PDI
  const fetchSinglePdi = async (id) => {
    if (!id || isNaN(id)) {
      console.error("ID non valido:", id); // Log di debug
      throw new Error("ID non valido");
    }
    try {
      const response = await axios.get(`http://localhost:3001/api/pdi/${id}`);
      return response.data;
    } catch (error) {
      console.error("Errore nel caricamento del singolo PDI:", error);
      throw error;
    }
  };

  // Funzione per creare un nuovo PDI
  const createPdi = async (newPdi) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/pdi",
        newPdi
      );
      setPdiList((prevList) => [...prevList, response.data]);
      return response.data;
    } catch (error) {
      console.error("Errore nella creazione del PDI:", error);
      throw error;
    }
  };

  // Funzione per aggiornare un PDI
  const updatePdi = async (updatedPdi) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/pdi/${updatedPdi.id}`,
        updatedPdi
      );
      setPdiList((prevList) =>
        prevList.map((pdi) =>
          pdi.id === response.data.id ? response.data : pdi
        )
      );
      return response.data;
    } catch (error) {
      console.error("Errore nell'aggiornamento del PDI:", error);
      throw error;
    }
  };

  // Funzione per eliminare un PDI
  const deletePdi = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/pdi/${id}`);
      setPdiList((prevList) => prevList.filter((pdi) => pdi.id !== id));
    } catch (error) {
      console.error("Errore nell'eliminazione del PDI:", error);
      throw error;
    }
  };

  // Funzione per sincronizzare i PDI con un comune aggiornato
  const syncPdiWithComune = async (comune) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/pdi/sync-comune/${comune.id}`,
        comune
      );
      setPdiList((prevList) =>
        prevList.map((pdi) =>
          response.data.some((updatedPdi) => updatedPdi.id === pdi.id)
            ? response.data.find((updatedPdi) => updatedPdi.id === pdi.id)
            : pdi
        )
      );
    } catch (error) {
      console.error(
        "Errore nella sincronizzazione dei PDI con il comune:",
        error
      );
    }
  };

  return (
    <PdiContext.Provider
      value={{
        pdiList,
        fetchPdi,
        fetchSinglePdi,
        createPdi,
        updatePdi,
        deletePdi,
        syncPdiWithComune,
      }}
    >
      {children}
    </PdiContext.Provider>
  );
};

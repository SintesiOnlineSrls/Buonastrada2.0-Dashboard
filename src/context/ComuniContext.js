import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const ComuniContext = createContext();

export const useComuni = () => {
  return useContext(ComuniContext);
};

export const ComuniProvider = ({ children }) => {
  const [comuniList, setComuniList] = useState([]);
  const [provinceList, setProvinceList] = useState([]);

  // Funzione per caricare tutti i comuni
  const fetchComuni = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/comuni");
      setComuniList(response.data);
    } catch (error) {
      console.error("Errore nel caricamento dei Comuni:", error);
    }
  }, []);

  // Funzione per caricare un singolo comune
  const fetchSingleComune = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/comuni/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Errore nel caricamento del singolo comune:", error);
      throw error;
    }
  };

  // Funzione per creare un nuovo comune
  const createComune = async (newComune) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/comuni",
        newComune
      );
      setComuniList((prevList) => [...prevList, response.data]);
    } catch (error) {
      console.error("Errore nella creazione del comune:", error);
      throw error;
    }
  };

  // Funzione per aggiornare un comune
  const updateComune = async (updatedComune) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/comuni/${updatedComune.id}`,
        updatedComune
      );
      setComuniList((prevList) =>
        prevList.map((comune) =>
          comune.id === response.data.id ? response.data : comune
        )
      );
    } catch (error) {
      console.error("Errore nell'aggiornamento del comune:", error);
      throw error;
    }
  };

  // Funzione per eliminare un comune
  const deleteComune = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/comuni/${id}`);
      setComuniList((prevList) =>
        prevList.filter((comune) => comune.id !== id)
      );
    } catch (error) {
      console.error("Errore nell'eliminazione del comune:", error);
      throw error;
    }
  };

  // Funzione per caricare le province
  const fetchProvinces = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/comuni/province"
      );
      setProvinceList(response.data);
    } catch (error) {
      console.error("Errore nel caricamento delle province:", error);
    }
  };

  return (
    <ComuniContext.Provider
      value={{
        comuniList,
        provinceList,
        fetchComuni,
        fetchSingleComune,
        createComune,
        updateComune,
        deleteComune,
        fetchProvinces,
      }}
    >
      {children}
    </ComuniContext.Provider>
  );
};

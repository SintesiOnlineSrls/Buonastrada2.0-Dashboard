import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TourList.css";

const TourList = () => {
  const [tourList, setTourList] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Ricerca
  const [filteredTours, setFilteredTours] = useState([]); // Filtri
  const [currentPage, setCurrentPage] = useState(1); // Pagina corrente
  const [categorie, setCategorie] = useState([]); // Categorie disponibili
  const [selectedCategory, setSelectedCategory] = useState(""); // Categoria selezionata

  const itemsPerPage = 20; // Numero di elementi per pagina
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTours.slice(indexOfFirstItem, indexOfLastItem);
  const navigate = useNavigate();

  useEffect(() => {
    // Carica i tour dal server
    axios.get("http://localhost:3001/api/tours").then((res) => {
      setTourList(res.data);
      setFilteredTours(res.data);
    });

    // Carica le categorie dal server
    axios.get("http://localhost:3001/api/categorie-tour").then((res) => {
      setCategorie(res.data);
    });
  }, []);

  // Filtra i tour
  useEffect(() => {
    const filtered = tourList.filter((tour) => {
      const matchesSearch = tour.nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        tour.categorie.some((cat) => cat.id === parseInt(selectedCategory, 10));

      return matchesSearch && matchesCategory;
    });
    setFilteredTours(filtered);
  }, [searchTerm, selectedCategory, tourList]);

  // Elimina un tour
  const deleteTour = async (id) => {
    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare questo tour? L'eliminazione sarà definitiva e rimuoverà il tour anche dai PDI associati."
    );

    if (!confirmDelete) return;

    try {
      // Rimuovi il tour dai PDI associati
      await axios.put(`http://localhost:3001/api/pdi/remove-tour/${id}`);

      // Elimina il tour
      await axios.delete(`http://localhost:3001/api/tours/${id}`);

      // Aggiorna la lista dei tour
      setTourList((prevList) => prevList.filter((tour) => tour.id !== id));
    } catch (error) {
      console.error("Errore nell'eliminazione del tour:", error);
    }
  };
  
    // Resetta la pagina corrente quando cambiano i filtri o la ricerca
    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, selectedCategory, tourList]);

  return (
    <div className="tour-list">
      <button className="create-button" onClick={() => navigate("/tour/new")}>
        + Crea nuovo Tour
      </button>
      <h1>Lista dei Tour</h1>
      <div className="search-bar-tour">
        <input
          type="text"
          placeholder="Cerca per nome del tour..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          id="search-input-tour"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="search-select"
        >
          <option value="">Tutte le Categorie</option>
          {categorie.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <table id="tour-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Slug</th>
            <th>Categoria</th>
            <th>Lista dei PDI</th>
            <th>Data Creazione</th>
            <th>Ultima Modifica</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((tour) => (
            <tr key={tour.id}>
              <td>{tour.id}</td>
              <td className="nome-cell">
                <div>{tour.nome}</div>
                <div className="nome-actions">
                  <button
                    onClick={() => navigate(`/tour/edit/${tour.id}`)}
                    className="edit"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => deleteTour(tour.id)}
                    className="delete"
                  >
                    Elimina
                  </button>
                </div>
              </td>
              <td>
                {tour.slug}
              </td>
              <td>{tour.categorie.map((cat) => cat.name).join(", ")}</td>
              <td>
                {Array.isArray(tour.pdi) && tour.pdi.length > 0
                  ? tour.pdi.map((pdi) => pdi.nome).join(", ")
                  : "Nessun PDI"}
              </td>
              <td>{tour.dataCreazione}</td>
              <td>{tour.ultimaModifica || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {Math.ceil(filteredTours.length / itemsPerPage) > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Precedente
          </button>
          <span>
            Pagina {currentPage} di{" "}
            {Math.ceil(filteredTours.length / itemsPerPage)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(filteredTours.length / itemsPerPage)
                )
              )
            }
            disabled={
              currentPage === Math.ceil(filteredTours.length / itemsPerPage)
            }
          >
            Successivo
          </button>
        </div>
      )}
    </div>
  );
};

export default TourList;

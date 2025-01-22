import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePdi } from "../../context/PdiContext"; // Usa il contesto
import "./PdiList.css";
import axios from "axios";

const PdiList = () => {
  const navigate = useNavigate();
  const { pdiList, fetchPdi, deletePdi } = usePdi(); // Ottieni le funzioni dal contesto
  const [searchColumn, setSearchColumn] = useState("generico"); // Colonna su cui cercare
  const [searchTerm, setSearchTerm] = useState(""); // Valore da cercare
  const [filteredPdiList, setFilteredPdiList] = useState([]);
  const [provinceFilter, setProvinceFilter] = useState(""); // Filtro per provincia
  const [categoryFilter, setCategoryFilter] = useState(""); // Filtro per categoria
  const [categorie, setCategorie] = useState([]); // Lista delle categorie
  const [currentPage, setCurrentPage] = useState(1); // Pagina corrente
  const itemsPerPage = 20; // Numero di elementi per pagina
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPdiList.slice(indexOfFirstItem, indexOfLastItem);

  // Province siciliane
  const provinceSiciliane = [
    "AG",
    "CL",
    "CT",
    "EN",
    "ME",
    "PA",
    "RG",
    "SR",
    "TP",
  ];

  // Carica i dati all'avvio
  useEffect(() => {
    fetchPdi(); // Richiama i dati dal backend
    axios.get("http://localhost:3001/api/categorie").then((res) => {
      setCategorie(res.data);
    });
  }, [fetchPdi]); // Ora è sicuro includere fetchPdi

  // Filtra la lista in base al valore di ricerca e ai filtri
  useEffect(() => {
    const filtered = pdiList.filter((pdi) => {
      // Verifica il filtro per provincia
      const matchProvince = !provinceFilter || pdi.provincia === provinceFilter;

      // Verifica il filtro per categoria
      const matchCategory =
        !categoryFilter ||
        (Array.isArray(pdi.categorie) &&
          pdi.categorie.some(
            (cat) => cat && cat.id === parseInt(categoryFilter, 10)
          ));

      // Verifica la barra di ricerca
      const matchSearch =
        searchColumn === "generico"
          ? pdi.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pdi.comune?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pdi.provincia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (Array.isArray(pdi.categorie) &&
              pdi.categorie.some(
                (cat) =>
                  cat &&
                  cat.name.toLowerCase().includes(searchTerm.toLowerCase())
              ))
          : pdi[searchColumn]
              ?.toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

      // Restituisce true solo se tutti i filtri corrispondono
      return matchProvince && matchCategory && matchSearch;
    });

    setFilteredPdiList(filtered);
  }, [searchTerm, searchColumn, pdiList, provinceFilter, categoryFilter]);

  // Resetta la pagina corrente quando cambiano i filtri o la ricerca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchColumn, provinceFilter, categoryFilter]);

  return (
    <div className="pdi-list">
      <button className="create-button" onClick={() => navigate("/pdi/new")}>
        + Crea nuovo PDI
      </button>
      <h1>Lista dei Punti di Interesse</h1>
      {/* Barra di ricerca e filtri */}
      <div id="search-bar-pdi">
        <select
          value={searchColumn}
          onChange={(e) => setSearchColumn(e.target.value)}
          className="search-select"
        >
          <option value="generico">Generico</option>
          <option value="nome">Nome</option>
          <option value="comune">Comune</option>
          <option value="provincia">Provincia</option>
        </select>
        <input
          type="text"
          placeholder={
            searchColumn === "generico"
              ? "Cerca in tutti i campi..."
              : `Cerca per ${searchColumn}...`
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          id="search-input-pdi"
        />
        <select
          value={provinceFilter}
          onChange={(e) => setProvinceFilter(e.target.value)}
          className="search-select"
        >
          <option value="">Tutte le Province</option>
          {provinceSiciliane.map((provincia) => (
            <option key={provincia} value={provincia}>
              {provincia}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="search-select"
        >
          <option value="">Tutte le Categorie</option>
          {categorie.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.name}
            </option>
          ))}
        </select>
      </div>
      <table id="pdi-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Comune</th>
            <th>Provincia</th>
            <th>Categoria</th>
            <th>Data Creazione</th>
            <th>Ultima Modifica</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((pdi) => (
            <tr key={pdi.id}>
              <td>{pdi.id}</td>
              <td className="nome-cell">
                <div>{pdi.nome}</div>
                <div className="nome-actions">
                  <button
                    onClick={() => navigate(`/pdi/edit/${pdi.slug}`)}
                    className="edit"
                  >
                    Modifica
                  </button>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Sei sicuro di voler eliminare il pdi ${pdi.nome}?`
                        )
                      ) {
                        deletePdi(pdi.id)
                          .then(() =>
                            console.log(
                              `Pdi con ID ${pdi.id} eliminato con successo.`
                            )
                          )
                          .catch((error) =>
                            console.error(
                              `Errore nell'eliminazione del pdi:`,
                              error
                            )
                          );
                      }
                    }}
                    className="delete"
                  >
                    Elimina
                  </button>
                </div>
              </td>
              <td>{pdi.comune}</td>
              <td>{pdi.provincia}</td>
              <td>
                {Array.isArray(pdi.categorie)
                  ? pdi.categorie
                      .filter((cat) => cat && cat.name) // Ignora categorie null o senza nome
                      .map((cat) => cat.name)
                      .join(", ")
                  : "N/A"}
              </td>
              <td>{pdi.dataCreazione}</td>
              <td>{pdi.ultimaModifica || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {Math.ceil(filteredPdiList.length / itemsPerPage) > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Precedente
          </button>
          <span>
            Pagina {currentPage} di{" "}
            {Math.ceil(filteredPdiList.length / itemsPerPage)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(filteredPdiList.length / itemsPerPage)
                )
              )
            }
            disabled={
              currentPage === Math.ceil(filteredPdiList.length / itemsPerPage)
            }
          >
            Successivo
          </button>
        </div>
      )}

      <div className="pdi-count">
        Visualizzati {filteredPdiList.length} punti di interesse
      </div>
    </div>
  );
};

export default PdiList;

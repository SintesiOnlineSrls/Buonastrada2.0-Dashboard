import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComuni } from "../../context/ComuniContext";
import "./ComuneList.css";

const ComuneList = () => {
  const navigate = useNavigate();
  const { fetchComuni, comuniList, deleteComune } = useComuni(); // Importa deleteComune
  const [filteredComuniList, setFilteredComuniList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

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

  useEffect(() => {
    const loadComuni = async () => {
      try {
        await fetchComuni();
      } catch (error) {
        console.error("Errore nel caricamento dei comuni:", error);
      }
    };
    loadComuni();
  }, [fetchComuni]);

  useEffect(() => {
    const filtered = comuniList.filter((comune) => {
      const matchProvince =
        !provinceFilter || comune.provincia === provinceFilter;
      const matchSearch =
        comune.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comune.provincia.toLowerCase().includes(searchTerm.toLowerCase());
      return matchProvince && matchSearch;
    });

    setFilteredComuniList(filtered);
  }, [searchTerm, provinceFilter, comuniList]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredComuniList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Resetta la pagina corrente quando cambiano i filtri o la ricerca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, provinceFilter]);

  return (
    <div className="comune-list">
      <button
        className="comune-create-button"
        onClick={() => navigate("/comuni/new")}
      >
        + Crea nuovo Comune
      </button>

      <h1>Lista dei Comuni</h1>
      <div className="comune-search-bar">
        <input
          type="text"
          placeholder="Cerca per nome o provincia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          id="search-input-cmn"
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
      </div>
      <table id="comune-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Provincia</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((comune) => (
            <tr key={comune.id}>
              <td>{comune.id}</td>
              <td className="comune-cell">
                <div>{comune.nome}</div>
                <div className="comune-actions">
                  <button
                    onClick={() => navigate(`/comuni/edit/${comune.id}`)}
                    className="edit"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Sei sicuro di voler eliminare il comune ${comune.nome}?`
                        )
                      ) {
                        deleteComune(comune.id)
                          .then(() =>
                            console.log(
                              `Comune con ID ${comune.id} eliminato con successo.`
                            )
                          )
                          .catch((error) =>
                            console.error(
                              `Errore nell'eliminazione del comune:`,
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
              <td>{comune.provincia}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {Math.ceil(filteredComuniList.length / itemsPerPage) > 1 && (
        <div className="comune-pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Precedente
          </button>
          <span>
            Pagina {currentPage} di{" "}
            {Math.ceil(filteredComuniList.length / itemsPerPage)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(filteredComuniList.length / itemsPerPage)
                )
              )
            }
            disabled={
              currentPage ===
              Math.ceil(filteredComuniList.length / itemsPerPage)
            }
          >
            Successivo
          </button>
        </div>
      )}

      <div className="comune-count">
        Visualizzati {filteredComuniList.length} comuni
      </div>
    </div>
  );
};

export default ComuneList;

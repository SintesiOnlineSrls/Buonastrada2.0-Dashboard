import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PdiCategory.css";

const PdiCategory = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editedCategory, setEditedCategory] = useState(null); // Categoria in modifica
  const [editedValue, setEditedValue] = useState(""); // Nuovo valore per la categoria
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Carica le categorie all'avvio
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/categorie");
      setCategories(res.data);
      setFilteredCategories(res.data);
    } catch (err) {
      console.error("Errore nel caricamento delle categorie:", err);
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredCategories(
      categories.filter((cat) => cat.name.toLowerCase().includes(searchTerm))
    );
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
  
    try {
      const response = await axios.post("http://localhost:3001/api/categorie", { name: newCategory });
      const updatedCategories = [...categories, response.data];
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      setNewCategory("");
    } catch (err) {
      console.error("Errore nell'aggiunta della categoria:", err);
    }
  };

  const updateCategory = async (id) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/categorie/${id}`, { name: editedValue });
      const updatedCategories = categories.map((cat) =>
        cat.id === id ? response.data : cat
      );
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      setEditedCategory(null);
      setEditedValue("");
    } catch (err) {
      console.error("Errore nella modifica della categoria:", err);
    }
  };
  
  const deleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/categorie/${id}`);
      const updatedCategories = categories.filter((cat) => cat.id !== id);
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
    } catch (err) {
      console.error("Errore nell'eliminazione della categoria:", err);
    }
  };  

  return (
    <div className="pdi-category">
      <h1>Gestione Categorie dei Punti di Interesse</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Cerca categoria..."
          onChange={handleSearch}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Nuova categoria..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="search-input"
        />
        <button onClick={addCategory} className="create-button">
          Aggiungi
        </button>
      </div>
      <table id="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Categoria</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((category, index) => (
            <tr key={category.id}>
              <td>{index + 1}</td>
              <td>
                {editedCategory === category.id ? (
                  <input
                    type="text"
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                  />
                ) : (
                  category.name
                )}
              </td>
              <td>
                {editedCategory === category.id ? (
                  <>
                    <button
                      onClick={() => updateCategory(category.id)}
                      className="edit"
                    >
                      Salva
                    </button>
                    <button
                      onClick={() => {
                        setEditedCategory(null);
                        setEditedValue("");
                      }}
                      className="delete"
                    >
                      Annulla
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditedCategory(category.id);
                        setEditedValue(category.name);
                      }}
                      className="edit"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="delete"
                    >
                      Elimina
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PdiCategory;

import React, { useState, useEffect } from "react";
import { useDirty } from "../../context/DirtyContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";


function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false); // Stato per la sidebar
  const [isTransitioned, setIsTransitioned] = useState(true); // Stato per controllare il completamento della transizione
  const [openDropdown, setOpenDropdown] = useState(null); // Stato unico per i menu a tendina
  const { logout } = useAuth(); // Ottieni la funzione logout dal contesto
  const { isDirty, setIsDirty } = useDirty();
  const navigate = useNavigate();
  
  // Alterna lo stato della sidebar
  const toggleSidebar = () => {
    if (!isCollapsed) {
      setIsTransitioned(false); // Nasconde gli elementi prima di chiudere
    }
    setIsCollapsed(!isCollapsed);
  };

  // Rende visibili gli elementi solo dopo la transizione
  useEffect(() => {
    if (!isCollapsed) {
      const timer = setTimeout(() => setIsTransitioned(true), 300); // Tempo uguale alla transizione CSS
      return () => clearTimeout(timer); // Cleanup
    }
  }, [isCollapsed]);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  // Funzione per la navigazione
  const handleNavigation = (path) => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "Ci sono modifiche non salvate. Vuoi davvero continuare?"
      );
      if (!confirmLeave) return;
    }
    setIsDirty(false);
    navigate(path);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        <img
          className={isCollapsed ? "img-collapse" : "img-collapse-mirror"}
          src="/img/collapse.svg"
          alt={isCollapsed ? "Apri sidebar" : "Chiudi sidebar"}
        />
      </button>
      {isTransitioned && (
        <>
          <img className="logo" src="/img/testo-logo.png" alt="Buonastrada" />
          <ul>
            <li>
              <button
                className="sidebar-button"
                onClick={() => handleNavigation("/")}
              >
                Home
              </button>
            </li>
            <li
              onClick={() => toggleDropdown("pdi")}
              className="dropdown-toggle"
            >
              Punti di Interesse
              <span
                className={`arrow ${openDropdown === "pdi" ? "open" : ""}`}
              ></span>
            </li>
            {openDropdown === "pdi" && (
              <ul className="dropdown-menu">
                <li>
                  <button
                    className="sidebar-button"
                    onClick={() => handleNavigation("/pdi/new")}
                  >
                    Crea Punto di Interesse
                  </button>
                </li>
                <li>
                  <button
                    className="sidebar-button"
                    onClick={() => handleNavigation("/pdi")}
                  >
                    Lista Punti di Interesse
                  </button>
                </li>
                <li>
                  <button
                    className="sidebar-button"
                    onClick={() => handleNavigation("/pdi/categorie")}
                  >
                    Categorie
                  </button>
                </li>
              </ul>
            )}
            <li
              onClick={() => toggleDropdown("comuni")}
              className="dropdown-toggle"
            >
              Comuni
              <span
                className={`arrow ${openDropdown === "comuni" ? "open" : ""}`}
              ></span>
            </li>
            {openDropdown === "comuni" && (
              <ul className="dropdown-menu">
                <li>
                  <button
                    className="sidebar-button"
                    onClick={() => handleNavigation("/comuni/new")}
                  >
                    Crea Comune
                  </button>
                </li>
                <li>
                  <button
                    className="sidebar-button"
                    onClick={() => handleNavigation("/comuni")}
                  >
                    Lista Comuni
                  </button>
                </li>
              </ul>
            )}
            <li
              onClick={() => toggleDropdown("tour")}
              className="dropdown-toggle"
            >
              Tour
              <span
                className={`arrow ${openDropdown === "tour" ? "open" : ""}`}
              ></span>
            </li>
            {openDropdown === "tour" && (
              <ul className="dropdown-menu">
                <li>
                  <button
                    className="sidebar-button"
                    onClick={() => handleNavigation("/tour/new")}
                  >
                    Crea Tour
                  </button>
                </li>
                <li>
                  <button
                    className="sidebar-button"
                    onClick={() => handleNavigation("/tour")}
                  >
                    Lista Tour
                  </button>
                </li>
                <li>
                  <button
                    className="sidebar-button"
                    onClick={() => handleNavigation("/tour/categorie")}
                  >
                    Categorie
                  </button>
                </li>
              </ul>
            )}
            <li>
              <button
                className="sidebar-button"
                onClick={() => {
                  handleNavigation("/impostazioni");
                  closeDropdowns();
                }}
              >
                Impostazioni
              </button>
            </li>
          </ul>
          <button className="logout-button" onClick={() => logout()}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}

export default Sidebar;

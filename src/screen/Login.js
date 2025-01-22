import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./css/Login.css";

function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Per mostrare il messaggio di errore
  const [shake, setShake] = useState(false); // Per l'animazione shake
  const { login, logoutReason, setLogoutReason } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id === "admin" && password === "admin") {
      setError(""); // Rimuovi il messaggio di errore
      login(id, password);
    } else {
      setError("ID o Password errati"); // Mostra il messaggio di errore
      setShake(true); // Attiva l'animazione shake
      setTimeout(() => setShake(false), 300); // Rimuove la classe shake dopo l'animazione
    }
  };

  const handleFocus = () => {
    setLogoutReason(""); // Rimuove il messaggio di disconnessione
    setError(""); // Rimuove il messaggio di errore
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      {logoutReason && <div className="logout-message">{logoutReason}</div>}
      <form
        onSubmit={handleSubmit}
        className={shake ? "shake" : ""} // Applica la classe shake se necessario
      >
        <label>
          ID:
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onFocus={handleFocus} // Nasconde i messaggi di errore/disconnessione
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={handleFocus} // Nasconde i messaggi di errore/disconnessione
          />
        </label>
        {error && <div className="error-message">{error}</div>}{" "}
        {/* Mostra il messaggio di errore */}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;

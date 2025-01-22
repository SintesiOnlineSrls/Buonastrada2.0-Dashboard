import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [logoutReason, setLogoutReason] = useState(""); // Messaggio di logout
  const navigate = useNavigate();
  const inactivityTimeoutRef = useRef(null); // Ref per il timer

  // Funzione per effettuare il logout
  const logout = useCallback(
    (reason = "") => {
      setUser(null);
      setLogoutReason(reason);
      localStorage.removeItem("user");
      navigate("/login");
    },
    [navigate]
  );

  // Funzione per resettare il timer di inattività
  const resetInactivityTimer = useCallback(() => {
    // Cancella il timer precedente
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // Imposta un nuovo timer (esempio: 1 ora = 3600000 ms)
    inactivityTimeoutRef.current = setTimeout(() => {
      logout("Sei stato disconnesso per inattività.");
    }, 3600000); // 1 ora
  }, [logout]);

  // Effetto per monitorare l'attività e resettare il timer
  useEffect(() => {
    if (user) {
      const handleActivity = () => resetInactivityTimer();

      // Aggiungi gli event listener
      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("keydown", handleActivity);

      // Avvia il timer iniziale
      resetInactivityTimer();

      return () => {
        // Rimuovi gli event listener e cancella il timer
        window.removeEventListener("mousemove", handleActivity);
        window.removeEventListener("keydown", handleActivity);
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
      };
    }
  }, [user, resetInactivityTimer]); // Inclusa la dipendenza `resetInactivityTimer`

  // Funzione di login
  const login = (id, password) => {
    if (id === "admin" && password === "admin") {
      const userData = { id: "admin" };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      resetInactivityTimer();
      navigate("/");
    } else {
      alert("Credenziali non valide");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, logoutReason, setLogoutReason }}
    >
      {children}
    </AuthContext.Provider>
  );
}

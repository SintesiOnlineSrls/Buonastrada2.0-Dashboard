import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext"; // Importa il contesto Auth per primo
import { PdiProvider } from "./context/PdiContext"; // Poi il contesto PDI
import { ComuniProvider } from "./context/ComuniContext";
import { DirtyProvider } from "./context/DirtyContext";

import Sidebar from "./components/Sidebar/Sidebar";
import Login from "./screen/Login";
import ComuneList from "./screen/comune/ComuneList";
import ComuneEdit from "./screen/comune/ComuneEdit";
import ComuneCreate from "./screen/comune/ComuneCreate";
import PdiList from "./screen/pdi/PdiList";
import PdiEdit from "./screen/pdi/PdiEdit";
import PdiCreate from "./screen/pdi/PdiCreate";
import PdiCategory from "./screen/pdi/PdiCategory";
import TourList from "./screen/tour/TourList";
import TourEdit from "./screen/tour/TourEdit";
import TourCreate from "./screen/tour/TourCreate";
import Home from "./screen/Home";
import TourCategory from "./screen/tour/TourCategory";

// Componente per gestire le rotte private
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// Layout protetto (Sidebar + Contenuti)
function ProtectedLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="content-element">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comuni" element={<ComuneList />} />
          <Route path="/comuni/new" element={<ComuneCreate />} />
          <Route path="/comuni/edit/:id" element={<ComuneEdit />} />
          <Route path="/pdi" element={<PdiList />} />
          <Route path="/pdi/new" element={<PdiCreate />} />
          <Route path="/pdi/edit/:slug" element={<PdiEdit />} />
          <Route path="/pdi/categorie" element={<PdiCategory />} />
          <Route path="/tour" element={<TourList />} />
          <Route path="/tour/edit/:id" element={<TourEdit />} />
          <Route path="/tour/new" element={<TourCreate />} />
          <Route path="/tour/categorie" element={<TourCategory />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DirtyProvider>
          <PdiProvider>
            <ComuniProvider>
              {/* {" "} */}
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <ProtectedLayout />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </ComuniProvider>
          </PdiProvider>
        </DirtyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

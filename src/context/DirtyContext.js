import React, { createContext, useState, useContext } from "react";

const DirtyContext = createContext();

export const DirtyProvider = ({ children }) => {
  const [isDirty, setIsDirty] = useState(false);

  return (
    <DirtyContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </DirtyContext.Provider>
  );
};

export const useDirty = () => useContext(DirtyContext);

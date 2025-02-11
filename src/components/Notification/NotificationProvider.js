import React, { createContext, useContext, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Alert from "@mui/material/Alert";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const showNotification = (severity, message) => {
    setNotification({ open: true, severity, message });

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 3000); // Auto-close after 3 seconds
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Dialog
        open={notification.open}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      >
        <Alert variant="filled" severity={notification.severity}>{notification.message}</Alert>
      </Dialog>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

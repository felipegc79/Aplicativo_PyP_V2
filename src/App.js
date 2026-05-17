import React, { useState, useEffect } from "react";
import localforage from "localforage";
import { INITIAL_DATA } from "./data";
import Modal from "./components/Modal";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import MainScreen from "./screens/MainScreen";
import DirectorDashboard from "./screens/DirectorDashboard";
import CoordinatorDashboard from "./screens/CoordinatorDashboard";
import LeaderDashboard from "./screens/LeaderDashboard";
import ActaFormScreen from "./screens/ActaFormScreen";
import ActaDetailsScreen from "./screens/ActaDetailsScreen";
import SignatureView from "./screens/SignatureView";
import NotificationScreen from "./screens/NotificationScreen";
import PinEntryScreen from "./screens/PinEntryScreen";
import SignaturePadScreen from "./components/SignaturePadScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [sdsData, setSdsData] = useState(INITIAL_DATA);
  const [selectedSds, setSelectedSds] = useState(null);
  const [directorView, setDirectorView] = useState("tableros");

  // --- OFFLINE SYNC (localForage) ---
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Escuchar cambios de red
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Forzar actualización de datos cuando cambia la versión
    const DATA_VERSION = "v5_map_fix";
    localforage.getItem("dataVersion").then((version) => {
      if (version !== DATA_VERSION) {
        // Datos obsoletos o primera carga: usar INITIAL_DATA
        localforage.setItem("dataVersion", DATA_VERSION);
        localforage.setItem("sdsData", INITIAL_DATA);
        setSdsData(INITIAL_DATA);
      } else {
        // Cargar datos locales existentes
        localforage.getItem("sdsData").then((savedData) => {
          if (savedData) {
            setSdsData(savedData);
          }
        });
      }
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync logic when coming back online
  useEffect(() => {
    if (!isOffline) {
      console.log("Sincronizando datos pendientes...");
      // Aquí se sincronizaría con el backend real:
      // fetch('http://localhost:3001/api/sync', { method: 'POST', body: JSON.stringify(sdsData) })
    }
  }, [isOffline, sdsData]);

  // Guardar en localforage cada vez que sdsData cambie
  useEffect(() => {
    localforage.setItem("sdsData", sdsData);
  }, [sdsData]);

  // --- BASE DE DATOS DE USUARIOS ---
  const [users, setUsers] = useState([
    {
      username: "admin",
      password: "123",
      name: "Administrador T'IKKA",
      role: "Administrador del sistema",
      email: "desarrollo@tikkaconsultores.com",
      identificacion: "80111222",
      telefono: "3001112222",
    },
    {
      username: "lider",
      password: "123",
      name: "Luis Líder",
      role: "Lider de prevencion",
      email: "lider@colsanitas.com",
      identificacion: "1010222333",
      telefono: "3007771111",
    },
  ]);

  const [asesores, setAsesores] = useState([
    {
      id: 1,
      nombre: "Ana Asesora",
      identificacion: "12345",
      telefono: "3001234567",
      email: "asesor@proveedor.com",
      empresa: "Prevención Integral S.A.S",
      cargo: "Asesor de Prevención",
    },
    {
      id: 2,
      nombre: "Pedro Pérez",
      identificacion: "67890",
      telefono: "3109876543",
      email: "pedro@proveedor.com",
      empresa: "Medicina Preventiva IPS S.A.S",
      cargo: "Asesor de Prevención",
    },
    {
      id: 3,
      nombre: "María Fernanda López",
      identificacion: "45678",
      telefono: "3204567890",
      email: "maria.lopez@consultores.com",
      empresa: "Gestión SST Consultores S.A.S.",
      cargo: "Asesor de Prevención",
    },
    {
      id: 4,
      nombre: "Carlos Andrés Ramírez",
      identificacion: "78901",
      telefono: "3157890123",
      email: "carlos.ramirez@phigma.com",
      empresa: "Soluciones Ocupacionales S.A.S",
      cargo: "Asesor de Prevención",
    },
    {
      id: 5,
      nombre: "Laura Patricia Gómez",
      identificacion: "23456",
      telefono: "3182345678",
      email: "laura.gomez@bilianz.com",
      empresa: "Bienestar Laboral Consultores S.A.S",
      cargo: "Asesor de Prevención",
    },
    {
      id: 6,
      nombre: "Andrés Felipe Moreno",
      identificacion: "89012",
      telefono: "3008901234",
      email: "andres.moreno@quiron.com",
      empresa: "Proteger IPS Ocupacional",
      cargo: "Asesor de Prevención",
    },
  ]);

  const [actaForm, setActaForm] = useState(null);
  const [currentPin, setCurrentPin] = useState(null);
  const [pinVerified, setPinVerified] = useState(false);
  const [clientSignatureData, setClientSignatureData] = useState(null);
  const [providerSignatureData, setProviderSignatureData] = useState(null);
  const [modal, setModal] = useState({ show: false, title: "", message: "" });

  const showModal = (title, message) =>
    setModal({ show: true, title, message });
  const closeModal = () => setModal({ show: false, title: "", message: "" });

  const handleRegisterUser = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    showModal(
      "Registro Exitoso",
      `Usuario ${newUser.username} creado. Inicie sesión.`
    );
    setCurrentScreen("login");
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === "Administrador del sistema") {
      setDirectorView("tableros");
      setCurrentScreen("directorDashboard");
    } else if (userData.role === "Lider de prevencion") {
      setCurrentScreen("leaderDashboard");
    } else {
      setCurrentScreen("main");
    }
  };

  const handleLogout = () => {
    setUser(null);
    resetFlow();
    setCurrentScreen("login");
  };

  const resetFlow = () => {
    setSelectedSds(null);
    setActaForm(null);
    setCurrentPin(null);
    setPinVerified(false);
    setClientSignatureData(null);
  };

  const handleResetData = () => {
    setSdsData(INITIAL_DATA);
    localforage.setItem("sdsData", INITIAL_DATA);
    showModal(
      "Base de Datos Restablecida",
      `La base de datos se ha restablecido correctamente con las ${INITIAL_DATA.length} órdenes originales.`
    );
  };

  const handleSaveAssignments = (assignments) => {
    const updatedData = sdsData.map((item) => {
      if (assignments[item.SDS]) {
        const asesorId = assignments[item.SDS];
        const asesor = asesores.find((a) => String(a.id) === String(asesorId));
        if (asesor) {
          return {
            ...item,
            Proveedor: asesor.nombre,
            NitProveedor: asesor.identificacion,
          };
        }
      }
      return item;
    });
    setSdsData(updatedData);
    showModal(
      "Éxito",
      "Las asignaciones se han guardado y sincronizado correctamente."
    );
  };

  // --- DENTRO DE App.js ---

  const handleFinalizeActa = (sdsId, finalFormData) => {
    let newData = [...sdsData];
    const originalIndex = newData.findIndex((item) => item.SDS === sdsId);

    if (originalIndex !== -1) {
      const originalItem = newData[originalIndex];

      const existingChildrenCount = newData.filter(
        (item) => item.ParentSDS === originalItem.SDS
      ).length;

      const nextSequence = String(existingChildrenCount + 1).padStart(2, "0");
      const newChildSdsId = `${originalItem.SDS}-${nextSequence}`;

      const newActItem = {
        ...originalItem,
        SDS: newChildSdsId,
        IsChildAct: true,
        ParentSDS: originalItem.SDS,
        Estado: "Acta Diligenciada",
        Calificacion: finalFormData.evaluacion?.replace(/_/g, " ") || "N/A",
        DetallesActa: finalFormData,
        Firmas: {
          Cliente: clientSignatureData,
        },
        FechaEjecucion: new Date().toISOString().split("T")[0],
      };

      const updatedParentItem = {
        ...originalItem,
        IsChildAct: false,
        Estado: "Concluida",
      };

      newData[originalIndex] = updatedParentItem;
      newData.unshift(newActItem);
      
      // La sincronización real con un backend iría aquí.
      // Por ahora, guardamos en el estado y useEffect se encarga de IndexedDB.
      if (!isOffline) {
        // fetch('http://localhost:3001/api/sync', { ... })
        console.log("Sincronizando datos con el servidor...");
      } else {
        console.log("Modo Offline: Datos guardados localmente.");
      }

      setSdsData(newData);
    }
    resetFlow();

    // Redirección al finalizar: Volver a la pantalla principal del rol
    if (user?.role === "Administrador del sistema") {
      setDirectorView("tableros");
      setCurrentScreen("directorDashboard");
    } else if (user?.role === "Lider de prevencion") {
      setCurrentScreen("leaderDashboard");
    } else {
      setCurrentScreen("main");
    }
  };

  const navigateTo = (screen, data = null) => {
    if (data) setSelectedSds(data);
    
    // Redirigir según rol al presionar "volver" (main)
    if (screen === "main") {
      if (user?.role === "Administrador del sistema") {
        setDirectorView("tableros");
        setCurrentScreen("directorDashboard");
        resetFlow();
        return;
      }
      if (user?.role === "Lider de prevencion") {
        setCurrentScreen("leaderDashboard");
        resetFlow();
        return;
      }
    }
    
    if (screen === "main" || screen === "directorDashboard") resetFlow();
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return (
          <LoginScreen
            users={users}
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setCurrentScreen("register")}
          />
        );
      case "register":
        return (
          <RegisterScreen
            onRegisterSuccess={handleRegisterUser}
            onCancel={() => setCurrentScreen("login")}
            showModal={showModal}
          />
        );

      case "directorDashboard":
        return (
          <DirectorDashboard
            onLogout={handleLogout}
            user={user}
            sdsData={sdsData}
            onNavigate={navigateTo}
            initialModule={directorView}
            asesores={asesores}
            setAsesores={setAsesores}
            showModal={showModal}
            onSaveAssignments={handleSaveAssignments}
            onResetData={handleResetData}
            currentUser={user}
          />
        );
      case "coordinatorDashboard":
        return (
          <CoordinatorDashboard
            onLogout={handleLogout}
            user={user}
            sdsData={sdsData}
          />
        );
      case "leaderDashboard":
        return (
          <LeaderDashboard
            onLogout={handleLogout}
            user={user}
            sdsData={sdsData}
            asesores={asesores}
            setAsesores={setAsesores}
            showModal={showModal}
            onSaveAssignments={handleSaveAssignments}
            onNavigate={navigateTo}
          />
        );

      case "main":
        return (
          <MainScreen
            onNavigate={navigateTo}
            onLogout={handleLogout}
            user={user?.name}
            userRole={user?.role}
            sdsData={sdsData}
          />
        );

      case "actaForm":
        return (
          <ActaFormScreen
            onNavigate={navigateTo}
            user={user}
            showModal={showModal}
            selectedSds={selectedSds}
            setActaForm={setActaForm}
            sdsData={sdsData} // Pasar sdsData para validación
          />
        );

      case "actaDetails":
        return (
          <ActaDetailsScreen
            onNavigate={navigateTo}
            sdsItem={selectedSds}
            user={user}
          />
        );
      case "signature":
        return (
          <SignatureView
            form={actaForm}
            onNavigate={navigateTo}
            showModal={showModal}
            clientSigned={!!clientSignatureData}
            clientSignatureData={clientSignatureData}
            setActaForm={setActaForm}
            onFinalize={handleFinalizeActa}
          />
        );
      case "notification":
        return (
          <NotificationScreen onNavigate={navigateTo} currentPin={currentPin} />
        );
      case "pinEntry":
        return (
          <PinEntryScreen
            onNavigate={navigateTo}
            showModal={showModal}
            currentPin={currentPin}
            setPinVerified={setPinVerified}
          />
        );
      case "signClient":
        return (
          <SignaturePadScreen
            onNavigate={navigateTo}
            showModal={showModal}
            signatureType="client"
            onSaveSignature={setClientSignatureData}
          />
        );
      default:
        return (
          <LoginScreen
            users={users}
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setCurrentScreen("register")}
          />
        );
    }
  };

  return (
    <div className="antialiased text-gray-900 bg-gray-50 min-h-screen font-sans relative max-w-[100vw] overflow-x-hidden">
      <style>{`
        @media (max-width: 768px) {
          .grid-cols-10, .grid-cols-8 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .md\\:flex-row { flex-direction: column !important; }
          aside { width: 100% !important; height: auto !important; position: relative !important; }
          main { padding: 1rem !important; }
          .text-3xl { font-size: 1.5rem !important; }
          .p-8 { padding: 1.5rem !important; }
          .md\\:p-12 { padding: 1.5rem !important; }
        }
        .tikka-gradient-btn {
          background: linear-gradient(135deg, #2D3380 0%, #00BFA5 100%);
          transition: all 0.3s ease;
        }
        .tikka-gradient-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 191, 165, 0.3);
        }
      `}</style>
      {isOffline && (
        <div className="bg-red-500 text-white text-xs font-bold text-center py-2 sticky top-0 z-[100] shadow-md w-full">
          Estás en modo Offline. Los datos se guardarán localmente para sincronización.
        </div>
      )}
      <Modal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
      {renderScreen()}
    </div>
  );
}

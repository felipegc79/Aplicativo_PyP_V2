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
    }
  }, [isOffline, sdsData]);

  // Guardar en localforage cada vez que sdsData cambie
  useEffect(() => {
    localforage.setItem("sdsData", sdsData);
  }, [sdsData]);

  // --- ESCANEO QR Y VERIFICACIÓN DE CREDENCIALES ---
  const [verifyData, setVerifyData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify") === "true") {
      const data = {
        sds: params.get("sds"),
        cliente: params.get("cliente"),
        firmadoPor: params.get("firmadoPor"),
        metodo: params.get("metodo"),
        fecha: params.get("fecha"),
        geo: params.get("geo"),
        nombre: params.get("nombre"),
      };
      setVerifyData(data);
      setCurrentScreen("verification");
    }
  }, []);

  const handleCloseVerification = () => {
    setVerifyData(null);
    window.history.replaceState({}, document.title, window.location.pathname);
    setCurrentScreen("login");
  };

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
      role: "Lider",
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
      cargo: "Asesor",
    },
    {
      id: 2,
      nombre: "Pedro Pérez",
      identificacion: "67890",
      telefono: "3109876543",
      email: "pedro@proveedor.com",
      empresa: "Medicina Preventiva IPS S.A.S",
      cargo: "Asesor",
    },
    {
      id: 3,
      nombre: "María Fernanda López",
      identificacion: "45678",
      telefono: "3204567890",
      email: "maria.lopez@consultores.com",
      empresa: "Gestión SST Consultores S.A.S.",
      cargo: "Asesor",
    },
    {
      id: 4,
      nombre: "Carlos Andrés Ramírez",
      identificacion: "78901",
      telefono: "3157890123",
      email: "carlos.ramirez@phigma.com",
      empresa: "Soluciones Ocupacionales S.A.S",
      cargo: "Asesor",
    },
    {
      id: 5,
      nombre: "Laura Patricia Gómez",
      identificacion: "23456",
      telefono: "3182345678",
      email: "laura.gomez@bilianz.com",
      empresa: "Bienestar Laboral Consultores S.A.S",
      cargo: "Asesor",
    },
    {
      id: 6,
      nombre: "Andrés Felipe Moreno",
      identificacion: "89012",
      telefono: "3008901234",
      email: "andres.moreno@quiron.com",
      empresa: "Proteger IPS Ocupacional",
      cargo: "Asesor",
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
    } else if (userData.role === "Lider") {
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
    setProviderSignatureData(null);
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

  // --- FINALIZAR ACTA ---
  const handleFinalizeActa = (sdsId, finalFormData) => {
    let newData = [...sdsData];
    const originalIndex = newData.findIndex((item) => item.SDS === sdsId || String(item.SDS) === String(sdsId));

    if (originalIndex !== -1) {
      const originalItem = newData[originalIndex];

      const existingChildrenCount = newData.filter(
        (item) => item.ParentSDS === originalItem.SDS || String(item.ParentSDS) === String(originalItem.SDS)
      ).length;

      const nextSequence = String(existingChildrenCount + 1).padStart(2, "0");
      const newChildSdsId = `${originalItem.SDS}-${nextSequence}`;

      // ERROR DE GUARDADO RESUELTO:
      // Promovemos los campos de ubicación y fecha del formulario final a primer nivel de la nueva acta
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
          Proveedor: providerSignatureData,
        },
        FechaEjecucion: finalFormData.fechaActividad || new Date().toISOString().split("T")[0],
        FechaProgramada: finalFormData.fechaActividad || originalItem.FechaProgramada,
        Departamento: finalFormData.departamento || originalItem.Departamento,
        Municipio: finalFormData.municipio || originalItem.Municipio,
        Direccion: finalFormData.direccion || originalItem.Direccion || "No registrada",
        HorasEjecutadas: Number(finalFormData.cantidadEjecutada) || Number(originalItem.HorasPlaneadas) || 0,
      };

      const updatedParentItem = {
        ...originalItem,
        IsChildAct: false,
        Estado: "Concluida",
      };

      newData[originalIndex] = updatedParentItem;
      newData.unshift(newActItem);
      
      if (!isOffline) {
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
    } else if (user?.role === "Lider") {
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
      if (user?.role === "Lider") {
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
            providerSigned={!!providerSignatureData}
            providerSignatureData={providerSignatureData}
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
            form={actaForm}
            onSaveSignature={setClientSignatureData}
          />
        );
      case "signProvider":
        return (
          <SignaturePadScreen
            onNavigate={navigateTo}
            showModal={showModal}
            signatureType="provider"
            form={actaForm}
            onSaveSignature={setProviderSignatureData}
          />
        );
      case "verification":
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950">
            <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 transform transition-all hover:scale-[1.01] relative overflow-hidden">
              {/* Floating premium badge decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-bl-full opacity-10"></div>
              
              <div className="text-center mb-6">
                <div className="mx-auto w-20 h-20 bg-emerald-100/90 rounded-full flex items-center justify-center mb-4 shadow-inner border-2 border-emerald-400/50 animate-pulse">
                  <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-emerald-200">
                  Documento Auténtico
                </span>
                <h2 className="text-2xl font-black text-slate-800 mt-3 uppercase tracking-tight">
                  Firma Digital Verificada
                </h2>
                <p className="text-xs text-slate-500 mt-1">Plataforma Tecnológica T'IKKA Consultores</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3.5 mb-6 text-sm">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-500 text-xs uppercase tracking-wide">ID de Servicio:</span>
                  <span className="font-extrabold text-slate-800 bg-slate-200 px-2 py-0.5 rounded text-xs">#{verifyData?.sds}</span>
                </div>
                <div className="flex justify-between items-start border-b border-slate-200/60 pb-2 gap-2">
                  <span className="font-bold text-slate-500 text-xs uppercase tracking-wide flex-shrink-0">Empresa / Cliente:</span>
                  <span className="font-extrabold text-slate-800 text-right">{verifyData?.cliente}</span>
                </div>
                <div className="flex justify-between items-start border-b border-slate-200/60 pb-2 gap-2">
                  <span className="font-bold text-slate-500 text-xs uppercase tracking-wide flex-shrink-0">Firmado Por:</span>
                  <span className="font-extrabold text-indigo-700 text-right uppercase">{verifyData?.nombre}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-500 text-xs uppercase tracking-wide">Rol del Firmante:</span>
                  <span className="font-bold text-teal-700 uppercase text-xs">{verifyData?.firmadoPor}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-500 text-xs uppercase tracking-wide">Método de Firma:</span>
                  <span className="font-semibold text-slate-700 text-xs">{verifyData?.metodo}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-500 text-xs uppercase tracking-wide">Fecha de Captura:</span>
                  <span className="font-semibold text-slate-700 text-xs">{verifyData?.fecha}</span>
                </div>
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="font-bold text-slate-500 text-xs uppercase tracking-wide">Coordenadas GPS:</span>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-slate-600">{verifyData?.geo}</span>
                    {verifyData?.geo && !verifyData.geo.includes("no disponible") && !verifyData.geo.includes("no soportada") && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(verifyData.geo)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-extrabold underline flex items-center gap-1"
                      >
                        🗺️ Ver Mapa
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCloseVerification}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  ✕ Cerrar Validación
                </button>
              </div>
            </div>
          </div>
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

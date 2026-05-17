import React, { useState } from "react";
import AppLayout from "../components/AppLayout";

// --- CARD SDS ---
const SdsCard = ({ item, onSelect }) => {
  // Identificación de tipo
  const isChild = !!item.IsChildAct;
  // Si es padre y está programada, es un pendiente
  const isPending = !isChild && item.Estado === "Programada";

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-3 active:bg-gray-50 transition-all cursor-pointer relative overflow-hidden group"
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          !isChild ? "bg-tikka-blue" : "bg-tikka-green"
        }`}
      ></div>

      <div className="pl-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {/* Mostramos el ID que ahora puede tener sufijo -01, -02 */}
              SDS #{item.SDS}
            </span>
            <h3 className="text-base font-bold text-tikka-blue leading-tight mt-1 line-clamp-2">
              {item.Cliente}
            </h3>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              !isChild
                ? "bg-blue-100 text-tikka-blue"
                : "bg-green-100 text-tikka-green"
            }`}
          >
            {item.Estado}
          </span>
        </div>

        <div className="space-y-1 mt-2 mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-700">📅 Fecha:</span>{" "}
            {item.FechaEjecucion || item.FechaProgramada}
          </p>

          {/* --- AQUI: MOSTRAR HORA INICIO Y FIN --- */}
          {/* Se muestra siempre que existan los datos, idealmente en las Hijas */}
          {item.HoraInicio && item.HoraFin && (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-gray-700 text-sm">
                💙 Horario:
              </span>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                {item.HoraInicio} - {item.HoraFin}
              </span>
            </div>
          )}

          <p className="text-sm text-gray-600 truncate mt-1">
            <span className="font-bold text-gray-700">📋 Actividad:</span>{" "}
            {item.Actividad}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-gray-500">
              Ubicación
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 flex flex-col items-center">
              <span className="text-[9px] text-gray-600 font-bold uppercase text-center">
                Municipio
              </span>
              <span className="text-sm font-extrabold text-gray-800">
                {item.Municipio || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute right-4 bottom-4 text-gray-300 group-hover:text-blue-500 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// --- ACORDEÓN ---
const AccordionSection = ({
  title,
  count,
  isOpen,
  onToggle,
  children,
  iconColor,
  iconSvg,
}) => (
  <div className="mb-4">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor} shadow-sm`}
        >
          {iconSvg}
        </div>
        <div className="text-left">
          <h2 className="text-base font-bold text-gray-800">
            {title}{" "}
            <span className="text-gray-500 font-normal ml-1">({count})</span>
          </h2>
        </div>
      </div>
      <div
        className={`text-gray-400 transform transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          )}
        </svg>
      </div>
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-[3000px] mt-3" : "max-h-0"
      }`}
    >
      {children}
    </div>
  </div>
);

// --- PANTALLA PRINCIPAL ---
const MainScreen = ({ onNavigate, onLogout, user, sdsData }) => {
  const [expandedSection, setExpandedSection] = useState("pending");

  // 1. PENDIENTES: Solo PADRES (Sin IsChildAct) y Programadas
  const pendingOrders = sdsData.filter(
    (item) => !item.IsChildAct && item.Estado === "Programada"
  );

  // 2. HISTÓRICO: Solo HIJAS (IsChildAct === true)
  // Aquí aparecerán las SDS con sufijo (Ej: 16817-01) y sus horarios
  const visitedOrders = sdsData.filter((item) => item.IsChildAct === true);

  const toggleSection = (section) =>
    setExpandedSection(expandedSection === section ? null : section);

  const handleSelect = (item) => {
    if (item.IsChildAct) {
      onNavigate("actaDetails", item);
    } else {
      onNavigate("actaForm", item);
    }
  };

  return (
    <AppLayout onNavigate={null} title={`Hola, ${user || "Usuario"}`}>
      <div className="flex flex-col gap-2 pb-20">
        <div className="flex justify-end mb-2">
          <button
            onClick={onLogout}
            className="text-xs text-red-500 font-medium border border-red-200 px-3 py-1 rounded-full bg-white hover:bg-red-50 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* SECCIÓN PENDIENTES */}
        <AccordionSection
          title="Actividades por ejecutar"
          count={pendingOrders.length}
          isOpen={expandedSection === "pending"}
          onToggle={() => toggleSection("pending")}
          iconColor="bg-tikka-blue"
          iconSvg={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        >
          {pendingOrders.length > 0 ? (
            pendingOrders.map((item) => (
              <SdsCard key={item.SDS} item={item} onSelect={handleSelect} />
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">
              No tienes pendientes
            </p>
          )}
        </AccordionSection>

        {/* SECCIÓN HISTÓRICO */}
        <AccordionSection
          title="Actividades ejecutadas"
          count={visitedOrders.length}
          isOpen={expandedSection === "visited"}
          onToggle={() => toggleSection("visited")}
          iconColor="bg-tikka-green"
          iconSvg={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        >
          {visitedOrders.length > 0 ? (
            visitedOrders.map((item) => (
              <SdsCard key={item.SDS} item={item} onSelect={handleSelect} />
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">
              Sin historial reciente
            </p>
          )}
        </AccordionSection>
      </div>
    </AppLayout>
  );
};

export default MainScreen;

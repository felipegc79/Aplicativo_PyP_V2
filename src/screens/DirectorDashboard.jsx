import React, { useState, useMemo, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AppLayout from "../components/AppLayout";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import colombiaGeo from "../colombia.json";

// --- COMPONENTES VISUALES COMPARTIDOS ---

const FilterInput = ({ label, value, onChange, options = null }) => (
  <div className="flex flex-col">
    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">
      {label}
    </label>
    {options ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
        placeholder="Buscar..."
      />
    )}
  </div>
);

// --- CARD SDS ---
const SdsCard = ({ item, onSelect }) => {
  const horasPlaneadas = Number(item.HorasPlaneadas) || 0;
  const horasEjecutadas = Number(item.HorasEjecutadas) || 0;
  const horasPendientes = Math.max(0, horasPlaneadas - horasEjecutadas);

  const isPending = item.Estado === "Programada";
  const labelEjecutadas = isPending ? "Acumulado" : "En esta Acta";

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-3 active:bg-gray-50 transition-all cursor-pointer relative overflow-hidden group"
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isPending ? "bg-tikka-blue" : "bg-tikka-green"
        }`}
      ></div>

      <div className="pl-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {item.IsChildAct
                ? `ACTA DE SERVICIO #${item.ParentSDS}`
                : `SERVICIO #${item.SDS}`}
            </span>
            <h3 className="text-base font-bold text-tikka-dark leading-tight mt-1 line-clamp-2">
              {item.Cliente}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Prov: {item.Proveedor}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isPending
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
            {item.FechaProgramada}
          </p>
          <p className="text-sm text-gray-600 truncate">
            <span className="font-bold text-gray-700">📋 Actividad:</span>{" "}
            {item.Actividad}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-gray-500">
              {isPending ? "Progreso General" : "Detalle Ejecución"}
            </span>
            <span className="text-gray-400 font-medium">
              Meta: {horasPlaneadas}h
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-green-200 rounded px-2 py-1 flex flex-col items-center">
              <span className="text-[10px] text-tikka-green font-bold uppercase">
                {labelEjecutadas}
              </span>
              <span className="text-sm font-extrabold text-gray-800">
                {horasEjecutadas}h
              </span>
            </div>
            {isPending && (
              <>
                <span className="text-gray-300">/</span>
                <div
                  className={`flex-1 bg-white border rounded px-2 py-1 flex flex-col items-center ${
                    horasPendientes > 0
                      ? "border-orange-200"
                      : "border-gray-200"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      horasPendientes > 0 ? "text-orange-600" : "text-gray-400"
                    }`}
                  >
                    Pendientes
                  </span>
                  <span className="text-sm font-extrabold text-gray-800">
                    {horasPendientes}h
                  </span>
                </div>
              </>
            )}
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

// --- GRÁFICOS SIMPLES ---
const SimpleBarChart = ({ data }) => {
  if (data.length === 0)
    return <p className="text-xs text-gray-400 py-4 text-center">Sin datos.</p>;
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-3 mt-4">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center text-xs">
          <div
            className="w-32 truncate font-medium text-gray-600 mr-2"
            title={item.label}
          >
            {item.label}
          </div>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-tikka-green rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxVal) * 100}%` }}
            ></div>
          </div>
          <div className="w-8 text-right font-bold text-gray-700">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- COMPONENTE CILINDRO 3D ---
const CylinderBar = ({ percent, color, value }) => {
  const [active, setActive] = useState(false);
  return (
    <div 
      className="relative w-full mx-auto h-full flex flex-col justify-end group cursor-pointer"
      onClick={() => setActive(!active)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <div className="relative w-full transition-all duration-1000 ease-out animate-fade-in" style={{ height: `${percent}%` }}>
        {/* Top Cap */}
        <div className="absolute top-[-6px] left-0 w-full h-[12px] rounded-[100%] z-20 shadow-inner" style={{ backgroundColor: color, filter: 'brightness(1.3)' }}></div>
        {/* Body with linear gradient for 3D effect */}
        <div className="w-full h-full relative z-10" style={{ background: `linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.2) 100%), ${color}` }}></div>
        {/* Bottom Cap */}
        <div className="absolute bottom-[-6px] left-0 w-full h-[12px] rounded-[100%] z-0" style={{ backgroundColor: color, filter: 'brightness(0.7)' }}></div>
        
        {/* Tooltip */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-tikka-dark text-white text-xs py-1.5 px-3 rounded-lg shadow-xl transition-all duration-200 whitespace-nowrap z-30 font-black tracking-wider uppercase border border-white/20 ${active ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}`}>
          Cantidad: {value}
        </div>
      </div>
    </div>
  );
};

const VerticalBarChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-xs text-gray-400 py-4 text-center">Sin datos.</p>;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-thin">
      <div className="h-72 flex items-end justify-around gap-2 mt-4 px-4 bg-gray-50/50 rounded-xl border border-gray-100 py-6 min-w-max">
        {data.map((item, idx) => {
          const color = idx % 2 === 0 ? "#2D3380" : "#10B981"; // azul y verde
          return (
            <div key={idx} className="flex flex-col items-center h-full w-20 md:w-24 px-1 flex-shrink-0">
              <CylinderBar percent={(item.value / maxVal) * 100} color={color} value={item.value} />
              <span 
                className="text-[9px] md:text-[10px] text-tikka-dark mt-4 font-black text-center break-words w-full leading-tight min-h-[32px] flex items-center justify-center" 
                title={item.label}
              >
                {item.label}
              </span>
              <span className="text-[11px] font-black text-tikka-blue mt-1">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PieChart = ({ data }) => {
  if (data.length === 0)
    return <p className="text-xs text-gray-400 py-4 text-center">Sin datos.</p>;
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;
  const gradientString = data
    .map((item) => {
      const start = cumulativePercent;
      const percent = (item.value / total) * 100;
      cumulativePercent += percent;
      return `${item.color} ${start}% ${cumulativePercent}%`;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-6 mt-4 justify-center">
      <div
        className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex-shrink-0"
        style={{ background: `conic-gradient(${gradientString})` }}
      ></div>
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center text-xs">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-600 font-medium">{item.label}</span>
            <span className="ml-2 font-bold text-gray-800">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENTE MAPA DE COLOMBIA ---
const ColombiaMap = ({ data, activeFilter }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Tabla directa de mapeo: nombre GeoJSON → clave en los datos
  const geoToDataKey = {
    "AMAZONAS": "Amazonas",
    "ANTIOQUIA": "Antioquia",
    "ARAUCA": "Arauca",
    "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA": "San Andres y Providencia",
    "ATLANTICO": "Atlantico",
    "BOLIVAR": "Bolivar",
    "BOYACA": "Boyaca",
    "CALDAS": "Caldas",
    "CAQUETA": "Caqueta",
    "CASANARE": "Casanare",
    "CAUCA": "Cauca",
    "CESAR": "Cesar",
    "CHOCO": "Choco",
    "CORDOBA": "Cordoba",
    "CUNDINAMARCA": "Cundinamarca",
    "GUAINIA": "Guainia",
    "GUAVIARE": "Guaviare",
    "HUILA": "Huila",
    "LA GUAJIRA": "La Guajira",
    "MAGDALENA": "Magdalena",
    "META": "Meta",
    "NARIÑO": "Nariño",
    "NORTE DE SANTANDER": "Norte de Santander",
    "PUTUMAYO": "Putumayo",
    "QUINDIO": "Quindio",
    "RISARALDA": "Risaralda",
    "SANTAFE DE BOGOTA D.C": "Bogota",
    "SANTANDER": "Santander",
    "SUCRE": "Sucre",
    "TOLIMA": "Tolima",
    "VALLE DEL CAUCA": "Valle del Cauca",
    "VAUPES": "Vaupes",
    "VICHADA": "Vichada",
  };

  const handleMouseEnter = (geo, e) => {
    const geoName = geo.properties.NOMBRE_DPT;
    const dataKey = geoToDataKey[geoName];
    const count = dataKey ? (data[dataKey] || 0) : 0;
    const isActiveDepto = activeFilter && dataKey === activeFilter;

    // Mostrar tooltip si tiene datos O si es el departamento filtrado
    if (count > 0 || isActiveDepto) {
      setTooltipContent(`${geoName}: ${count} Actividades`);
    } else {
      setTooltipContent("");
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
        x: e.clientX - rect.left + 10,
        y: e.clientY - rect.top - 30
    });
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  return (
    <div 
      className="relative w-full h-96 bg-blue-50/30 rounded-lg flex items-center justify-center overflow-hidden border border-blue-100"
      onMouseMove={handleMouseMove}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1700,
          center: [-74, 4]
        }}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          <Geographies geography={colombiaGeo}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.NOMBRE_DPT; 
                const dataKey = geoToDataKey[geoName];
                const count = dataKey ? (data[dataKey] || 0) : 0;
                const isActiveDepto = activeFilter && dataKey === activeFilter;
                
                // Si hay filtro de depto activo: solo ese depto se colorea
                // Si NO hay filtro: todos los deptos con data se colorean
                const shouldColor = activeFilter ? isActiveDepto : (dataKey && data.hasOwnProperty(dataKey));
                
                let fillColor = "#e5e7eb"; // Gris (sin datos / no relevante)
                let hoverColor = "#d1d5db";
                
                if (shouldColor) {
                    if (count >= 20) {
                        fillColor = "#10b981"; // Verde
                        hoverColor = "#059669";
                    } else if (count > 0) {
                        fillColor = "#fcd34d"; // Amarillo
                        hoverColor = "#fbbf24";
                    } else {
                        fillColor = "#ef4444"; // Rojo (0 actividades)
                        hoverColor = "#dc2626";
                    }
                }

                return (
                  <Geography
                    key={geo.properties.DPTO || Math.random()} 
                    geography={geo}
                    onMouseEnter={(e) => handleMouseEnter(geo, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: fillColor,
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "all 250ms"
                      },
                      hover: {
                        fill: hoverColor,
                        stroke: "#FFFFFF",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: shouldColor ? "pointer" : "default"
                      },
                      pressed: {
                        fill: fillColor,
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* TOOLTIP - solo visible cuando hay contenido */}
      {tooltipContent && (
        <div
          className="absolute bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-xl pointer-events-none z-10 font-bold tracking-wide uppercase"
          style={{ top: tooltipPos.y, left: tooltipPos.x }}
        >
          {tooltipContent}
        </div>
      )}

      {/* LEYENDA */}
      <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-xl shadow-sm text-[10px] space-y-2 border border-gray-100 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#10b981] rounded-sm shadow-sm"></span>
              <span className="text-gray-600 font-bold">20+ SDS</span>
          </div>
          <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#fcd34d] rounded-sm shadow-sm"></span>
              <span className="text-gray-600 font-bold">1 - 19 SDS</span>
          </div>
          <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#ef4444] rounded-sm shadow-sm border border-gray-300"></span>
              <span className="text-gray-600 font-bold">0 SDS</span>
          </div>
          <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#e5e7eb] rounded-sm shadow-sm border border-gray-300"></span>
              <span className="text-gray-400 font-bold">Sin datos</span>
          </div>
      </div>
    </div>
  );
};

const DashboardModule = ({ sdsData }) => {
  const [filters, setFilters] = useState({
    sds: "",
    cliente: "",
    proveedor: "",
    estado: "",
    programa: "",
    tipoActividad: "",
    mes: "",
    año: "",
    departamento: "",
    ciudad: "",
  });
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const uniqueClients = [...new Set(sdsData.map((d) => d.Cliente))].sort();
  const uniqueProvs = [...new Set(sdsData.map((d) => d.Proveedor))].sort();
  const uniqueProgs = [...new Set(sdsData.map((d) => d.Programa))].sort();
  const uniqueTypes = [...new Set(sdsData.map((d) => d.TipoActividad))].sort();
  const uniqueDeptos = [...new Set(sdsData.map((d) => d.Departamento))].sort();
  
  const uniqueCities = useMemo(() => {
    const data = filters.departamento 
      ? sdsData.filter(d => d.Departamento === filters.departamento)
      : sdsData;
    return [...new Set(data.map((d) => d.Municipio))].sort();
  }, [sdsData, filters.departamento]);

  const uniqueYears = ["2024", "2025", "2026"];

  const resetFilters = () => setFilters({ sds: "", cliente: "", proveedor: "", estado: "", programa: "", tipoActividad: "", mes: "", año: "", departamento: "", ciudad: "" });
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const filteredData = useMemo(() => {
    return sdsData.filter((item) => {
      const dateParts = item.FechaProgramada.split("/");
      const itemMonth = months[parseInt(dateParts[1]) - 1];
      const itemYear = dateParts[2];

      return (
        (!filters.sds || String(item.SDS).includes(filters.sds)) &&
        (!filters.cliente || item.Cliente === filters.cliente) &&
        (!filters.proveedor || item.Proveedor === filters.proveedor) &&
        (!filters.estado || item.Estado === filters.estado) &&
        (!filters.programa || item.Programa === filters.programa) &&
        (!filters.tipoActividad || item.TipoActividad === filters.tipoActividad) &&
        (!filters.mes || itemMonth === filters.mes) &&
        (!filters.año || itemYear === filters.año) &&
        (!filters.departamento || item.Departamento === filters.departamento) &&
        (!filters.ciudad || item.Municipio === filters.ciudad)
      );
    });
  }, [sdsData, filters]);

  // --- LÓGICA GRÁFICOS ---
  const datosPorPrograma = Object.entries(
    filteredData.reduce((acc, curr) => {
      acc[curr.Programa] = (acc[curr.Programa] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const datosPorEstado = Object.entries(
    filteredData.reduce((acc, curr) => {
      acc[curr.Estado] = (acc[curr.Estado] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  const datosPorProveedor = Object.entries(
    filteredData.reduce((acc, curr) => {
      acc[curr.Proveedor] = (acc[curr.Proveedor] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 5);

  const datosPorCliente = Object.entries(
    filteredData.reduce((acc, curr) => {
      acc[curr.Cliente] = (acc[curr.Cliente] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 5);

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];
  const datosPorTipo = Object.entries(
    filteredData.reduce((acc, curr) => {
      acc[curr.TipoActividad] = (acc[curr.TipoActividad] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, value], idx) => ({
    label,
    value,
    color: colors[idx % colors.length],
  }));

  const totalSDS = filteredData.length;
  const totalValor = filteredData.reduce(
    (acc, curr) => acc + (curr.Total || 0),
    0
  );
  const pendientes = filteredData.filter(
    (d) => d.Estado === "Programada"
  ).length;

  // --- LÓGICA MAPA (Normalización de Departamentos) ---
  const getDepto = (municipio, item) => {
    if (item.Departamento) return item.Departamento;
    // Mapeo manual para asegurar que coincida con las llaves del mapa
    const map = {
      Medellín: "Antioquia",
      Bello: "Antioquia",
      Envigado: "Antioquia",
      Itagüí: "Antioquia",
      Sabaneta: "Antioquia",
      Girardota: "Antioquia",
      "Bogotá D.C.": "Bogota",
      Bogota: "Bogota",
      Bogotá: "Bogota",
      Cajicá: "Cundinamarca",
      Soacha: "Cundinamarca",
      Cota: "Cundinamarca",
      Fontibón: "Cundinamarca",
      Facatativá: "Cundinamarca",
      Mosquera: "Cundinamarca",
      Madrid: "Cundinamarca",
      Funza: "Cundinamarca",
      Manizales: "Caldas",
      Chinchina: "Caldas",
      Villamaría: "Caldas",
      Pereira: "Risaralda",
      Dosquebradas: "Risaralda",
      Cali: "Valle del Cauca",
      Palmira: "Valle del Cauca",
      Yumbo: "Valle del Cauca",
    };
    return map[municipio] || item.Departamento || "Otro";
  };
  const conteoPorDepartamento = filteredData.reduce((acc, curr) => {
    const depto = getDepto(curr.Municipio, curr);
    if (depto && depto !== "Otro") {
      acc[depto] = (acc[depto] || 0) + 1;
    }
    return acc;
  }, {});

  const exportToPDF = () => {
    const input = document.getElementById('dashboard-charts-content');
    if (!input) {
      alert("Error: No se pudo capturar el contenido del dashboard.");
      return;
    }
    
    html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      
      if (window.Capacitor) {
        setPdfPreviewUrl(imgData);
      } else {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Dashboard_Report_${new Date().getTime()}.pdf`);
      }
    }).catch(err => {
      console.error("PDF Export Error:", err);
      alert("Error al generar PDF.");
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-xl font-bold text-tikka-dark border-b pb-2">
        Tableros de Control
      </h2>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-3">
        <FilterInput
          label="Servicio"
          value={filters.sds}
          onChange={(v) => setFilters({ ...filters, sds: v })}
        />
        <FilterInput
          label="Depto."
          value={filters.departamento}
          onChange={(v) => setFilters({ ...filters, departamento: v, ciudad: "" })}
          options={uniqueDeptos}
        />
        <FilterInput
          label="Ciudad"
          value={filters.ciudad}
          onChange={(v) => setFilters({ ...filters, ciudad: v })}
          options={uniqueCities}
        />
        <FilterInput
          label="Cliente"
          value={filters.cliente}
          onChange={(v) => setFilters({ ...filters, cliente: v })}
          options={uniqueClients}
        />
        <FilterInput
          label="Proveedor"
          value={filters.proveedor}
          onChange={(v) => setFilters({ ...filters, proveedor: v })}
          options={uniqueProvs}
        />
        <FilterInput
          label="Estado"
          value={filters.estado}
          onChange={(v) => setFilters({ ...filters, estado: v })}
          options={["Programada", "Concluida", "Aprobada", "Cancelada"]}
        />
        <FilterInput
          label="Programa"
          value={filters.programa}
          onChange={(v) => setFilters({ ...filters, programa: v })}
          options={uniqueProgs}
        />
        <FilterInput
          label="Tipo Act."
          value={filters.tipoActividad}
          onChange={(v) => setFilters({ ...filters, tipoActividad: v })}
          options={uniqueTypes}
        />
        <FilterInput
          label="Mes"
          value={filters.mes}
          onChange={(v) => setFilters({ ...filters, mes: v })}
          options={months}
        />
        <FilterInput
          label="Año"
          value={filters.año}
          onChange={(v) => setFilters({ ...filters, año: v })}
          options={uniqueYears}
        />
        <button
          onClick={resetFilters}
          className="p-2 tikka-gradient-btn text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg col-span-2 md:col-span-1"
          title="Restablecer filtros"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Limpiar
        </button>
        <button
          onClick={exportToPDF}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg col-span-2 md:col-span-1"
          title="Exportar a PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
        </button>
      </div>
      <div id="dashboard-charts-content" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 uppercase font-bold">
            Total Servicios
          </p>
          <p className="text-3xl font-bold text-tikka-dark">{totalSDS}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 uppercase font-bold">
            Valor Total
          </p>
          <p className="text-3xl font-bold text-green-700">
            ${totalValor.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <p className="text-sm text-gray-500 uppercase font-bold">
            Pendientes
          </p>
          <p className="text-3xl font-bold text-orange-700">{pendientes}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
            Top 5 Programas
          </h3>
          <SimpleBarChart data={datosPorPrograma} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
            Servicios por Estado
          </h3>
          <VerticalBarChart data={datosPorEstado} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
            Servicios por Proveedor
          </h3>
          <VerticalBarChart data={datosPorProveedor} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
            Servicios por Cliente
          </h3>
          <VerticalBarChart data={datosPorCliente} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
            Distribución por Tipo de Actividad
          </h3>
          <PieChart data={datosPorTipo} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-700 mb-4 w-full text-left border-b pb-2">
            Cobertura Geográfica
          </h3>
          <ColombiaMap data={conteoPorDepartamento} activeFilter={filters.departamento} />
        </div>
      </div>
      </div>

      {pdfPreviewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-tikka-blue text-base uppercase">Reporte Generado</h3>
              <button 
                onClick={() => setPdfPreviewUrl(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Para compartirlo o guardarlo en su celular, puede tomar una captura de pantalla o mantener presionada la imagen para guardarla.
            </p>
            <div className="overflow-y-auto border border-gray-100 rounded-xl bg-gray-50 flex-1 flex items-center justify-center p-2">
              <img 
                src={pdfPreviewUrl} 
                alt="Reporte Generado" 
                className="max-w-full max-h-[60vh] object-contain shadow-md rounded"
              />
            </div>
            <button
              onClick={() => setPdfPreviewUrl(null)}
              className="w-full py-3 bg-tikka-blue text-white rounded-xl font-bold uppercase text-xs tracking-widest"
            >
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MÓDULO GESTIÓN DE ACTAS ---
const GestionActasModule = ({ sdsData, onNavigate }) => {
  const [expandedSection, setExpandedSection] = useState("pending");

  const pendingOrders = sdsData.filter((item) => item.Estado === "Programada");
  const visitedOrders = sdsData.filter((item) => item.Estado !== "Programada");

  const toggleSection = (section) =>
    setExpandedSection(expandedSection === section ? null : section);

  const handleSelect = (item) => {
    if (item.Estado === "Programada") {
      onNavigate("actaForm", item);
    } else {
      onNavigate("actaDetails", item);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <h2 className="text-xl font-bold text-tikka-dark border-b pb-2">
        Gestión de Actas
      </h2>
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
            No hay Servicios pendientes.
          </p>
        )}
      </AccordionSection>

      <AccordionSection
        title="Servicios Ejecutados / Histórico"
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
            Sin historial reciente.
          </p>
        )}
      </AccordionSection>
    </div>
  );
};

const CrearAsesorModule = ({ asesores, setAsesores, showModal }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    identificacion: "",
    telefono: "",
    email: "",
    empresa: "",
    cargo: "Asesor de Prevención",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.nombre ||
      !formData.identificacion ||
      !formData.telefono ||
      !formData.email ||
      !formData.empresa
    ) {
      showModal("Error", "Todos los campos son obligatorios.");
      return;
    }

    const newAsesor = { ...formData, id: Date.now() };
    setAsesores([...asesores, newAsesor]);
    showModal("Éxito", "Asesor creado correctamente.");
    setFormData({
      nombre: "",
      identificacion: "",
      telefono: "",
      email: "",
      empresa: "",
      cargo: "Asesor",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-tikka-dark border-b pb-2">
        Crear Asesor
      </h2>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nombres y Apellidos
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-tikka-green outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              No. Identificación
            </label>
            <input
              type="number"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-tikka-green outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-tikka-green outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-tikka-green outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Empresa
            </label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-tikka-green outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              name="cargo"
              value="Asesor"
              disabled
              className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-tikka-green text-white rounded-lg font-bold hover:bg-[#009670] shadow-md transition-transform active:scale-95"
            >
              Crear Asesor
            </button>
          </div>
        </form>
        <div className="mt-8 border-t pt-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">
            Asesores Existentes ({asesores.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {asesores.map((a) => (
              <div
                key={a.id}
                className="text-xs p-3 bg-gray-50 rounded border flex justify-between"
              >
                <span className="font-bold text-gray-700">{a.nombre}</span>
                <span className="text-gray-500">{a.empresa}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AsignarSDSModule = ({ sdsData, asesores, onSaveAssignments }) => {
  const [filters, setFilters] = useState({
    sds: "",
    cliente: "",
    proveedor: "",
    estado: "",
    programa: "",
    tipoActividad: "",
    departamento: "",
    ciudad: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState({});
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAsesorId, setBulkAsesorId] = useState("");

  const uniqueClients = [...new Set(sdsData.map((d) => d.Cliente))].sort();
  const uniqueProvs = [...new Set(sdsData.map((d) => d.Proveedor))].sort();
  const uniqueProgs = [...new Set(sdsData.map((d) => d.Programa))].sort();
  const uniqueTypes = [...new Set(sdsData.map((d) => d.TipoActividad))].sort();
  const uniqueDeptos = [...new Set(sdsData.map((d) => d.Departamento))].sort();

  const uniqueCities = useMemo(() => {
    const data = filters.departamento
      ? sdsData.filter(d => d.Departamento === filters.departamento)
      : sdsData;
    return [...new Set(data.map((d) => d.Municipio))].sort();
  }, [sdsData, filters.departamento]);

  const filteredData = sdsData.filter((item) => {
    const isProgramada = item.Estado === "Programada";
    const matchesFilters =
      (!filters.sds || String(item.SDS).includes(filters.sds)) &&
      (!filters.cliente || item.Cliente === filters.cliente) &&
      (!filters.proveedor || item.Proveedor === filters.proveedor) &&
      (!filters.estado || item.Estado === filters.estado) &&
      (!filters.programa || item.Programa === filters.programa) &&
      (!filters.tipoActividad || item.TipoActividad === filters.tipoActividad) &&
      (!filters.ciudad || item.Municipio === filters.ciudad);
    return isProgramada && matchesFilters;
  });

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id))
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    else setSelectedRows([...selectedRows, id]);
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(filteredData.map((item) => item.SDS));
    else setSelectedRows([]);
  };
  const handleIndividualChange = (sdsId, asesorId) => {
    setPendingAssignments((prev) => ({ ...prev, [sdsId]: asesorId }));
  };
  const applyBulkAssignment = () => {
    if (!bulkAsesorId) return;
    const newAssignments = { ...pendingAssignments };
    selectedRows.forEach((sdsId) => {
      newAssignments[sdsId] = bulkAsesorId;
    });
    setPendingAssignments(newAssignments);
    setShowBulkModal(false);
    setBulkAsesorId("");
  };
  const handleCancel = () => {
    setPendingAssignments({});
    setSelectedRows([]);
  };
  const handleSave = () => {
    onSaveAssignments(pendingAssignments);
    setPendingAssignments({});
    setSelectedRows([]);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-24 relative">
      <h2 className="text-xl font-bold text-tikka-dark border-b pb-2">
        Asignar Servicio
      </h2>
      <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <FilterInput
          label="Servicio"
          value={filters.sds}
          onChange={(v) => setFilters({ ...filters, sds: v })}
        />
        <FilterInput
          label="Cliente"
          value={filters.cliente}
          onChange={(v) => setFilters({ ...filters, cliente: v })}
          options={uniqueClients}
        />
        <FilterInput
          label="Proveedor"
          value={filters.proveedor}
          onChange={(v) => setFilters({ ...filters, proveedor: v })}
          options={uniqueProvs}
        />
        <FilterInput
          label="Estado"
          value={filters.estado}
          onChange={(v) => setFilters({ ...filters, estado: v })}
          options={["Programada"]}
        />
        <FilterInput
          label="Programa"
          value={filters.programa}
          onChange={(v) => setFilters({ ...filters, programa: v })}
          options={uniqueProgs}
        />
        <FilterInput
          label="Tipo Act."
          value={filters.tipoActividad}
          onChange={(v) => setFilters({ ...filters, tipoActividad: v })}
          options={uniqueTypes}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
          <p className="text-sm text-yellow-800 font-bold">
            ⚠ Servicios Disponibles ({filteredData.length}) | Seleccionados:{" "}
            {selectedRows.length}
          </p>
          <button
            onClick={() => selectedRows.length > 0 && setShowBulkModal(true)}
            className={`text-xs px-3 py-1 rounded border font-bold transition-colors ${
              selectedRows.length > 0
                ? "bg-white border-yellow-300 hover:bg-yellow-100 text-yellow-800 cursor-pointer"
                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            }`}
          >
            Asignación Múltiple
          </button>
          {showBulkModal && (
            <div className="absolute top-12 right-4 bg-white shadow-xl border border-gray-200 p-4 rounded-lg z-20 w-64">
              <h4 className="text-xs font-bold text-gray-700 mb-2">
                Asignar {selectedRows.length} Servicios a:
              </h4>
              <select
                className="w-full p-2 border border-gray-300 rounded text-xs mb-3"
                value={bulkAsesorId}
                onChange={(e) => setBulkAsesorId(e.target.value)}
              >
                <option value="">Seleccionar Asesor...</option>
                {asesores.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyBulkAssignment}
                  className="flex-1 py-1 bg-tikka-green text-white text-xs rounded hover:bg-tikka-gradient"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="overflow-x-auto max-h-[450px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedRows.length === filteredData.length &&
                      filteredData.length > 0
                    }
                  />
                </th>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Ciudad</th>
                <th className="px-4 py-3">Actividad</th>
                <th className="px-4 py-3 text-center">Acción (Asignar a)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr
                  key={item.SDS}
                  className={`border-b hover:bg-gray-50 ${
                    selectedRows.includes(item.SDS) ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.SDS)}
                      onChange={() => handleSelectRow(item.SDS)}
                    />
                  </td>
                  <td className="px-4 py-3 font-bold text-tikka-dark">
                    {item.SDS}
                  </td>
                  <td className="px-4 py-3">{item.Cliente}</td>
                  <td className="px-4 py-3">{item.Proveedor}</td>
                  <td className="px-4 py-3">{item.Municipio}</td>
                  <td
                    className="px-4 py-3 truncate max-w-[200px]"
                    title={item.Actividad}
                  >
                    {item.Actividad}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      className={`p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-green-500 w-48 ${
                        pendingAssignments[item.SDS]
                          ? "border-green-500 bg-green-50 text-tikka-green font-bold"
                          : "border-gray-300 bg-white"
                      }`}
                      value={pendingAssignments[item.SDS] || ""}
                      onChange={(e) =>
                        handleIndividualChange(item.SDS, e.target.value)
                      }
                    >
                      <option value="">Seleccionar Asesor</option>
                      {asesores.map((asesor) => (
                        <option key={asesor.id} value={asesor.id}>
                          {asesor.nombre} - {asesor.empresa}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {Object.keys(pendingAssignments).length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex gap-3 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 animate-slide-up">
          <div className="flex flex-col justify-center mr-2">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Cambios pendientes
            </span>
            <span className="text-sm font-bold text-tikka-dark">
              {Object.keys(pendingAssignments).length} Asignaciones
            </span>
          </div>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-tikka-green text-white font-bold rounded-lg hover:bg-tikka-gradient shadow-lg transition-transform active:scale-95"
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

const ListadoSdsModule = ({ sdsData }) => {
  const [excelPreviewCsv, setExcelPreviewCsv] = useState(null);
  const [copied, setCopied] = useState(false);
  const [filters, setFilters] = useState({
    sds: "",
    cliente: "",
    proveedor: "",
    estado: "",
    programa: "",
    tipoActividad: "",
    departamento: "",
    municipio: "",
  });

  const uniqueClients = useMemo(
    () => [...new Set(sdsData.map((d) => d.Cliente).filter(Boolean))].sort(),
    [sdsData]
  );
  const uniqueProvs = useMemo(
    () => [...new Set(sdsData.map((d) => d.Proveedor).filter(Boolean))].sort(),
    [sdsData]
  );
  const uniqueEstados = useMemo(
    () => [...new Set(sdsData.map((d) => d.Estado).filter(Boolean))].sort(),
    [sdsData]
  );
  const uniqueProgs = useMemo(
    () => [...new Set(sdsData.map((d) => d.Programa).filter(Boolean))].sort(),
    [sdsData]
  );
  const uniqueTypes = useMemo(
    () => [...new Set(sdsData.map((d) => d.TipoActividad).filter(Boolean))].sort(),
    [sdsData]
  );
  const uniqueDeptos = useMemo(
    () => [...new Set(sdsData.map((d) => d.Departamento).filter(Boolean))].sort(),
    [sdsData]
  );
  const uniqueMunicipios = useMemo(() => {
    const base = filters.departamento
      ? sdsData.filter((d) => d.Departamento === filters.departamento)
      : sdsData;
    return [...new Set(base.map((d) => d.Municipio).filter(Boolean))].sort();
  }, [sdsData, filters.departamento]);

  const resetFilters = () =>
    setFilters({
      sds: "",
      cliente: "",
      proveedor: "",
      estado: "",
      programa: "",
      tipoActividad: "",
      departamento: "",
      municipio: "",
    });

  const filteredData = useMemo(() => {
    return sdsData.filter((item) => {
      return (
        (!filters.sds || String(item.SDS).includes(filters.sds)) &&
        (!filters.cliente || item.Cliente === filters.cliente) &&
        (!filters.proveedor || item.Proveedor === filters.proveedor) &&
        (!filters.estado || item.Estado === filters.estado) &&
        (!filters.programa || item.Programa === filters.programa) &&
        (!filters.tipoActividad || item.TipoActividad === filters.tipoActividad) &&
        (!filters.departamento || item.Departamento === filters.departamento) &&
        (!filters.municipio || item.Municipio === filters.municipio)
      );
    });
  }, [sdsData, filters]);

  // Columnas iguales a las requeridas por el módulo "Cargar Excel a B.D."
  const columns = [
    { header: "Servicio", key: "SDS" },
    { header: "TipoEjecución", key: "TipoEjecucion" },
    { header: "Cliente", key: "Cliente" },
    { header: "Póliza", key: "Poliza" },
    { header: "Proveedor", key: "Proveedor" },
    { header: "Nit Proveedor", key: "NitProveedor" },
    { header: "Estado", key: "Estado" },
    { header: "Programa", key: "Programa" },
    { header: "TipoActividad", key: "TipoActividad" },
    { header: "Actividad", key: "Actividad" },
    { header: "FechaCreación", key: "FechaCreacion" },
    { header: "FechaPlan", key: "FechaProgramada" },
    { header: "FechaProgramación", key: "FechaProgramada" },
    { header: "Departamento", key: "Departamento" },
    { header: "Municipio", key: "Municipio" },
  ];

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert("No hay datos para exportar con los filtros aplicados.");
      return;
    }

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (/[",;\n\r]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const headerLine = columns.map((c) => escapeCsv(c.header)).join(";");
    const rows = filteredData.map((item) =>
      columns.map((c) => escapeCsv(item[c.key])).join(";")
    );
    // BOM UTF-8 para que Excel respete tildes/eñes
    const csv = "\uFEFF" + [headerLine, ...rows].join("\r\n");

    if (window.Capacitor) {
      setExcelPreviewCsv(csv);
      setCopied(false);
    } else {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ts = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      link.href = url;
      link.download = `Listado_Actas_${ts}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b pb-2">
        <h2 className="text-xl font-bold text-tikka-dark">Listado de Actas</h2>
        <button
          onClick={exportToExcel}
          style={{ backgroundColor: "#107C41", color: "#ffffff" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-transform active:scale-95 hover:brightness-110"
          title="Exporta las SDS filtradas a un archivo compatible con Excel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0 0l-4-4m4 4l4-4M20 8l-6-6H6a2 2 0 00-2 2v6" />
          </svg>
          Exportar en Excel
        </button>
      </div>

      {/* Sección de filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
            Filtros
          </h3>
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-tikka-blue hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <FilterInput
            label="Servicio"
            value={filters.sds}
            onChange={(v) => setFilters({ ...filters, sds: v })}
          />
          <FilterInput
            label="Cliente"
            value={filters.cliente}
            onChange={(v) => setFilters({ ...filters, cliente: v })}
            options={uniqueClients}
          />
          <FilterInput
            label="Proveedor"
            value={filters.proveedor}
            onChange={(v) => setFilters({ ...filters, proveedor: v })}
            options={uniqueProvs}
          />
          <FilterInput
            label="Estado"
            value={filters.estado}
            onChange={(v) => setFilters({ ...filters, estado: v })}
            options={uniqueEstados}
          />
          <FilterInput
            label="Programa"
            value={filters.programa}
            onChange={(v) => setFilters({ ...filters, programa: v })}
            options={uniqueProgs}
          />
          <FilterInput
            label="Tipo Actividad"
            value={filters.tipoActividad}
            onChange={(v) => setFilters({ ...filters, tipoActividad: v })}
            options={uniqueTypes}
          />
          <FilterInput
            label="Departamento"
            value={filters.departamento}
            onChange={(v) =>
              setFilters({ ...filters, departamento: v, municipio: "" })
            }
            options={uniqueDeptos}
          />
          <FilterInput
            label="Municipio"
            value={filters.municipio}
            onChange={(v) => setFilters({ ...filters, municipio: v })}
            options={uniqueMunicipios}
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Mostrando{" "}
          <span className="font-bold text-tikka-dark">
            {filteredData.length}
          </span>{" "}
          de <span className="font-bold text-tikka-dark">{sdsData.length}</span>{" "}
          servicios
        </span>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.header}
                    className="px-3 py-2 text-left font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b border-gray-200"
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-10 text-center text-gray-400"
                  >
                    No se encontraron servicios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={`${item.SDS}-${idx}`}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {columns.map((c) => (
                      <td
                        key={c.header}
                        className="px-3 py-2 text-gray-700 whitespace-nowrap border-b border-gray-100"
                      >
                        {item[c.key] !== undefined && item[c.key] !== null
                          ? String(item[c.key])
                          : ""}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {excelPreviewCsv && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-tikka-dark text-base uppercase">Excel Exportado (CSV)</h3>
              </div>
              <button 
                onClick={() => setExcelPreviewCsv(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 leading-relaxed flex gap-2">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                Los navegadores móviles bloquean las descargas de archivos locales directas. 
                Use el botón de abajo para <strong>Copiar todos los datos</strong> e importarlos en su app de Excel, Google Sheets, Numbers o Notas en su celular de inmediato.
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col gap-1 border border-gray-100 rounded-xl bg-gray-50 p-2">
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold px-1 mb-1">
                <span>VISTA PREVIA DE LOS DATOS ({filteredData.length} FILAS)</span>
                <span>DELIMITADOR: PUNTO Y COMA (;)</span>
              </div>
              <textarea 
                readOnly
                value={excelPreviewCsv} 
                className="w-full flex-1 p-3 bg-white border border-gray-200 rounded-lg font-mono text-[9px] text-gray-600 resize-none focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(excelPreviewCsv);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 3000);
                }}
                className={`w-full py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${copied ? 'bg-green-600 text-white' : 'bg-tikka-green text-white hover:bg-tikka-gradient active:scale-95'}`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Copiado al Portapapeles!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Copiar Datos a Excel
                  </>
                )}
              </button>
              
              <button
                onClick={() => setExcelPreviewCsv(null)}
                className="w-full py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs uppercase hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const CargarExcelModule = ({ onResetData, showModal }) => {
  const fileInputRef = useRef(null);
  const handleButtonClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file)
      alert(
        `Archivo seleccionado: ${file.name}. \n\nNota: El sistema valida que el archivo no supere los 500MB y contenga las columnas requeridas (SDS, Cliente, Póliza...).`
      );
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "¿Está seguro de restablecer la base de datos a las 475 órdenes originales? Se perderán los cambios introducidos por cargas de Excel posteriores."
    );
    if (!confirmed) return;
    if (typeof onResetData === "function") {
      onResetData();
    } else if (showModal) {
      showModal("Error", "No se pudo restablecer la base de datos.");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b pb-2">
        <h2 className="text-xl font-bold text-tikka-dark">
          Cargar Excel a Base de Datos
        </h2>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-red-700 transition-transform active:scale-95"
          title="Restablece la base de datos a las 475 órdenes originales"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Restablecer Base de Datos (475 órdenes)
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div
          onClick={handleButtonClick}
          className="w-full max-w-2xl border-4 border-dashed border-gray-300 rounded-3xl bg-gray-50 p-12 text-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group"
        >
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 group-hover:text-blue-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2 group-hover:text-blue-700">
            Arrastra tu archivo Excel aquí
          </h3>
          <p className="text-gray-500 mb-6">
            o haz clic para seleccionar desde tu ordenador
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .csv"
            onChange={handleFileChange}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-transform transform active:scale-95"
          >
            Seleccionar Archivo
          </button>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>Formatos soportados: .xlsx, .csv</p>
            <p className="font-bold text-tikka-blue">
              Tamaño máximo permitido: 500 MB
            </p>
          </div>
        </div>
        <div className="mt-8 w-full max-w-2xl bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
          <svg
            className="w-6 h-6 text-tikka-blue mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h4 className="font-bold text-tikka-dark text-sm">
              Instrucciones Obligatorias
            </h4>
            <p className="text-xs text-tikka-blue mt-1">
              El archivo debe contener obligatoriamente las columnas:{" "}
              <span className="font-bold">
                SDS, TipoEjecución, Cliente, Póliza, Proveedor, Nit Proveedor,
                Estado, Programa, TipoActividad, Actividad, FechaCreación,
                FechaPlan, FechaProgramación.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MÓDULO GESTIÓN DE USUARIOS ---
const UsuariosModule = ({ showModal, currentUser }) => {
  const isAdmin = currentUser?.role === "Administrador del sistema";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState({});
  const apiBase = window.Capacitor ? "https://tikka-gestion-pyp.vercel.app" : "";

  // --- ESTADOS Y MANEJADORES DE EDICIÓN ---
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    identificacion: "",
    telefono: "",
    role: "",
  });

  const handleStartEdit = (u) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || "",
      email: u.email || "",
      identificacion: u.identificacion || "",
      telefono: u.telefono || "",
      role: u.role || "",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email || !editForm.identificacion || !editForm.role) {
      showModal("Atención", "Por favor complete todos los campos requeridos.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        showModal("Éxito", "Información de usuario actualizada correctamente.");
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await response.json().catch(() => ({}));
        showModal("Error", data.error || "No se pudo actualizar el usuario.");
      }
    } catch (err) {
      console.error(err);
      showModal("Error", "Error de conexión al actualizar el usuario.");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiBase}/api/users`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (userId, role) => {
    setSelectedRoles({ ...selectedRoles, [userId]: role });
  };

  const approveUser = async (userId) => {
    const role = selectedRoles[userId];
    if (!role) {
      showModal("Error", "Por favor seleccione un rol para el usuario.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      if (response.ok) {
        showModal("Éxito", "Usuario aprobado correctamente.");
        fetchUsers();
      } else {
        showModal("Error", "No se pudo aprobar el usuario.");
      }
    } catch (err) {
      console.error(err);
      showModal("Error", "Error de conexión.");
    }
  };

  const savePermissions = async (userId) => {
    if (!isAdmin) {
      showModal("Acceso denegado", "Solo el administrador puede otorgar permisos.");
      return;
    }
    const role = selectedRoles[userId];
    if (!role) {
      showModal("Atención", "Seleccione un rol antes de guardar los permisos.");
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        const targetUser = users.find((u) => u.id === userId);
        const emailDest = data.email || targetUser?.email || "su correo registrado";
        showModal(
          "Permisos guardados",
          `Los permisos se guardaron correctamente. Se envió un mensaje a ${emailDest} notificando al usuario que ya tiene permisos para acceder al sistema.`
        );
        fetchUsers();
      } else {
        showModal("Error", data.error || "No se pudieron guardar los permisos.");
      }
    } catch (err) {
      console.error(err);
      showModal("Error", "Error de conexión al guardar permisos.");
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!isAdmin) {
      showModal("Acceso denegado", "Solo el administrador puede eliminar usuarios.");
      return;
    }
    if (currentUser && currentUser.id === userId) {
      showModal("Acción no permitida", "No puede eliminar su propia cuenta.");
      return;
    }
    const confirmed = window.confirm(
      `¿Está seguro de eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${apiBase}/api/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        showModal("Éxito", data.message || "Usuario eliminado correctamente.");
        fetchUsers();
      } else {
        showModal("Error", data.error || "No se pudo eliminar el usuario.");
      }
    } catch (err) {
      console.error(err);
      showModal("Error", "Error de conexión al eliminar el usuario.");
    }
  };

  const pendingUsers = users.filter((u) => u.approved === 0);
  const activeUsers = users.filter((u) => u.approved === 1);

  const roles = [
    "Administrador del sistema",
    "Lider",
    "Asesor",
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-xl font-bold text-tikka-dark border-b pb-2">
        Gestión de Usuarios y Permisos
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
          Usuarios Pendientes de Aprobación ({pendingUsers.length})
        </h3>

        {loading ? (
          <p className="text-center py-10 text-gray-400">Cargando usuarios...</p>
        ) : pendingUsers.length === 0 ? (
          <p className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No hay solicitudes pendientes.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 border rounded-xl bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md"
              >
                <div className="flex-1">
                  <p className="font-bold text-tikka-dark">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email} | ID: {u.identificacion}</p>
                  <p className="text-xs font-medium text-tikka-blue mt-1 uppercase tracking-wider">
                    Rol solicitado: {u.role}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Asignar Rol:</p>
                  <div className="flex flex-wrap gap-3">
                    {roles.map((r) => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`role-${u.id}`}
                          value={r}
                          checked={selectedRoles[u.id] === r}
                          onChange={() => handleRoleChange(u.id, r)}
                          className="w-4 h-4 text-tikka-green border-gray-300 focus:ring-tikka-green"
                        />
                        <span className={`text-xs ${selectedRoles[u.id] === r ? "text-tikka-green font-bold" : "text-gray-600"}`}>
                          {r}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => approveUser(u.id)}
                    style={{ backgroundColor: "#00BFA5", color: "#ffffff" }}
                    className="px-6 py-2 rounded-lg font-bold text-xs shadow-sm transition-transform active:scale-95 hover:brightness-95"
                  >
                    Aprobar
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                      className="px-6 py-2 rounded-lg font-bold text-xs shadow-sm transition-transform active:scale-95 hover:brightness-95"
                    >
                      Eliminar
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => savePermissions(u.id)}
                      style={{ backgroundColor: "#2D3380", color: "#ffffff" }}
                      className="px-6 py-2 rounded-lg font-bold text-xs shadow-sm transition-transform active:scale-95 hover:brightness-110"
                      title="Guarda los permisos seleccionados y notifica al usuario por correo"
                    >
                      Guardar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-4">Usuarios Activos ({activeUsers.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeUsers.map((u) => {
            const isSelf = currentUser && currentUser.id === u.id;
            return (
              <div key={u.id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{u.name}</p>
                  <p className="text-[10px] font-bold text-tikka-green uppercase">{u.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <button
                      onClick={() => handleStartEdit(u)}
                      className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Editar usuario"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  {isAdmin && !isSelf && (
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      className="flex-shrink-0 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Eliminar usuario"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg border-t-8 border-tikka-blue animate-fade-in">
            <h3 className="text-xl font-bold text-tikka-dark mb-4 uppercase tracking-tight">Editar Información de Usuario</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tikka-green focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tikka-green focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Identificación</label>
                <input
                  type="text"
                  value={editForm.identificacion}
                  onChange={(e) => setEditForm({ ...editForm, identificacion: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tikka-green focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Teléfono</label>
                <input
                  type="text"
                  value={editForm.telefono}
                  onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tikka-green focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Rol de Usuario</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-tikka-green focus:border-transparent text-sm"
                  required
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white rounded-lg font-bold text-xs uppercase shadow-md transition-all active:scale-95 hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #2D3380 0%, #00BFA5 100%)" }}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENTE PRINCIPAL
const DirectorDashboard = ({
  onLogout,
  user,
  sdsData,
  onNavigate,
  initialModule,
  asesores,
  setAsesores,
  showModal,
  onSaveAssignments,
  onResetData,
  currentUser,
}) => {
  const [activeModule, setActiveModule] = useState(initialModule || "tableros");

  useEffect(() => {
    if (initialModule) setActiveModule(initialModule);
  }, [initialModule]);

  const menuItems = [
    { id: "tableros", label: "Tableros de Control", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg> },
    { id: "usuarios", label: "Aprobar Usuarios", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> },
    { id: "gestion", label: "Gestión de Actas", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> },
    { id: "listadoSds", label: "Listado de Actas", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 6h18M3 14h18M3 18h18"></path></svg> },
    { id: "crearAsesor", label: "Crear Asesor Prevención", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg> },
    { id: "asignar", label: "Asignar Servicio", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> },
    { id: "cargar", label: "Cargar Excel a B.D.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> },
  ];

  const renderContent = () => {
    switch (activeModule) {
      case "tableros":
        return <DashboardModule sdsData={sdsData} />;
      case "usuarios":
        return <UsuariosModule showModal={showModal} currentUser={currentUser || user} />;
      case "gestion":
        return <GestionActasModule sdsData={sdsData} onNavigate={onNavigate} />;
      case "listadoSds":
        return <ListadoSdsModule sdsData={sdsData} />;
      case "crearAsesor":
        return (
          <CrearAsesorModule
            asesores={asesores}
            setAsesores={setAsesores}
            showModal={showModal}
          />
        );
      case "asignar":
        return (
          <AsignarSDSModule
            sdsData={sdsData}
            asesores={asesores}
            onSaveAssignments={onSaveAssignments}
          />
        );
      case "cargar":
        return <CargarExcelModule onResetData={onResetData} showModal={showModal} />;
      default:
        return <DashboardModule sdsData={sdsData} />;
    }
  };

  return (
    <AppLayout title="Director de Prevención" onNavigate={null}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-gray-50">
        <aside className="w-full md:w-64 flex-shrink-0 shadow-2xl border-b md:border-r md:border-b-0 border-white/10" style={{ background: 'linear-gradient(135deg, #2D3380 0%, #00BFA5 100%)' }}>
          <div className="hidden md:block p-8 border-b border-white/10">
            <div className="flex items-center gap-4 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-xl shadow-inner border border-white/20">
                {user?.name?.charAt(0) || "D"}
              </div>
              <div>
                <p className="text-sm font-black text-white tracking-tight">
                  {user?.name || "Director"}
                </p>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-2 h-2 bg-tikka-green rounded-full animate-pulse"></span> En línea
                </p>
              </div>
            </div>
          </div>
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible p-3 md:p-4 gap-2 md:gap-0 md:space-y-3 scrollbar-none">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-4 px-4 py-2.5 md:px-5 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-left transition-all duration-300 ${
                  activeModule === item.id
                    ? "bg-white text-tikka-blue shadow-2xl scale-105 border-b-2 md:border-b-0 md:border-r-4 border-tikka-green"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
            <button
              onClick={onLogout}
              className="md:hidden flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-xl text-xs font-black hover:bg-red-500/20 hover:text-red-100 transition-all border border-white/10"
            >
              <span>🚪</span> Salir
            </button>
          </nav>
          <div className="hidden md:block p-6 mt-auto border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white/10 text-white rounded-2xl text-xs font-black hover:bg-red-500/20 hover:text-red-100 transition-all border border-white/10"
            >
              <span>🚪</span> CERRAR SESIÓN
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[calc(100vh-80px)]">
          {renderContent()}
        </main>
      </div>
    </AppLayout>
  );
};

export default DirectorDashboard;

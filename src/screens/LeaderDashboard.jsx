import React, { useState, useMemo, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AppLayout from "../components/AppLayout";

// --- COMPONENTES VISUALES ---

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
                ? `ACTA DE SDS #${item.ParentSDS}`
                : `SDS #${item.SDS}`}
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

// --- GRÁFICOS ---
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

// --- MÓDULOS DE FUNCIONALIDAD ---
const DashboardModule = ({ sdsData }) => {
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

  const resetFilters = () => setFilters({ sds: "", cliente: "", proveedor: "", estado: "", programa: "", tipoActividad: "", departamento: "", ciudad: "" });

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
        (!filters.ciudad || item.Municipio === filters.ciudad)
      );
    });
  }, [sdsData, filters]);

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

  const exportToPDF = () => {
    const input = document.getElementById('leader-dashboard-charts');
    if (!input) return;
    html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      if (window.Capacitor) {
        setPdfPreviewUrl(imgData);
      } else {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Leader_Dashboard_${new Date().getTime()}.pdf`);
      }
    }).catch(err => {
      console.error("PDF Export Error:", err);
      alert("Error al generar PDF.");
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-xl font-bold text-tikka-dark border-b pb-2">
        Tableros de Control - Líder
      </h2>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <FilterInput
          label="SDS"
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
          options={["Programada", "Concluida", "Aprobada"]}
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
          title="Exportar PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
        </button>
      </div>
      <div id="leader-dashboard-charts" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 uppercase font-bold">
            Total Órdenes
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
            SDS por Estado
          </h3>
          <VerticalBarChart data={datosPorEstado} />
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
          <div className="w-full h-64 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden relative">
            <img
              src="mapa-colombia.png"
              alt="Mapa Colombia"
              className="h-full object-contain opacity-80 mix-blend-multiply"
            />
            <span className="absolute bottom-2 right-2 text-xs bg-white px-2 py-1 rounded shadow">
              Mapa Estático
            </span>
          </div>
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
            No hay SDS pendientes.
          </p>
        )}
      </AccordionSection>

      {/* SECCIÓN EJECUTADAS */}
      <AccordionSection
        title="SDS Ejecutadas / Histórico"
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
    showModal(
      "Éxito",
      "Asesor creado correctamente. Ahora aparecerá en la lista de asignación."
    );
    setFormData({
      nombre: "",
      identificacion: "",
      telefono: "",
      email: "",
      empresa: "",
      cargo: "Asesor de Prevención",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-tikka-dark border-b pb-2">
        Crear Asesor de Prevención SDS
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
              value="Asesor de Prevención"
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
      (!filters.tipoActividad || item.TipoActividad === filters.tipoActividad);
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
        Asignar SDS
      </h2>
      <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <FilterInput
          label="SDS"
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
            ⚠ SDS Disponibles ({filteredData.length}) | Seleccionadas:{" "}
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
                Asignar {selectedRows.length} SDS a:
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
                  className="flex-1 py-1 bg-tikka-green text-white text-xs rounded hover:bg-[#009670]"
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
                <th className="px-4 py-3">SDS</th>
                <th className="px-4 py-3">Cliente</th>
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
            className="px-6 py-2 bg-tikka-green text-white font-bold rounded-lg hover:bg-[#009670] shadow-lg transition-transform active:scale-95"
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

// COMPONENTE PRINCIPAL (LÍDER)
const LeaderDashboard = ({
  onLogout,
  user,
  sdsData,
  onNavigate,
  asesores,
  setAsesores,
  showModal,
  onSaveAssignments,
}) => {
  const [activeModule, setActiveModule] = useState("tableros");

  const menuItems = [
    { id: "tableros", label: "Tableros de Control", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg> },
    { id: "gestion", label: "Gestión de Actas", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> },
    { id: "crearAsesor", label: "Crear Asesor Prevención", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg> },
    { id: "asignar", label: "Asignar SDS", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> },
  ];

  const renderContent = () => {
    switch (activeModule) {
      case "tableros":
        return <DashboardModule sdsData={sdsData} />;
      case "gestion":
        return <GestionActasModule sdsData={sdsData} onNavigate={onNavigate} />;
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
      default:
        return <DashboardModule sdsData={sdsData} />;
    }
  };
  return (
    <AppLayout title="Líder de Prevención" onNavigate={null}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-gray-50">
        <aside className="w-full md:w-64 flex-shrink-0 shadow-2xl border-b md:border-r md:border-b-0 border-white/10" style={{ background: 'linear-gradient(135deg, #2D3380 0%, #00BFA5 100%)' }}>
          <div className="hidden md:block p-8 border-b border-white/10">
            <div className="flex items-center gap-4 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-xl shadow-inner border border-white/20">
                {user?.name?.charAt(0) || "L"}
              </div>
              <div>
                <p className="text-sm font-black text-white tracking-tight">
                  {user?.name || "Líder"}
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

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
          {renderContent()}
        </main>
      </div>
    </AppLayout>
  );
};

export default LeaderDashboard;

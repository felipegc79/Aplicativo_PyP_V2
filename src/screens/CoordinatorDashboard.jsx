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
const CylinderBar = ({ percent, color }) => (
  <div className="relative w-8 mx-auto h-full flex flex-col justify-end group">
    <div className="relative w-full transition-all duration-1000 ease-out" style={{ height: `${percent}%` }}>
      <div className="absolute top-[-6px] left-0 w-full h-[12px] rounded-[100%] z-20 shadow-inner" style={{ backgroundColor: color, filter: 'brightness(1.3)' }}></div>
      <div className="w-full h-full relative z-10" style={{ background: `linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.2) 100%), ${color}` }}></div>
      <div className="absolute bottom-[-6px] left-0 w-full h-[12px] rounded-[100%] z-0" style={{ backgroundColor: color, filter: 'brightness(0.7)' }}></div>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-tikka-dark text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none font-bold">
        {Math.round(percent)}%
      </div>
    </div>
  </div>
);

const VerticalBarChart = ({ data }) => {
  if (data.length === 0) return <p className="text-xs text-gray-400 py-4 text-center">Sin datos.</p>;
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="h-64 flex items-end justify-around gap-4 mt-8 px-4 bg-gray-50/50 rounded-xl border border-gray-100 py-6">
      {data.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center h-full w-12">
          <CylinderBar percent={(item.value / maxVal) * 100} color="#2D3380" />
          <span className="text-[10px] text-tikka-dark mt-4 font-bold text-center truncate w-full" title={item.label}>{item.label}</span>
          <span className="text-[11px] font-black text-tikka-blue">{item.value}</span>
        </div>
      ))}
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

// --- MÓDULOS ESPECÍFICOS ---

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
        (!filters.tipoActividad || item.TipoActividad === filters.tipoActividad)
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
    const input = document.getElementById('coordinator-dashboard-charts');
    if (!input) return;
    html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Coordinator_Report_${new Date().getTime()}.pdf`);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-xl font-bold text-tikka-dark border-b pb-2">
        Tableros de Control - Coordinación
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
      <div id="coordinator-dashboard-charts" className="space-y-6">
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
    </div>
  );
};

const CargarExcelModule = () => {
  const fileInputRef = useRef(null);
  const handleButtonClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file)
      alert(
        `Archivo seleccionado: ${file.name}. \n\nNota: El sistema valida que el archivo no supere los 500MB y contenga las columnas requeridas (SDS, Cliente, Póliza...).`
      );
  };

  return (
    <div className="space-y-4 animate-fade-in h-full flex flex-col">
      <h2 className="text-xl font-bold text-tikka-dark border-b pb-2">
        Cargar Excel a Base de Datos
      </h2>
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

// COMPONENTE PRINCIPAL COORDINADOR
const CoordinatorDashboard = ({ onLogout, user, sdsData }) => {
  const [activeModule, setActiveModule] = useState("tableros");

  const menuItems = [
    { id: "tableros", label: "Tableros de Control", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg> },
    { id: "gestion", label: "Gestión de Actas", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> },
    { id: "crearAsesor", label: "Crear Asesor Prevención", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg> },
    { id: "asignar", label: "Asignar SDS", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> },
    { id: "cargar", label: "Cargar Excel a B.D.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> },
  ];

  const renderContent = () => {
    switch (activeModule) {
      case "tableros":
        return <DashboardModule sdsData={sdsData} />;
      case "cargar":
        return <CargarExcelModule />;
      default:
        return <DashboardModule sdsData={sdsData} />;
    }
  };

  return (
    <AppLayout title={user?.role || "Coordinador"} onNavigate={null}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-gray-50">
        <aside className="w-full md:w-64 flex-shrink-0 shadow-2xl border-r border-white/10" style={{ background: 'linear-gradient(180deg, #2D3380 0%, #00BFA5 100%)' }}>
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center gap-4 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-xl shadow-inner border border-white/20">
                {user?.name?.charAt(0) || "C"}
              </div>
              <div>
                <p className="text-sm font-black text-white tracking-tight">
                  {user?.name || "Coordinador"}
                </p>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-2 h-2 bg-tikka-green rounded-full animate-pulse"></span> En línea
                </p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-left transition-all duration-300 ${
                  activeModule === item.id
                    ? "bg-white text-tikka-blue shadow-2xl scale-105 border-r-4 border-tikka-green"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 mt-auto border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white/10 text-white rounded-2xl text-xs font-black hover:bg-red-500/20 hover:text-red-100 transition-all border border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              CERRAR SESIÓN
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

export default CoordinatorDashboard;

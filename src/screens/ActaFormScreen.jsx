import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import {
  FormSection,
  FormInput,
  FormSelect,
  FormTextarea,
} from "../components/FormComponents";
import colombiaData from "../colombia_datos.json";

// --- PANTALLA FORMULARIO ACTA ---
const ActaFormScreen = ({
  onNavigate,
  user,
  showModal,
  selectedSds,
  setActaForm,
  sdsData = [],
}) => {
  const [formData, setFormData] = useState(null);

  // Opciones de ubicación
  const departamentos = colombiaData.map(d => d.departamento);
  
  const getMunicipiosForDepto = (depto) => {
    const found = colombiaData.find(d => d.departamento === depto);
    return found ? found.ciudades : [];
  };

  const [listaResponsables] = useState([
    "Juan Pérez (Gerente)",
    "Maria López (RRHH)",
    "Carlos Gómez (Jefe)",
    "N/A",
  ]);

  // Opciones para tipificación de evidencia
  const tiposEvidencia = [
    "Registro Fotográfico",
    "Listado de Asistencia",
    "Presentación / Material",
    "Video de la actividad",
    "Documento de Identidad",
    "Otro",
  ];

  useEffect(() => {
    if (selectedSds) {
      const today = new Date().toISOString().split("T")[0];

      setFormData({
        sdsNumber: selectedSds.SDS,
        cliente: selectedSds.Cliente,
        actividadPlaneada: selectedSds.Actividad,
        fechaActividad: today,
        tiempoEjecucion: "2 horas", // Texto libre
        departamento: "",
        municipio: "",
        direccion: "",
        observaciones: "",
        evaluacion: "N/A",
        // Datos Responsable Empresa
        nombreResponsable: "N/A",
        cargoResponsable: "",
        emailResponsable: "",
        idResponsable: "",
        telResponsable: "",
        // Datos Responsable Proveedor
        nombreProveedor: user?.name || "",
        cargoProveedor: user?.role || "",
        emailProveedor: user?.email || "",
        idProveedor: user?.identificacion || "",
        telProveedor: user?.telefono || "",
        licencia: "Res. 123 de 2023 | Exp: 12/05/2023",
        evidencias: [], // Array para almacenar evidencias
      });
    }
  }, [selectedSds, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "departamento") {
        newState.municipio = "";
      }
      return newState;
    });
  };

  // --- LÓGICA DE EVIDENCIAS ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({
        fileObject: file,
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        tipificacion: "",
      }));

      setFormData((prev) => ({
        ...prev,
        evidencias: [...(prev.evidencias || []), ...newFiles],
      }));
    }
  };

  const handleEvidenciaTypeChange = (index, value) => {
    const newEvidencias = [...formData.evidencias];
    newEvidencias[index].tipificacion = value;
    setFormData((prev) => ({ ...prev, evidencias: newEvidencias }));
  };

  const handleRemoveEvidence = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      evidencias: prev.evidencias.filter((_, index) => index !== indexToRemove),
    }));
  };
  // ------------------------------------------------------------------

  const handleSelectResponsable = (e) => {
    const { value } = e.target;
    const details = {
      "Juan Pérez (Gerente)": {
        cargo: "Gerente",
        email: "juan.perez@cliente.com",
        id: "79.123.456",
        tel: "310 111 2233",
      },
      "Maria López (RRHH)": {
        cargo: "Analista RRHH",
        email: "maria.lopez@cliente.com",
        id: "52.987.654",
        tel: "311 444 5566",
      },
      "Carlos Gómez (Jefe)": {
        cargo: "Jefe",
        email: "carlos.gomez@cliente.com",
        id: "1.010.222.333",
        tel: "312 777 8899",
      },
      "N/A": { cargo: "", email: "", id: "", tel: "" },
    };
    const selected = details[value] || details["N/A"];
    setFormData((prev) => ({
      ...prev,
      nombreResponsable: value,
      cargoResponsable: selected.cargo,
      emailResponsable: selected.email,
      idResponsable: selected.id,
      telResponsable: selected.tel,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Eliminada validación estricta de cruce de horarios y horas totales
    
    // Validación de evidencias
    const evidenciasSinTipo = formData.evidencias.some((e) => !e.tipificacion);
    if (evidenciasSinTipo) {
      showModal(
        "Evidencias Incompletas",
        "Por favor seleccione el tipo para todos los archivos adjuntos."
      );
      return;
    }

    // Preparar datos y avanzar
    const cleanFormData = {
      ...formData,
      timestamp: new Date().getTime(),
    };

    setActaForm(cleanFormData);
    onNavigate("signature");
  };

  if (!formData) return <AppLayout title="Cargando...">Cargando...</AppLayout>;

  return (
    <AppLayout onNavigate={onNavigate} title="Diligenciar Acta de Visita">
      <form onSubmit={handleSubmit}>
        <div className="space-y-8 bg-tikka-green">
          <FormSection title="1. Información de la Tarea">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Ticket / ID Tarea"
                name="sdsNumber"
                value={formData.sdsNumber}
                readOnly
              />
              <FormInput
                label="Nombre del Cliente"
                name="cliente"
                value={formData.cliente}
                readOnly
              />
            </div>
            
            <div className="mt-4">
              <FormTextarea
                label="Descripción de la Tarea"
                value={formData.actividadPlaneada}
                readOnly
                rows="2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Fecha Actividad"
                type="date"
                name="fechaActividad"
                value={formData.fechaActividad}
                onChange={handleChange}
              />
              <FormInput
                label="Tiempo de Ejecución (Opcional)"
                type="text"
                name="tiempoEjecucion"
                value={formData.tiempoEjecucion}
                onChange={handleChange}
                placeholder="Ej. 2 horas, 1 día"
              />
            </div>
          </FormSection>

          <FormSection title="2. Ubicación">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Departamento"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                options={departamentos}
              />
              <FormSelect
                label="Municipio"
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                options={getMunicipiosForDepto(formData.departamento)}
              />
              <div className="md:col-span-2">
                <FormInput
                  label="Dirección / Lugar"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej. Calle / Conjunto / Edificio"
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="3. Observaciones">
            <FormTextarea
              label="Observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
            />
          </FormSection>

          <FormSection title="4. Evidencias">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                ðŸ“Ž Adjuntar Evidencias (Ilimitado)
              </label>
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.mp4,.mkv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="text-gray-500">
                  <p className="text-3xl mb-2">ðŸ“‚</p>
                  <p className="text-sm font-bold">
                    Toque aquí para subir archivos
                  </p>
                  <p className="text-xs mt-1">Soporta: PDF, DOCX, IMG, VIDEO</p>
                </div>
              </div>

              {formData.evidencias && formData.evidencias.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-bold text-gray-500">
                    {formData.evidencias.length} Archivos adjuntos -{" "}
                    <span className="text-red-500">
                      Tipificación requerida *
                    </span>
                  </p>
                  {formData.evidencias.map((file, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-3 animate-fade-in"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-blue-100 text-tikka-blue p-2 rounded-lg font-bold text-xs uppercase w-12 text-center truncate">
                          {file.name.split(".").pop()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-bold text-gray-800 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">{file.size}</p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <select
                          value={file.tipificacion}
                          onChange={(e) =>
                            handleEvidenciaTypeChange(index, e.target.value)
                          }
                          className={`w-full p-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-blue-500 ${
                            !file.tipificacion
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">-- Seleccionar Tipo --</option>
                          {tiposEvidencia.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(index)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Eliminar archivo"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </FormSection>

          <FormSection title="5. Responsable Empresa">
            <FormSelect
              label="Nombre Responsable"
              name="nombreResponsable"
              value={formData.nombreResponsable}
              onChange={handleSelectResponsable}
              options={listaResponsables}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="No. Identificación"
                name="idResponsable"
                value={formData.idResponsable}
                readOnly
              />
              <FormInput
                label="Cargo"
                name="cargoResponsable"
                value={formData.cargoResponsable}
                readOnly
              />
              <FormInput
                label="Teléfono Contacto"
                name="telResponsable"
                value={formData.telResponsable}
                readOnly
              />
              <FormInput
                label="Email"
                name="emailResponsable"
                value={formData.emailResponsable}
                readOnly
              />
            </div>
          </FormSection>

          <FormSection title="6. Responsable Proveedor">
            <FormInput
              label="Nombre Proveedor"
              value={formData.nombreProveedor}
              readOnly
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="No. Identificación"
                value={formData.idProveedor}
                readOnly
              />
              <FormInput
                label="Cargo"
                value={formData.cargoProveedor}
                readOnly
              />
              <FormInput
                label="Teléfono Contacto"
                name="telProveedor"
                value={formData.telProveedor}
                readOnly
              />
              <FormInput
                label="Email"
                name="emailProveedor"
                value={formData.emailProveedor}
                readOnly
              />
              <div className="md:col-span-2">
                <FormInput
                  label="NÃšMERO LICENCIA Y FECHA DE EXPEDICIÓN"
                  name="licencia"
                  value={formData.licencia}
                  readOnly
                />
              </div>
            </div>
          </FormSection>

          <div className="flex justify-end gap-4 pt-8">
            <button
              onClick={() => onNavigate("main")}
              type="button"
              className="px-8 py-4 bg-gray-100 text-tikka-dark rounded-2xl font-black uppercase text-xs tracking-widest border-2 border-gray-200 hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-4 text-white rounded-2xl font-black shadow-2xl uppercase text-xs tracking-widest hover:scale-[1.03] transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2D3380 0%, #00BFA5 100%)', color: 'white' }}
            >
              Guardar e Ir a Firmar
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default ActaFormScreen;

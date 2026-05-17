import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AppLayout from "../components/AppLayout";
import ActaPreview from "../components/ActaPreview";

const ActaDetailsScreen = ({ onNavigate, sdsItem, user }) => {
  // 1. Intentamos obtener la data completa del formulario guardado en 'DetallesActa'
  const savedForm = sdsItem.DetallesActa || {};

  // 2. Construimos el objeto de visualización
  const viewOnlyForm = {
    // --- DATOS FIJOS ---
    sdsNumber: sdsItem.SDS,
    cliente: sdsItem.Cliente,
    poliza: sdsItem.Poliza,

    // --- SECCIÓN 1: ACTIVIDAD ---
    tipoActividad: savedForm.tipoActividad || "especifica",
    fechaActividad: savedForm.fechaActividad || sdsItem.FechaProgramada,
    horaInicio: savedForm.horaInicio || "08:00",
    horaFin: savedForm.horaFin || "10:00",
    horasTotales: savedForm.horasTotales || sdsItem.HorasEjecutadas || 0,
    mes: savedForm.mes || "",
    ano: savedForm.ano || "",

    // --- SECCIÓN 3: UBICACIÓN ---
    ubicacionTipo: savedForm.ubicacionTipo || "presencial",
    departamento: savedForm.departamento || "No registrado",
    municipio: savedForm.municipio || sdsItem.Municipio || "No registrado",
    direccion: savedForm.direccion || "No registrada",
    coordenadas: savedForm.coordenadas || "",

    // --- SECCIÓN 4: DETALLES DE EJECUCIÓN ---
    actividadPlaneada: sdsItem.Actividad,
    cantidadPlaneada: sdsItem.HorasPlaneadas,
    cantidadEjecutada:
      savedForm.cantidadEjecutada || sdsItem.HorasEjecutadas || 0,
    personasCubiertas: savedForm.personasCubiertas || 0,
    evaluacion: savedForm.evaluacion || sdsItem.Calificacion || "N/A",
    observaciones: savedForm.observaciones || "Sin observaciones registradas.",
    evidencias: savedForm.evidencias || [],

    // --- SECCIÓN 5: RESPONSABLE EMPRESA ---
    nombreResponsable: savedForm.nombreResponsable || "N/A",
    idResponsable: savedForm.idResponsable || "",
    telResponsable: savedForm.telResponsable || "",
    cargoResponsable: savedForm.cargoResponsable || "",
    emailResponsable: savedForm.emailResponsable || "",

    // --- SECCIÓN 6: RESPONSABLE PROVEEDOR ---
    nombreProveedor: savedForm.nombreProveedor || sdsItem.Proveedor || "N/A",
    idProveedor: savedForm.idProveedor || "",
    telProveedor: savedForm.telProveedor || "",
    cargoProveedor: savedForm.cargoProveedor || "",
    emailProveedor: savedForm.emailProveedor || "",
    // AJUSTE REALIZADO: Captura del campo Licencia SST
    licenciaSST: savedForm.licenciaSST || "Res. 4502 de 2021 | Exp: 12/05/2021",
  };

  const realClientSignature = sdsItem.Firmas?.Cliente || null;
  const realProviderSignature = sdsItem.Firmas?.Proveedor || null;

  const mockClientSig = {
    signMethod: "Digital",
    timestamp: "N/A",
    geolocation: "N/A",
    qrUrl: null,
  };

  const handleExportPDF = () => {
    const input = document.getElementById('acta-export-content');
    if (!input) return;

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 1200
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Acta_SDS_${sdsItem.SDS}.pdf`);
    });
  };

  return (
    <AppLayout onNavigate={onNavigate} title={`Detalle Acta #${sdsItem.SDS}`}>
      <div className="pb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-700"
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
          </div>
          <div>
            <p className="text-sm font-bold text-tikka-green">Acta Finalizada</p>
            <p className="text-xs text-tikka-green">
              {sdsItem.Firmas ? "Firmada Digitalmente" : "Histórico Excel"}
            </p>
          </div>
        </div>

        <ActaPreview
          form={viewOnlyForm}
          showWatermark={false}
          clientSignature={
            realClientSignature || (sdsItem.Firmas ? mockClientSig : null)
          }
          providerSignature={
            realProviderSignature || (sdsItem.Firmas ? mockClientSig : null)
          }
        />

        {/* --- BOTONES DE ACCIÓN --- */}
        <div className="flex flex-col items-center gap-4 mt-8 no-print">
          {/* Botón: Exportar PDF (Más compacto y premium) */}
          <button
            onClick={handleExportPDF}
            className="w-full max-w-md py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-500/20"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exportar Acta PDF
          </button>

          <button
            onClick={() => onNavigate("main")}
            className="w-full max-w-md py-4 tikka-gradient-btn text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Listado
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ActaDetailsScreen;


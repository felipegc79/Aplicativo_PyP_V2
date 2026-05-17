import React from "react";

const ActaPreview = ({
  form,
  showWatermark = true,
  clientSignature,
  providerSignature,
}) => {
  if (!form) return null;

  const renderRow = (label, value) => (
    <div className="py-3 border-b border-gray-100 last:border-0 px-4">
      <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-base font-medium text-gray-900 mt-1 break-words">
        {value || <span className="text-gray-400 italic">N/A</span>}
      </dd>
    </div>
  );

  const SectionHeader = ({ title }) => (
    <div className="bg-tikka-green py-2 px-4 rounded-t-lg mt-4 first:mt-0 relative z-10">
      <h3 className="text-base font-bold text-white uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );

  const SignatureBlock = ({ title, data, color }) => {
    if (!data) return null;
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-row items-center gap-4">
        <div className="flex-shrink-0">
          <img
            src={data.qrUrl || "https://placehold.co/100x100?text=QR"}
            alt="QR Firma"
            className="w-24 h-24 object-contain border border-gray-100 rounded"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-bold uppercase mb-1 border-b pb-1 ${
              color === "blue"
                ? "text-tikka-blue border-blue-100"
                : "text-tikka-green border-green-100"
            }`}
          >
            {title}
          </p>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 uppercase">
              <span className="font-bold">Método:</span>{" "}
              {data.signMethod || "Digital"}
            </p>
            {data.signatureName && (
              <p className="text-[10px] text-gray-900 font-bold uppercase truncate">
                {data.signatureName}
              </p>
            )}
            <p className="text-[10px] text-gray-500">📅 {data.timestamp}</p>
            <p className="text-[10px] text-gray-500 truncate">
              📍 {data.geolocation}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="acta-export-content" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 relative min-h-[600px]">
      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none overflow-hidden mix-blend-multiply opacity-15">
          <div className="transform -rotate-45">
            <p className="text-6xl font-black text-gray-800 whitespace-nowrap mb-32">
              SISTEMA ADA
            </p>
            <p className="text-6xl font-black text-gray-800 whitespace-nowrap mb-32">
              BORRADOR - NO VÁLIDO
            </p>
            <p className="text-6xl font-black text-gray-800 whitespace-nowrap">
              SISTEMA ADA
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="p-5 text-center border-b border-gray-100 bg-white">
          <h4 className="font-bold text-xl text-tikka-blue">ACTA DE VISITA</h4>
          <p className="text-sm text-gray-500">SDS #{form.sdsNumber}</p>
        </div>

        <div className="p-4 pt-0">
          <SectionHeader title="1. Información General" />
          <div className="bg-white border-x border-b border-gray-100 rounded-b-lg mb-2">
            {renderRow("Nombre del Cliente", form.cliente)}
            {renderRow("Ticket / ID Tarea", form.sdsNumber)}
          </div>

          <SectionHeader title="2. Tiempo y Lugar" />
          <div className="bg-white border-x border-b border-gray-100 rounded-b-lg mb-2">
            {renderRow("Fecha Actividad", form.fechaActividad)}
            {renderRow("Tiempo de Ejecución", form.tiempoEjecucion)}
            {renderRow("Departamento", form.departamento)}
            {renderRow("Municipio", form.municipio)}
            {renderRow("Dirección", form.direccion)}
          </div>

          <SectionHeader title="3. Ejecución y Evidencias" />
          <div className="bg-white border-x border-b border-gray-100 rounded-b-lg mb-2">
            {renderRow("Descripción de la Tarea", form.actividadPlaneada)}

            {/* PUNTO 3: CAPTURA Y MUESTRA DE EVIDENCIAS */}
            {form.evidencias && form.evidencias.length > 0 ? (
              <div className="py-3 border-b border-gray-100 px-4">
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex justify-between items-center">
                  <span>Archivos Adjuntos</span>
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    {form.evidencias.length}
                  </span>
                </dt>
                <dd className="text-sm">
                  <ul className="space-y-2 mt-2">
                    {form.evidencias.map((e, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-gray-700 text-xs bg-gray-50 p-2 rounded"
                      >
                        <span className="text-lg">📎</span>
                        <div className="flex flex-col">
                          <span className="font-bold break-all">{e.name}</span>
                          <span className="text-[10px] text-gray-500 uppercase font-semibold">
                            {e.tipificacion || "Sin tipificar"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : (
              <div className="py-3 border-b border-gray-100 px-4">
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Archivos Adjuntos
                </dt>
                <dd className="text-sm italic text-gray-400 mt-1">
                  Sin evidencias cargadas.
                </dd>
              </div>
            )}

            <div className="py-3 border-b border-gray-100 px-4">
              <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Observaciones
              </dt>
              <dd className="text-sm font-medium text-gray-900 mt-1 p-3 bg-gray-50 rounded border border-gray-100 italic">
                {form.observaciones || "Sin observaciones registradas."}
              </dd>
            </div>
          </div>

          <SectionHeader title="4. Responsables" />
          <div className="bg-white border-x border-b border-gray-100 rounded-b-lg mb-2">
            {/* GRUPO CLIENTE */}
            <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-tikka-blue uppercase border-y border-gray-100">
              Cliente
            </div>
            {renderRow("Nombre", form.nombreResponsable)}
            {renderRow("Identificación", form.idResponsable)}
            {renderRow("Teléfono", form.telResponsable)}
            {renderRow("Cargo", form.cargoResponsable)}
            {renderRow("Email", form.emailResponsable)}

            {/* GRUPO ASESOR */}
            <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-tikka-blue uppercase border-y border-gray-100 mt-2">
              Proveedor
            </div>
            {renderRow("Nombre", form.nombreProveedor)}
            {renderRow("Identificación", form.idProveedor)}
            {renderRow("Teléfono", form.telProveedor)}
            {renderRow("Cargo", form.cargoProveedor)}
            {renderRow("Email", form.emailProveedor)}
            {renderRow("Licencia", form.licencia)}
          </div>
        </div>

          <div className="mt-4 p-4 bg-gray-50 border-t border-gray-200 relative z-20">
            <h5 className="font-bold text-center mb-6 text-tikka-blue uppercase tracking-widest text-sm">
              Firma Digital Verificada (QR)
            </h5>
            <div className="flex flex-col gap-4">
              {clientSignature && (
                <SignatureBlock
                  title="Firma Específica"
                  data={clientSignature}
                  color="blue"
                />
              )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default ActaPreview;

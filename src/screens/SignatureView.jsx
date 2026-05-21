import React from "react";
import AppLayout from "../components/AppLayout";
import ActaPreview from "../components/ActaPreview";

const SignatureView = ({
  form,
  onNavigate,
  showModal,
  clientSigned,
  clientSignatureData,
  providerSigned,
  providerSignatureData,
  setActaForm,
  onFinalize,
}) => {

  const handleFinalize = () => {
    showModal("Éxito", "Acta cerrada, firmada y guardada.");
    onFinalize(form.sdsNumber, form);
  };

  const shouldShowWatermark = !clientSigned || !providerSigned;

  return (
    <AppLayout
      onNavigate={onNavigate}
      title="Revisión y Firma de Servicio"
    >
      <div className="flex flex-col pb-32">
        <ActaPreview
          form={form}
          showWatermark={shouldShowWatermark}
          clientSignature={clientSignatureData}
          providerSignature={providerSignatureData}
        />

        <div className="space-y-4 mt-4">
          {/* BOTÓN 1: FIRMA DEL CLIENTE */}
          <button
            onClick={() => onNavigate("signClient")}
            disabled={clientSigned}
            className={`w-full py-4 rounded-xl font-bold text-base shadow-md flex items-center justify-center gap-2 transition-all ${
              clientSigned
                ? "bg-green-50 text-tikka-green border border-green-200"
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
            }`}
          >
            {clientSigned ? "✅ 1. Firma del Cliente Capturada" : "✍️ 1. Capturar Firma del Cliente"}
          </button>

          {/* BOTÓN 2: FIRMA DEL PROVEEDOR / ASESOR */}
          <button
            onClick={() => onNavigate("signProvider")}
            disabled={!clientSigned || providerSigned}
            className={`w-full py-4 rounded-xl font-bold text-base shadow-md flex items-center justify-center gap-2 transition-all ${
              !clientSigned
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : providerSigned
                ? "bg-green-50 text-tikka-green border border-green-200"
                : "bg-teal-600 text-white hover:bg-teal-700 active:scale-95"
            }`}
          >
            {providerSigned
              ? "✅ 2. Firma del Asesor Capturada"
              : clientSigned
              ? "✍️ 2. Capturar Firma del Asesor (Proveedor)"
              : "🔒 2. Firma del Asesor (Bloqueada hasta firma del cliente)"}
          </button>

          {/* BOTÓN DE FINALIZAR */}
          {clientSigned && providerSigned && (
            <button
              onClick={handleFinalize}
              className="w-full py-4 mt-6 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl animate-bounce transition-all active:scale-95"
            >
              🚀 Guardar y Finalizar Acta
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SignatureView;


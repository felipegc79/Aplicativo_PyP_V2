import React from "react";
import AppLayout from "../components/AppLayout";
import ActaPreview from "../components/ActaPreview";

const SignatureView = ({
  form,
  onNavigate,
  showModal,
  clientSigned,
  clientSignatureData,
  setActaForm,
  onFinalize,
}) => {

  const handleFinalize = () => {
    showModal("Éxito", "Acta cerrada y guardada.");
    onFinalize(form.sdsNumber, form);
  };

  const shouldShowWatermark = !clientSigned;

  return (
    <AppLayout
      onNavigate={onNavigate}
      title="Revisión y Firma"
    >
      <div className="flex flex-col pb-32">
        <ActaPreview
          form={form}
          showWatermark={shouldShowWatermark}
          clientSignature={clientSignatureData}
        />

        <div className="space-y-3 mt-4">
          <button
            onClick={() => onNavigate("signClient")}
            disabled={clientSigned}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 transition-all ${
              clientSigned
                ? "bg-green-100 text-tikka-green border border-green-200"
                : "bg-blue-600 text-white active:scale-95"
            }`}
          >
            {clientSigned ? "✅ Acta Firmada" : "Capturar Firma"}
          </button>

          {clientSigned && (
            <button
              onClick={handleFinalize}
              className="w-full py-4 mt-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg animate-bounce"
            >
              Finalizar
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SignatureView;

import React, { useState } from "react";
import AppLayout from "../components/AppLayout";
import { FormSection } from "../components/FormComponents";

// --- TAREA 3: PANTALLA DE INGRESO DE PIN (NUEVA) ---
const PinEntryScreen = ({
  onNavigate,
  showModal,
  currentPin,
  setPinVerified,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (pin === currentPin) {
      setError("");
      showModal(
        "PIN Correcto",
        "PIN verificado. Proceda a evaluar la actividad."
      );
      setPinVerified(true); // Tarea 1: Establecer PIN como verificado
      onNavigate("signature"); // Tarea 1: Volver al hub de firma
    } else {
      setError("PIN incorrecto. Por favor, intente de nuevo.");
    }
  };

  return (
    <AppLayout onNavigate={onNavigate} title="Verificación de Cliente (RF30)">
      <FormSection title="Ingrese el PIN de Seguridad">
        <p className="text-gray-600 mb-4">
          Se ha enviado un PIN de 6 dígitos a su Email/SMS. Por favor, ingréselo
          para continuar.
        </p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="tel"
          maxLength="6"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg text-center text-2xl tracking-widest"
          placeholder="------"
        />
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => onNavigate("signature")}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            Verificar PIN
          </button>
        </div>
      </FormSection>
    </AppLayout>
  );
};

export default PinEntryScreen;

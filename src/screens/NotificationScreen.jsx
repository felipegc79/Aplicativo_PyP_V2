import React from "react";
import AppLayout from "../components/AppLayout";
import { FormSection } from "../components/FormComponents";

// --- TAREA 2: PANTALLA DE NOTIFICACIÓN (NUEVA) ---
const NotificationScreen = ({ onNavigate, currentPin }) => {
  return (
    <AppLayout onNavigate={onNavigate} title="Notificación Enviada">
      <FormSection title="Simulación de Notificación (Email/SMS)">
        <div className="bg-white p-6 rounded-lg shadow-lg border max-w-lg mx-auto">
          <p className="text-sm text-gray-500 mb-2">De: Seguros Colsanitas</p>
          <p className="text-sm text-gray-500 mb-4">
            Para: cliente@cliente.com, proveedor@proveedor.com
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Confirmación de Acta de Visita
          </h3>
          <p className="text-gray-700 mb-4">
            Se ha generado un acta de visita. Para firmar, por favor use los
            siguientes detalles:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-center">
            <p className="text-sm text-gray-600">Su PIN de seguridad es:</p>
            <p className="text-4xl font-bold text-tikka-blue tracking-widest">
              {currentPin || "123456"}
            </p>
          </div>
          <p className="text-gray-700 mb-6">
            Haga clic en el enlace para revisar y firmar el documento:
          </p>
          <button
            onClick={() => onNavigate("pinEntry")} // Simula al cliente abriendo el enlace y yendo al PIN
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Ir a Firmar Acta
          </button>
        </div>

        <button
          onClick={() => onNavigate("signature")}
          className="mt-6 text-sm text-tikka-blue hover:underline text-center block w-full"
        >
          &lt; Volver a la pantalla del Proveedor
        </button>
      </FormSection>
    </AppLayout>
  );
};

export default NotificationScreen;

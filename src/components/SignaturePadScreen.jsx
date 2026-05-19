import React, { useRef, useEffect, useState } from "react";
import AppLayout from "./AppLayout";

const SignaturePadScreen = ({
  onNavigate,
  showModal,
  signatureType,
  onSaveSignature,
}) => {
  const title =
    signatureType === "client" ? "Firma del Cliente" : "Firma del Proveedor";

  // Modos de firma: 'draw' (mano alzada) o 'type' (teclado)
  const [mode, setMode] = useState("draw");
  const [typedName, setTypedName] = useState("");

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [isSigned, setIsSigned] = useState(false);

  // --- LÓGICA CANVAS (DIBUJO) ---
  useEffect(() => {
    if (mode !== "draw") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.touchAction = "none";
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = rect.width || canvas.clientWidth || 300;
    const height = rect.height || canvas.clientHeight || 200;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return {
        offsetX: clientX - rect.left,
        offsetY: clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      if (e.cancelable) e.preventDefault();
      isDrawingRef.current = true;
      const { offsetX, offsetY } = getCoords(e);
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX, offsetY);
    };

    const draw = (e) => {
      if (!isDrawingRef.current) return;
      if (e.cancelable) e.preventDefault();
      const { offsetX, offsetY } = getCoords(e);
      ctxRef.current.lineTo(offsetX, offsetY);
      ctxRef.current.stroke();
      setIsSigned(true);
    };

    const stopDrawing = (e) => {
      if (e && e.cancelable) e.preventDefault();
      isDrawingRef.current = false;
      if (ctxRef.current) {
        ctxRef.current.closePath();
      }
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousedown", startDrawing);
        canvas.removeEventListener("mousemove", draw);
        canvas.removeEventListener("mouseup", stopDrawing);
        canvas.removeEventListener("touchstart", startDrawing);
        canvas.removeEventListener("touchmove", draw);
        canvas.removeEventListener("touchend", stopDrawing);
      }
    };
  }, [mode]);

  const handleClear = () => {
    if (mode === "draw") {
      const canvas = canvasRef.current;
      if (ctxRef.current)
        ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
      setIsSigned(false);
    } else {
      setTypedName("");
    }
  };

  const handleSave = () => {
    if (mode === "draw" && !isSigned) {
      showModal("Error", "Por favor, firme antes de guardar.");
      return;
    }
    if (mode === "type" && typedName.trim().length < 3) {
      showModal("Error", "Por favor, escriba un nombre válido.");
      return;
    }

    // Preparar datos para fecha
    const now = new Date();
    const timestamp = now.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    showModal("Procesando...", "Generando Código QR Seguro...");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
          saveProcess(timestamp, coords);
        },
        (error) => {
          console.warn("Error Geo:", error);
          saveProcess(timestamp, "Ubicación no disponible");
        },
        { timeout: 3000, enableHighAccuracy: false, maximumAge: 60000 }
      );
    } else {
      saveProcess(timestamp, "Ubicación no soportada");
    }
  };

  const saveProcess = (timestamp, geolocation) => {
    // 1. Si es dibujo, guardamos la imagen base64. Si es texto, guardamos el texto.
    let representation = "";
    let signMethod = "";

    if (mode === "draw") {
      representation = canvasRef.current.toDataURL("image/png");
      signMethod = "Manuscrita Digital";
    } else {
      signMethod = "Teclado Seguro";
      // Creamos una imagen dummy o guardamos null, ya que usaremos el QR
      representation = null;
    }

    // 2. GENERACIÓN DEL QR (Punto 8)
    // Datos a codificar en el QR
    const qrData = `FIRMADO POR: ${
      signatureType === "client" ? "Cliente" : "Proveedor"
    }\nMETODO: ${signMethod}\nFECHA: ${timestamp}\nGEO: ${geolocation}\n${
      mode === "type" ? "NOMBRE: " + typedName : "FIRMA GRAFICA"
    }`;

    // Usamos API pública para generar el QR al vuelo
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      qrData
    )}`;

    onSaveSignature({
      signatureImage: representation, // Puede ser null si es texto
      signatureName: typedName, // Nombre si fue teclado
      signMethod, // 'Manuscrita Digital' o 'Teclado Seguro'
      qrUrl, // URL del código QR generado
      timestamp,
      geolocation,
    });

    onNavigate("signature");
  };

  return (
    <AppLayout onNavigate={onNavigate} title={title}>
      <div className="flex flex-col h-full pb-6">
        {/* Selector de Modo */}
        <div className="flex bg-gray-200 p-1 rounded-lg mb-4">
          <button
            onClick={() => {
              setMode("draw");
              setIsSigned(false);
            }}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
              mode === "draw"
                ? "bg-white shadow text-tikka-blue"
                : "text-gray-500"
            }`}
          >
            ✍️ Dibujar
          </button>
          <button
            onClick={() => {
              setMode("type");
              setIsSigned(false);
            }}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
              mode === "type"
                ? "bg-white shadow text-tikka-blue"
                : "text-gray-500"
            }`}
          >
            ⌨️ Teclado
          </button>
        </div>

        <p className="text-gray-600 mb-2 text-center text-sm">
          {mode === "draw"
            ? "Use su dedo para firmar en el recuadro."
            : "Escriba su nombre completo para validar."}
        </p>

        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-4 flex-1 max-h-[400px] flex flex-col justify-center">
          {mode === "draw" ? (
            <canvas
              ref={canvasRef}
              className="w-full h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 touch-none cursor-crosshair"
            ></canvas>
          ) : (
            <div className="h-64 flex flex-col justify-center px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <label className="text-xs text-gray-500 font-bold uppercase mb-1">
                Nombre del Firmante
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Escriba aquí..."
                className="w-full text-2xl font-bold text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent py-2"
              />
              <p className="text-xs text-center text-gray-400 mt-4">
                Al guardar, se generará un código QR único con su huella digital
                de tiempo y ubicación.
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4">
          <button
            onClick={handleClear}
            className="w-full py-4 bg-gray-200 text-gray-700 rounded-xl font-bold"
          >
            Borrar
          </button>
          <button
            onClick={handleSave}
            className="w-full py-4 bg-tikka-blue text-white rounded-xl font-bold shadow-lg"
          >
            Generar QR y Guardar
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default SignaturePadScreen;

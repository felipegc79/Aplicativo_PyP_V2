import React from "react";

const AppLayout = ({ children, onNavigate, title }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    {/* 1. HEADER (Fijo arriba) estilo Tikka Gradient */}
    <header className="sticky top-0 z-30 shadow-xl" style={{ background: 'linear-gradient(135deg, #2D3380 0%, #00BFA5 100%)' }}>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center">
          <img
            src="/logo-tikka-trasparente.png"
            alt="T'IKKA TECHNOLOGY"
            className="h-14 w-auto object-contain mr-4 brightness-0 invert"
          />
          <h1 className="text-xl font-black text-white hidden md:block uppercase tracking-widest">
            {title}
          </h1>
        </div>

        {/* Botón Volver */}
        {onNavigate && (
          <button
            onClick={() => onNavigate("main")}
            className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition-all shadow-md active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
    </header>

    {/* 2. CONTENIDO PRINCIPAL (Se eliminó el logo redundante de aquí) */}

    {/* 3. CONTENIDO PRINCIPAL */}
    <main className="flex-1 p-4 pb-20 overflow-x-hidden">{children}</main>
  </div>
);

export default AppLayout;

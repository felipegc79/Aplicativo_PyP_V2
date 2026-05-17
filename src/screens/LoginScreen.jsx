import React, { useState } from "react";

const LoginScreen = ({ users, onLoginSuccess, onGoToRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // AJUSTE 2: Estado para ver contraseña
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Por favor ingrese usuario y contraseña.");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión.");
        return;
      }

      onLoginSuccess(data.user);
    } catch (err) {
      console.error(err);
      setError("Error de conexión. ¿El servidor backend está en ejecución?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tikka-gradient p-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-tikka-green">
        <div className="text-center mb-8">
          <img
            src="/logo-tikka-trasparente.png"
            alt="T'IKKA TECHNOLOGY"
            className="w-56 mx-auto mb-4"
          />
          <h2 className="text-2xl font-extrabold text-tikka-dark uppercase tracking-tighter">
            Portal de Gestión
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-bold text-tikka-dark mb-1 uppercase tracking-wider">
              Usuario o Correo
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-tikka-green transition-all"
              placeholder="Ingrese su usuario"
            />
          </div>

          <div className="mb-6 relative">
            <label className="block text-sm font-bold text-tikka-dark mb-1 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-tikka-green transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-tikka-blue focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.414-1.414A9.98 9.98 0 0010 13a9.963 9.963 0 00-4.682-1.176l-.803.803A7.963 7.963 0 015 10c0-1.713.526-3.308 1.428-4.636L3.707 2.293zM8.336 6.922A6.002 6.002 0 0110 4c2.68 0 5.05 1.725 5.795 4.195l-1.575 1.575A4.002 4.002 0 0010 8c-.37 0-.726.052-1.06.148L8.336 6.922z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 text-white rounded-xl font-black shadow-2xl hover:scale-[1.03] transition-all active:scale-95 uppercase tracking-widest text-sm"
            style={{ background: 'linear-gradient(135deg, #2D3380 0%, #00BFA5 100%)', color: 'white' }}
          >
            INGRESAR
          </button>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              ¿Nuevo en la plataforma?
            </p>
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-tikka-blue font-black hover:text-tikka-green text-sm hover:underline transition-colors uppercase tracking-tighter"
            >
              Crear una cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;

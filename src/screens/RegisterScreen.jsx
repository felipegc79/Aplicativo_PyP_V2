import React, { useState } from "react";

const RegisterScreen = ({ onRegisterSuccess, onCancel, showModal }) => {
  const [formData, setFormData] = useState({
    nombres: "",
    identificacion: "",
    telefono: "", // NUEVO CAMPO
    email: "",
    rol: "",
  });

  const roles = [
    "Administrador del sistema",
    "Lider",
    "Asesor",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.nombres ||
      !formData.identificacion ||
      !formData.telefono ||
      !formData.email ||
      !formData.rol
    ) {
      showModal("Error", "Por favor diligencie todos los campos obligatorios.");
      return;
    }

    const autoUser = formData.email.split("@")[0];
    const autoPass = "123456";
    try {
      const apiBase = window.Capacitor ? "https://tikka-gestion-pyp.vercel.app" : "";
      const response = await fetch(`${apiBase}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: autoUser,
          password: autoPass,
          name: formData.nombres,
          role: formData.rol,
          email: formData.email,
          identificacion: formData.identificacion,
          telefono: formData.telefono,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showModal("Error", data.error || "No se pudo registrar el usuario.");
        return;
      }

      showModal(
        "Registro Exitoso",
        `Se ha registrado su usuario.\n\nUsuario: ${autoUser}\nContraseña: ${autoPass}\n\nNota: Un administrador debe aprobar su cuenta (correo enviado).`
      );

      setTimeout(() => {
        onCancel(); // Volver al login
      }, 3000);
    } catch (err) {
      console.error(err);
      showModal("Error", "Error de conexión. ¿El servidor backend está en ejecución?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tikka-gradient p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border-t-8 border-tikka-green">
        <div className="text-center mb-6">
          <img
            src="/logo-tikka-trasparente.png"
            alt="T'IKKA TECHNOLOGY"
            className="w-48 mx-auto mb-4"
          />
          <h2 className="text-3xl font-extrabold text-tikka-dark uppercase tracking-tighter">
            Registro de Usuario
          </h2>
          <p className="text-sm font-bold text-tikka-blue mt-1">
            Plataforma Tecnológica
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-tikka-dark uppercase tracking-widest mb-1">
              Nombres y Apellidos
            </label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-tikka-green outline-none transition-all"
              placeholder="Ej. Pepito Pérez"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-tikka-dark uppercase tracking-widest mb-1">
              No. Identificación
            </label>
            <input
              type="number"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-tikka-green outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-tikka-dark uppercase tracking-widest mb-1">
              Teléfono de contacto
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-tikka-green outline-none transition-all"
              placeholder="Ej. 300 123 4567"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-tikka-dark uppercase tracking-widest mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-tikka-green outline-none transition-all"
              placeholder="usuario@empresa.com"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-tikka-dark uppercase tracking-widest mb-1">
              Rol de Usuario
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-100 rounded-xl bg-white focus:ring-2 focus:ring-tikka-green outline-none transition-all"
            >
              <option value="">Seleccione un rol...</option>
              {roles.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-gray-100 text-tikka-dark rounded-xl font-black hover:bg-gray-200 transition-all active:scale-95 uppercase text-xs tracking-widest border-2 border-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 text-white rounded-xl font-black shadow-2xl hover:scale-[1.03] transition-all active:scale-95 uppercase text-xs tracking-widest"
              style={{ background: 'linear-gradient(135deg, #2D3380 0%, #00BFA5 100%)', color: 'white' }}
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterScreen;

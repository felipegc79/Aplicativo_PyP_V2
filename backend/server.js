const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const isVercel = !!process.env.VERCEL;
const dbPath = isVercel
  ? "/tmp/users.json"
  : path.join(__dirname, "users.json");

// Inicializar DB JSON (En Vercel copiamos la pre-existente con los usuarios semilla)
if (!fs.existsSync(dbPath)) {
  const srcPath = path.join(__dirname, "users.json");
  if (isVercel && fs.existsSync(srcPath)) {
    try {
      fs.copyFileSync(srcPath, dbPath);
    } catch (e) {
      console.error("Error al copiar users.json a /tmp:", e);
      fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
    }
  } else {
    try {
      fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
    } catch (e) {
      console.error("Error al inicializar users.json:", e);
    }
  }
}

const getUsers = () => {
  const users = JSON.parse(fs.readFileSync(dbPath));
  let modified = false;
  const migrated = users.map((u) => {
    let updatedRole = u.role;
    if (u.role === "Lider de prevencion" || u.role === "Líder de prevención" || u.role === "Líder de Prevención") {
      updatedRole = "Lider";
      modified = true;
    } else if (
      u.role === "Asesor de Prevención" ||
      u.role === "asesor de prevencion" ||
      u.role === "Asesor de prevención" ||
      u.role === "Asesor Prevención"
    ) {
      updatedRole = "Asesor";
      modified = true;
    }
    return { ...u, role: updatedRole };
  });
  if (modified) {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(migrated, null, 2));
    } catch (e) {
      console.error("Error al persistir roles migrados:", e);
    }
  }
  return migrated;
};
const saveUsers = (users) => fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

const transporter = nodemailer.createTransport({
  host: 'smtp.mi.com.co',
  port: 465,
  secure: true, // true para el puerto 465
  auth: {
      user: 'desarrollo@tikkaconsultores.com', // El correo desde donde se enviarán los mensajes
      pass: 'Tikka2024@'               // Contraseña de correo configurada
  }
});

app.post("/api/register", (req, res) => {
  const { username, password, name, role, email, identificacion, telefono } = req.body;
  const users = getUsers();
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: "El usuario ya existe." });
  }

  // Lógica de Seguridad: El primer usuario que se registre en el sistema 
  // se convierte automáticamente en el Administrador del sistema y queda aprobado.
  const isFirstUser = users.length === 0;
  
  const newUser = {
    id: Date.now(),
    username,
    password,
    name,
    role: isFirstUser ? "Administrador del sistema" : role,
    email,
    identificacion,
    telefono,
    approved: isFirstUser ? 1 : 0
  };

  users.push(newUser);
  saveUsers(users);

  let message = "Usuario registrado con éxito. Pendiente de aprobación del administrador.";
  if (isFirstUser) {
    message = "Usted es el primer usuario. Ha sido registrado y aprobado automáticamente como Administrador del sistema.";
  }

  // Enviar correo
  const mailOptions = {
    from: '"Tikka Gestión PyP Notificaciones" <desarrollo@tikkaconsultores.com>',
    to: "desarrollo@tikkaconsultores.com",
    subject: "Nuevo Registro de Usuario - Tikka Gestión PyP",
    text: `Un nuevo usuario se ha registrado y requiere aprobación.\n\nNombre: ${name}\nUsuario: ${username}\nRol Solicitado: ${role}\nEmail: ${email}\n\nPor favor, ingresa al sistema para aprobar este usuario.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error al enviar correo:", error);
    else console.log("Correo enviado al admin:", info.messageId);
  });

  res.json({ message });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) return res.status(401).json({ error: "Credenciales inválidas." });
  if (user.approved === 0) return res.status(403).json({ error: "Usuario pendiente de aprobación por el administrador." });
  
  res.json({ user });
});

app.post("/api/approve", (req, res) => {
  const { userId, role } = req.body;
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

  user.approved = 1;
  if (role) user.role = role;

  saveUsers(users);

  // Notificar al usuario por correo que ya tiene acceso al sistema
  let emailSent = false;
  if (user.email) {
    const userMail = {
      from: '"Tikka Gestión PyP Notificaciones" <desarrollo@tikkaconsultores.com>',
      to: user.email,
      subject: "Acceso aprobado - Tikka Gestión PyP",
      text:
        `Hola ${user.name},\n\n` +
        `Le informamos que el Administrador del sistema ha aprobado su solicitud de acceso a Tikka Gestión PyP.\n\n` +
        `Usuario: ${user.username}\n` +
        `Rol asignado: ${user.role}\n\n` +
        `Ya puede iniciar sesión en el sistema con sus credenciales.\n\n` +
        `Saludos,\nEquipo T'IKKA Consultores`,
    };
    transporter.sendMail(userMail, (error, info) => {
      if (error) console.error("Error al enviar correo al usuario aprobado:", error);
      else console.log("Correo de aprobación enviado a:", user.email, info.messageId);
    });
    emailSent = true;
  }

  res.json({
    message: "Usuario aprobado",
    emailSent,
    email: user.email || null,
  });
});

app.get("/api/users", (req, res) => {
  const users = getUsers();
  const safeUsers = users.map(({password, ...rest}) => rest);
  res.json({ users: safeUsers });
});

app.put("/api/users/:id", (req, res) => {
  const userId = Number(req.params.id);
  const { name, email, identificacion, telefono, role } = req.body;
  const users = getUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (identificacion !== undefined) user.identificacion = identificacion;
  if (telefono !== undefined) user.telefono = telefono;
  if (role !== undefined) user.role = role;

  saveUsers(users);
  res.json({ message: "Usuario actualizado correctamente.", user });
});

app.delete("/api/users/:id", (req, res) => {
  const userId = Number(req.params.id);
  const users = getUsers();
  const target = users.find((u) => u.id === userId);

  if (!target) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  // Proteger al Administrador del sistema (no se puede eliminar a sí mismo
  // ni eliminar al primer admin si es el único administrador aprobado).
  const remainingAdmins = users.filter(
    (u) => u.role === "Administrador del sistema" && u.approved === 1 && u.id !== userId
  );
  if (target.role === "Administrador del sistema" && remainingAdmins.length === 0) {
    return res
      .status(400)
      .json({ error: "No se puede eliminar al único Administrador del sistema." });
  }

  const filtered = users.filter((u) => u.id !== userId);
  saveUsers(filtered);
  res.json({ message: "Usuario eliminado correctamente." });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

module.exports = app;

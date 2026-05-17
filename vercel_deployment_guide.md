# Guía de Despliegue en Vercel - SaaS ADA (Aplicativo PyP V2)

¡Buenas noticias! Hemos completado con éxito la subida del proyecto a tu repositorio de GitHub en [felipegc79/Aplicativo_PyP_V2](https://github.com/felipegc79/Aplicativo_PyP_V2.git).

Además, he adaptado la arquitectura del proyecto para que sea **totalmente compatible con Vercel** de manera automática y limpia, sin alterar su funcionamiento local.

---

## 🛠️ ¿Qué cambios realizamos para habilitar Vercel?

1. **Configuración de Vercel (`vercel.json`)**:
   Creamos un archivo de configuración en la raíz que le dice a Vercel cómo compilar el frontend de React (`@vercel/static-build`) y el backend de Node/Express (`@vercel/node`), enrutando todas las peticiones que empiecen con `/api/` directamente al servidor backend.

2. **Rutas Relativas en el Frontend**:
   Modificamos las peticiones `fetch` en `RegisterScreen.jsx`, `LoginScreen.jsx` y `DirectorDashboard.jsx`. En lugar de tener la URL fija `http://localhost:3001/api/...` (que fallaría en producción), ahora usan rutas relativas como `/api/...`.

3. **Proxy Local (`package.json`)**:
   Añadimos `"proxy": "http://localhost:3001"` en el `package.json` raíz. Esto asegura que al desarrollar localmente con `npm start`, React redirija de forma transparente las peticiones `/api/...` a tu backend local en el puerto 3001, por lo que **tu script local `INICIAR_APLICATIVO.bat` sigue funcionando exactamente igual**.

4. **Compatibilidad Serverless (`backend/server.js`)**:
   Ajustamos el inicio del backend para exportar la aplicación Express (`module.exports = app`) y solo ejecutar `app.listen()` si el archivo se ejecuta directamente en local. Esto es indispensable para que funcione como una *Serverless Function* en la infraestructura en la nube de Vercel.

5. **Exclusión de Archivos Pesados o Sensibles (`.gitignore`)**:
   Creamos un archivo `.gitignore` robusto que evita subir carpetas pesadas como `node_modules` o archivos de compilación local a tu repositorio de GitHub.

---

## 🚀 Paso a Paso: Cómo Desplegar en Vercel en 2 Minutos

Dado que Vercel requiere autenticación con tu cuenta personal, la mejor y más recomendada forma de desplegarlo es a través de su panel web (esto además habilitará **Despliegue Continuo**: cada vez que hagas un cambio y lo subas a GitHub, Vercel lo actualizará automáticamente).

Sigue estos sencillos pasos:

### Paso 1: Iniciar sesión en Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión (te recomendamos elegir **"Continue with GitHub"** para que tus cuentas queden vinculadas de inmediato).

### Paso 2: Importar el Proyecto
1. Una vez en tu Dashboard de Vercel, haz clic en el botón azul **"Add New..."** y selecciona **"Project"**.
2. Verás una lista de tus repositorios de GitHub. Busca y haz clic en **"Import"** al lado de tu repositorio: `Aplicativo_PyP_V2`.

### Paso 3: Configurar y Desplegar
Vercel detectará automáticamente la configuración gracias al archivo `vercel.json` que he creado. 

1. **Project Name**: Puedes dejar `aplicativo-pyp-v2` o el nombre que prefieras.
2. **Framework Preset**: Déjalo en *Other* o *Create React App* (Vercel lo gestionará automáticamente mediante nuestro archivo).
3. **Environment Variables (Opcional)**: Si necesitas variables de entorno más adelante (por ejemplo, credenciales de correo o base de datos), puedes agregarlas aquí. Por ahora no es obligatorio ya que los datos de prueba están preconfigurados.
4. Haz clic en el botón **"Deploy"**.

¡Listo! En unos 60 segundos, Vercel compilará tu aplicación y te dará una **URL pública gratuita** (por ejemplo, `https://aplicativo-pyp-v2.vercel.app`) donde tu SaaS estará completamente funcional y en línea para el mundo.

---

> [!NOTE]
> **Sobre la persistencia de datos (Usuarios)**:
> Al ser Vercel una plataforma serverless (sin estado permanente en el servidor), los cambios que realices en los usuarios (como registros nuevos o aprobaciones) funcionarán perfectamente durante la sesión activa, pero se restablecerán cuando el servidor se apague por inactividad (el archivo `users.json` local vuelve a su estado inicial de GitHub).
>
> Para un entorno de producción real definitivo, se recomienda conectar este flujo a una base de datos externa (como MongoDB o PostgreSQL), pero para demos comerciales y prototipos rápidos, el flujo actual con los usuarios preconfigurados es ideal y totalmente funcional.

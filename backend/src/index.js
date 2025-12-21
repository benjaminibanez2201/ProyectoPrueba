import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { AppDataSource, connectDB } from "./config/configDb.js";
// 1. Borramos la importación de 'routerApi' (¡ya no existe!)
import router from "./routes/index.routes.js"; // 2. Solo importamos el router por defecto
import path from "path";


const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use(cors({
 origin: "http://localhost:5173", // Permite peticiones solo desde el frontend
 credentials: true 
}));

// --- Configuración de Archivos Estáticos (RF6 / RF10) ---
// Usamos process.cwd() para obtener la raíz del proyecto (donde corre el servidor)
// y apuntamos a la carpeta 'uploads'.
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Inicializa la conexión a la base de datos
connectDB()
 .then(() => {
  // 3. ¡AQUÍ ESTÁ EL ARREGLO!
  // Borramos la llamada a 'routerApi(app)'
  // Y usamos app.use() para montar TODAS nuestras rutas
  // bajo el prefijo /api
  app.use("/api", router);

  // Levanta el servidor Express
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
 })
 .catch((error) => {
  console.log("Error al conectar con la base de datos:", error);
  process.exit(1);
 });
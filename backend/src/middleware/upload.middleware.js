import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

//dd guardar los archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//esto crea la carpeta uploads en la raiz del backend (fuera del src)
const uploadsDir = path.resolve(__dirname, '../../uploads');

//si la carpeta no existe, la crea
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

//config de como guardar
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) =>{
        const timestamp = Date.now();
        // Separamos la extensión para no borrar el punto
        const ext = path.extname(file.originalname); 
        const nameWithoutExt = path.basename(file.originalname, ext);
        const safeName = file.originalname.replace(/[\s\W]+/g, '_'); // Reemplaza espacios y caracteres raros
        cb(null, `${timestamp}_${safeName}${ext}`);
    }
});

//filtro de seguridad (pdf, word, zip)
function fileFilter (req, file, cb) {
    const allowedTypes = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip', 'application/x-zip-compressed'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no permitido. Solo PDF, Word o ZIP'), false);
    }
}

//recordar usar 'documento' como nombre del campo en frontend y postman
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
});

//exportaciones
//1. para alumnos, front envia 'documento'
export const uploadMiddleware = upload.single('documento');
//2. para recursos generales del coordi, front envia 'file'
export const uploadRecursoMiddleware = upload.single('file');

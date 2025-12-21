import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data) {
  // VALIDAR CAMPOS REQUERIDOS EN EL SERVICIO
  if (!data.name || !data.email || !data.password || !data.role) {//añadi role
    throw new Error("Nombre, email, rol y contraseña son requeridos");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // INCLUIR TODOS LOS CAMPOS NECESARIOS
  const newUser = userRepository.create({
    name: data.name,        // ¡ESTE ERA EL PROBLEMA!
    email: data.email,
    password: hashedPassword,
    role: data.role || 'alumno',
    tipo_practica: data.tipo_practica || null,//como en el req puse tipo de practica
  });

  try {
    return await userRepository.save(newUser); 
  } catch (error) {
    if (error.code === '23505') { 
      throw new Error("El correo ya está registrado."); 
    }
    throw error; 
  }

}

export async function findUserByEmail(email) {
  return await userRepository.findOneBy({ email });
}

export async function findUsers() {
  return await userRepository.find();
}

export async function findUserById(id) {
  const user = await userRepository.findOne({ where: { id } });
  if (!user) throw new Error("Usuario no encontrado");
  return user;
}

export async function updateUser(id, changes) {
  const user = await findUserById(id);
  userRepository.merge(user, changes);
  return await userRepository.save(user);
}

export async function deleteUser(id) {
  const user = await findUserById(id);
  return await userRepository.remove(user);
}

//para buscar los usarios alumnos (¡ESTA ES LA FUNCIÓN ARREGLADA!)
export async function findAlumnos() {
  // Le decimos a TypeORM que cargue la relación
  return await userRepository.find({ 
    where: { role: 'alumno' }, 
    relations: ['practicasComoAlumno', 'practicasComoAlumno.documentos'] // le agrego la relación de documentos
  });
}

// para obtener los detalles completos de un alumno por su ID
export async function getDetallesAlumnos(id = null, rol=null) {
    // 1. OBTENER ALUMNOS CON TODAS LAS RELACIONES ANIDADAS
    const alumnos = await userRepository.find({
        relations: [
            'practicasComoAlumno',
            'practicasComoAlumno.documentos',
            'practicasComoAlumno.formularioRespuestas',
            'practicasComoAlumno.formularioRespuestas.plantilla' 
        ],
        where: id ? { id: parseInt(id), role: 'alumno' } : { role: 'alumno' }
    });

    // 2. PROCESAR Y UNIFICAR DOCUMENTOS (Para cada alumno en la lista)
    const alumnosConDocsUnificados = alumnos.map(alumno => {
        const practica = alumno.practicasComoAlumno?.[0]; // Obtenemos la práctica activa

        if (practica) {
            const documentosArchivos = practica.documentos || [];
            
            // Lógica para mapear bitácoras a documentos
            const todasLasBitacoras = practica.formularioRespuestas
                // Filtramos solo las bitácoras (asumiendo que es el único formulario que debe ir al modal)
                .filter(r => r.plantilla?.tipo === 'bitacora') 
                .map(r => ({
                    id: r.id, 
                    tipo: "bitacora", 
                    estado: 'enviado', 
                    // Bandera clave para el Frontend
                    es_respuesta_formulario: true 
                }));
            
            //si es coordinador, limitar a 5 bitacoras. Si es alumno, mostrar todas
            const bitacorasParaMostrar = (rol === 'coordinador') ? todasLasBitacoras.slice(0, 5) : todasLasBitacoras;
            // Unir Bitácoras y Archivos en el array 'documentos'
            practica.documentos = [...documentosArchivos, ...bitacorasParaMostrar];
        }
        return alumno; 
    });
    //si se pidio un id especìfico, devolver solo ese alumno, si no el array completo
    return id ? alumnosConDocsUnificados[0] : alumnosConDocsUnificados;
}

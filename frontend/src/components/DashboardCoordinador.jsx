import React, { useState, useMemo} from "react";
import { CSVLink } from "react-csv";
import { Users, Key, ClipboardList, Eye, Edit } from "lucide-react";
import { getAlumnos } from "../services/user.service.js";
import { showErrorAlert } from "../helpers/sweetAlert.js";

// Componente de insignia de estado (Actualizado para "Sin Práctica")
const EstadoBadge = ({ practica }) => {
  // 1. LÓGICA DE ESTADO (¡TU REQUISITO!)
  let estado = 'pendiente'; // Estado por defecto si no hay práctica
  let texto = 'Pendiente (Sin Inscribir)';

  if (practica) {
    estado = practica.estado;
    texto = estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ');
  }

  const S = {
    pendiente: "bg-gray-100 text-gray-800",
    pendiente_revision: "bg-yellow-100 text-yellow-800",
    en_curso: "bg-blue-100 text-blue-800",
    finalizada: "bg-green-100 text-green-800",
    evaluada: "bg-purple-100 text-purple-800",
    cerrada: "bg-gray-200 text-gray-500",
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${S[estado] || S.cerrada}`}>
      {texto}
    </span>
  );
};

const DashboardCoordinador = ({ user }) => {
  // 2. El estado ahora guarda ALUMNOS
  const [alumnos, setAlumnos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [filter, setFilter] = useState('todas');

  // 3. La función ahora llama a getAlumnos()
  const handleLoadAlumnos = async () => {
    if (showTable) {
      setShowTable(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      
      const alumnosArray = await getAlumnos(); // <-- ¡LLAMADA CORRECTA!
      
      setAlumnos(alumnosArray);
      setShowTable(true);
      
    } catch (err) {
      const errorMessage = err.message || "No se pudo cargar la lista";
      setError(errorMessage);
      showErrorAlert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Lógica del filtro (Ahora filtra por el tipo_practica del alumno)
  const alumnosFiltrados = alumnos.filter(alumno => {
    if (filter === 'todas') return true;
    const tipo = alumno.tipo_practica; 
    if (filter === 'p1' && tipo === 'Profesional I') return true;
    if (filter === 'p2' && tipo === 'Profesional II') return true;
    return false;
  });

  const handleVerPractica = (alumno) => {
    // El alumno puede no tener práctica, ¡hay que revisar!
    const idPractica = alumno.practicasComoAlumno?.[0]?.id;
    if (idPractica) {
      console.log("Ver detalles de la PRÁCTICA:", idPractica);
    } else {
      console.log("El alumno no tiene práctica para ver:", alumno.id);
    }
  };

  const handleEditarEstado = (alumno) => {
    console.log("Editar estado del ALUMNO (o su práctica):", alumno.id);
  };

  // ENCABEZADOS PARA EL CSV ---
  // El 'label' es lo que ve el usuario en el Excel.
  // El 'key' es la clave del objeto de datos que crearemos.
  const headers = [
    { label: "Nombre Alumno", key: "name" },
    { label: "Correo Institucional", key: "email" },
    { label: "Tipo Práctica", key: "tipo_practica" },
    { label: "Estado Práctica", key: "estado" }
  ];

  // --- 3. PREPARAMOS LOS DATOS PARA EXPORTAR ---
  // Usamos useMemo para que esto no se recalcule en cada render,
  // solo cuando los alumnos filtrados cambien
  const dataParaExportar = useMemo(() => {
    // Mapeamos los datos filtrados para "aplanarlos"
    return alumnosFiltrados.map(alumno => {
      // Replicamos la lógica del 'EstadoBadge' para obtener el texto del estado
      const practica = alumno.practicasComoAlumno?.[0];
      let estadoTexto = 'Pendiente (Sin Inscribir)'; // Default
      if (practica) {
        estadoTexto = practica.estado.charAt(0).toUpperCase() + practica.estado.slice(1).replace('_', ' ');
      }
      
      // Devolvemos un objeto simple que coincide con los 'keys' de los headers
      return {
        name: alumno.name,
        email: alumno.email,
        tipo_practica: alumno.tipo_practica || 'N/A',
        estado: estadoTexto
      };
    });
  }, [alumnosFiltrados]); // Se actualiza solo si 'alumnosFiltrados' cambia

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        
        <h2 className="text-4xl font-extrabold text-blue-700 mb-2">
          Panel del Coordinador
        </h2>
        <p className="text-gray-600 mb-6">
          Bienvenido, <span className="font-semibold">{user.name}</span>.
        </p>

        {/* --- TARJETAS DE ACCIÓN --- */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* 5. El botón ahora llama a handleLoadAlumnos */}
          <div className="bg-blue-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <Users className="text-blue-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-blue-800">Ver Alumnos</h3>
            <p className="text-gray-600 text-sm mt-1">
              Revisa alumnos inscritos y su progreso (RF2)
            </p>
            <button 
              onClick={handleLoadAlumnos} 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              {showTable ? 'Ocultar Alumnos' : 'Gestionar Alumnos'}
            </button>
          </div>

          <div className="bg-green-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <Key className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Generar Claves</h3>
            <p className="text-gray-600 text-sm mt-1">
              Crea códigos de acceso para alumnos (RF3)
            </p>
            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full">
              Generar Códigos
            </button>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <ClipboardList className="text-purple-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-purple-800">Reportes</h3>
            <p className="text-gray-600 text-sm mt-1">
              Genera reportes de prácticas (RF4)
            </p>
            <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg w-full">
              Ver Reportes
            </button>
          </div>
        </div>

        {/* 6. La Tabla */}
        {isLoading && (
          <p className="text-gray-600 text-center py-8">Cargando alumnos...</p>
        )}
        {error && (
          <p className="text-red-600 bg-red-100 p-4 rounded-lg text-center mt-8">{error}</p>
        )}
        
        {showTable && !isLoading && !error && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">
              Gestión de Alumnos (RF2)
            </h3>
            
            {/* --- 4. SECCIÓN DE FILTROS Y EXPORTAR (ACTUALIZADA) --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              
              {/* Contenedor de Filtros (Izquierda) */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilter('todas')}
                  className={`py-2 px-4 rounded-lg font-medium ${filter === 'todas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Todos ({alumnosFiltrados.length})
                </button>
                <button 
                  onClick={() => setFilter('p1')}
                  className={`py-2 px-4 rounded-lg font-medium ${filter === 'p1' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Profesional I ({alumnos.filter(a => a.tipo_practica === 'Profesional I').length})
                </button>
                <button 
                  onClick={() => setFilter('p2')}
                  className={`py-2 px-4 rounded-lg font-medium ${filter === 'p2' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Profesional II ({alumnos.filter(a => a.tipo_practica === 'Profesional II').length})
                </button>
              </div>

              {/* Botón de Exportar (Derecha) */}
              <CSVLink
                data={dataParaExportar}
                headers={headers}
                filename={"listado_alumnos_practica.csv"}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
                separator={";"}
                target="_blank"
              >
                Exportar a CSV
              </CSVLink>
            </div>

            {/* 8. La Tabla (ahora mapea ALUMNOS) */}
            <div className="overflow-x-auto bg-white rounded-lg shadow border">
              <table className="w-full text-left">
                <thead className="bg-blue-50 border-b border-blue-200">
                  <tr>
                    <th className="p-4 font-semibold text-blue-800">Alumno</th>
                    <th className="p-4 font-semibold text-blue-800">Email</th>
                    <th className="p-4 font-semibold text-blue-800">Tipo Práctica</th>
                    <th className="p-4 font-semibold text-blue-800">Estado (RF10)</th>
                    <th className="p-4 font-semibold text-blue-800">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosFiltrados.map((alumno) => (
                    <tr key={alumno.id} className="border-b hover:bg-blue-50">
                      
                      <td className="p-4 text-gray-700">{alumno.name || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{alumno.email || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{alumno.tipo_practica || 'N/A'}</td>
                      <td className="p-4">
                        {/* 9. Lógica de Estado (¡Lo más importante!)
                           Pasamos la *primera* práctica del array (si existe) */}
                        <EstadoBadge practica={alumno.practicasComoAlumno?.[0]} />
                      </td>
                      <td className="p-4 space-x-2">
                        <button 
                          onClick={() => handleVerPractica(alumno)}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                          title="Ver Detalles Práctica (RF5)"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditarEstado(alumno)}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          title="Editar Estado (RF10)"
                        >
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {alumnosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        No se encontraron alumnos con ese filtro.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardCoordinador;
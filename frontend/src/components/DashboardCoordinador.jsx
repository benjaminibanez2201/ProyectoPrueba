import React, { useState, useMemo } from "react";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom"; // Hook para navegar
import { Users, Key, ClipboardList, Eye, Edit, FileCog, AlertCircle, Mail, Clock, AlertTriangle, Activity, Flag, ClipboardCheck, Lock } from "lucide-react"; // Iconos
import { getAlumnos } from "../services/user.service.js";
import { showErrorAlert } from "../helpers/sweetAlert.js";
import DocumentsModal from "./DocumentsModal";

// --- COMPONENTE AUXILIAR: BADGE DE ESTADO ---
const EstadoBadge = ({ practica }) => {
  // 1. Obtenemos el estado crudo
  const estado = practica ? practica.estado : 'pendiente';

  // 2. DICCIONARIO DE ICONOS
  const icons = {
    pendiente: AlertCircle,
    enviada_a_empresa: Mail,
    pendiente_validacion: Clock,
    rechazada: AlertTriangle,
    en_curso: Activity,
    finalizada: Flag,
    evaluada: ClipboardCheck,
    cerrada: Lock
  };

  // 3. DICCIONARIO DE COLORES
  const statusColors = {
    pendiente: "bg-gray-100 text-gray-600 border border-gray-200",
    enviada_a_empresa: "bg-blue-50 text-blue-700 border border-blue-200",
    pendiente_validacion: "bg-yellow-50 text-yellow-800 border border-yellow-200 font-bold", 
    rechazada: "bg-red-50 text-red-700 border border-red-200",
    en_curso: "bg-green-50 text-green-700 border border-green-200",
    finalizada: "bg-orange-50 text-orange-800 border border-orange-200",
    evaluada: "bg-purple-50 text-purple-700 border border-purple-200",
    cerrada: "bg-gray-800 text-white border border-gray-600",
  };

  // 4. DICCIONARIO DE TEXTOS
  const statusLabels = {
    pendiente: "Sin Inscribir Empresa",
    enviada_a_empresa: "Esperando Empresa",
    pendiente_validacion: "Requiere Validación",
    rechazada: "Observada",
    en_curso: "En Curso",
    finalizada: "Finalizada",
    evaluada: "Evaluada",
    cerrada: "Cerrada"
  };

  // Selección de recursos
  const IconComponent = icons[estado] || AlertCircle;
  const colorClass = statusColors[estado] || statusColors.pendiente;
  const texto = statusLabels[estado] || estado;

  return (
    <span className={`
      inline-flex items-center gap-1.5 
      px-2.5 py-1 rounded-md border text-xs font-medium 
      ${colorClass}
    `}>
      <IconComponent size={14} className="shrink-0" />
      <span>{texto}</span>
    </span>
  );
};

// --- COMPONENTE PRINCIPAL ---
const DashboardCoordinador = ({ user }) => {
  // 1. Hooks
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [filter, setFilter] = useState('todas');
  const [selectedStudentForDocs, setSelectedStudentForDocs] = useState(null);

  // 2. Cargar Alumnos
  const handleLoadAlumnos = async () => {
    if (showTable) {
      setShowTable(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const alumnosArray = await getAlumnos();

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

  // 3. Filtros
  const alumnosFiltrados = alumnos.filter(alumno => {
    if (filter === 'todas') return true;
    const tipo = alumno.tipo_practica;
    if (filter === 'p1' && tipo === 'Profesional I') return true;
    if (filter === 'p2' && tipo === 'Profesional II') return true;
    return false;
  });

  // 4. Exportación CSV
  const headers = [
    { label: "Nombre Alumno", key: "name" },
    { label: "Correo Institucional", key: "email" },
    { label: "Tipo Práctica", key: "tipo_practica" },
    { label: "Estado Práctica", key: "estado" }
  ];

  const dataParaExportar = useMemo(() => {
    return alumnosFiltrados.map(alumno => {
      const practica = alumno.practicasComoAlumno?.[0];
      // Usamos la misma lógica simple para el CSV
      const estadoRaw = practica ? practica.estado : 'pendiente';

      // Mapeo manual simple para el CSV (opcional, podrías reusar el diccionario arriba)
      const labelMap = {
        pendiente: "Sin Inscribir Empresa",
        enviada_a_empresa: "Esperando Empresa",
        pendiente_validacion: "Requiere Validación",
        rechazada: "Observada",
        en_curso: "En Curso",
        finalizada: "Finalizada",
        evaluada: "Evaluada (Lista para Nota)",
        cerrada: "Cerrada"
      };

      return {
        name: alumno.name,
        email: alumno.email,
        tipo_practica: alumno.tipo_practica || 'N/A',
        estado: labelMap[estadoRaw] || estadoRaw
      };
    });
  }, [alumnosFiltrados]);

  // 5. Handlers de botones (Placeholders)
  const handleVerPractica = (alumno) => {
    const idPractica = alumno.practicasComoAlumno?.[0]?.id;
    if (idPractica) {
      console.log("Ver detalles:", idPractica);
      // Aquí podrías navegar a una vista de detalle: navigate(`/admin/practica/${idPractica}`)
    }
  };

  const handleEditarEstado = (alumno) => {
    console.log("Editar estado:", alumno.id);
  };


  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-blue-100">

        <h2 className="text-4xl font-extrabold text-blue-700 mb-2">
          Panel del Coordinador
        </h2>
        <p className="text-gray-600 mb-6">
          Bienvenido, <span className="font-semibold">{user.name}</span>.
        </p>

        {/* GRID DE TARJETAS */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta 1: Ver Alumnos */}
          <div className="bg-blue-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <Users className="text-blue-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-blue-800">Ver Alumnos</h3>
            <p className="text-gray-600 text-sm mt-1">Revisa alumnos inscritos (RF2)</p>
            <button
              onClick={handleLoadAlumnos}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              {showTable ? 'Ocultar Alumnos' : 'Gestionar Alumnos'}
            </button>
          </div>

          {/* Tarjeta 2: Generar Claves */}
          <div className="bg-green-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <Key className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Generar Claves</h3>
            <p className="text-gray-600 text-sm mt-1">Crea códigos de acceso (RF3)</p>
            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full">
              Generar Códigos
            </button>
          </div>

          {/* Tarjeta 3: Reportes */}
          <div className="bg-purple-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <ClipboardList className="text-purple-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-purple-800">Reportes</h3>
            <p className="text-gray-600 text-sm mt-1">Genera reportes (RF4)</p>
            <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg w-full">
              Ver Reportes
            </button>
          </div>

          {/* Tarjeta 4: Gestión de Formularios (NUEVA) */}
          <div className="bg-orange-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <FileCog className="text-orange-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-orange-800">Formularios</h3>
            <p className="text-gray-600 text-sm mt-1">Edita las plantillas (RF12)</p>
            <button
              onClick={() => navigate("/admin/formularios")}
              className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Gestionar Plantillas
            </button>
          </div>

          {/* Tarjeta 5: Aprobar Prácticas (NUEVA) */}
          <div className="bg-red-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
              <FileText className="text-red-600 mb-3" size={32} />
              <h3 className="text-lg font-bold text-red-800">Gestionar Prácticas</h3>
              <p className="text-gray-600 text-sm mt-1">Revisa confirmaciones de empresas (RF1)</p>
              <button 
                  // Redirección directa a la ruta /coordinador/aprobar-practicas
                  onClick={() => navigate("/coordinador/aprobar-practicas")} 
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg w-full"
              >
                  Revisar Pendientes
              </button>
          </div>

        </div>

        {/* TABLA DE ALUMNOS */}
        {isLoading && (
          <p className="text-gray-600 text-center py-8">Cargando alumnos...</p>
        )}
        {error && (
          <p className="text-red-600 bg-red-100 p-4 rounded-lg text-center mt-8">{error}</p>
        )}

        {showTable && !isLoading && !error && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">Gestión de Alumnos</h3>

            {/* Filtros y Exportar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilter('todas')} className={`py-2 px-4 rounded-lg font-medium ${filter === 'todas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  Todos ({alumnosFiltrados.length})
                </button>
                <button onClick={() => setFilter('p1')} className={`py-2 px-4 rounded-lg font-medium ${filter === 'p1' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  Profesional I
                </button>
                <button onClick={() => setFilter('p2')} className={`py-2 px-4 rounded-lg font-medium ${filter === 'p2' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  Profesional II
                </button>
              </div>

              <CSVLink
                data={dataParaExportar}
                headers={headers}
                filename={"listado_alumnos.csv"}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                separator={";"}
              >
                Exportar a CSV
              </CSVLink>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto bg-white rounded-lg shadow border">
              <table className="w-full text-left">
                <thead className="bg-blue-50 border-b border-blue-200">
                  <tr>
                    <th className="p-4 font-semibold text-blue-800">Alumno</th>
                    <th className="p-4 font-semibold text-blue-800">Email</th>
                    <th className="p-4 font-semibold text-blue-800">Tipo Práctica</th>
                    <th className="p-4 font-semibold text-blue-800">Estado</th>
                    <th className="p-4 font-semibold text-blue-800">Documentos</th>
                    <th className="p-4 font-semibold text-blue-800">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosFiltrados.map((alumno) => (
                    <tr key={alumno.id} className="border-b hover:bg-blue-50">
                      <td className="p-4 text-gray-700">{alumno.name}</td>
                      <td className="p-4 text-gray-600">{alumno.email}</td>
                      <td className="p-4 text-gray-600">{alumno.tipo_practica}</td>
                      <td className="p-4">
                        <EstadoBadge practica={alumno.practicasComoAlumno?.[0]} />
                      </td>

                      {/* --- CELDA DE DOCUMENTOS --- */}
                      <td className="p-4">
                        {(() => {
                          const docs = alumno.practicasComoAlumno?.[0]?.documentos;
                          if (docs && docs.length > 0) {
                            return (
                              <button
                                onClick={() => setSelectedStudentForDocs(alumno)}
                                className="flex items-center gap-2 text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors font-medium text-xs"
                              >
                                <ClipboardList size={14} />
                                Ver {docs.length} archivos
                              </button>
                            );
                          }
                          return <span className="text-gray-400 text-xs italic pl-2">Sin archivos</span>;
                        })()}
                      </td>

                      <td className="p-4 space-x-2">
                        <button onClick={() => handleVerPractica(alumno)} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200" title="Ver Detalle">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleEditarEstado(alumno)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Aprobar/Editar">
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {alumnosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-500">No se encontraron alumnos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE DOCUMENTOS */}
      <DocumentsModal
        isOpen={!!selectedStudentForDocs}
        onClose={() => setSelectedStudentForDocs(null)}
        studentName={selectedStudentForDocs?.name}
        documents={selectedStudentForDocs?.practicasComoAlumno?.[0]?.documentos || []}
      />
    </div>
  );
};

export default DashboardCoordinador;
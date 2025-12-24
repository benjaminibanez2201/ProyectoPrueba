import React, { useState, useMemo } from "react";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom";
import { Users, Key, FileText, ClipboardList, Eye, Edit, FileCog, AlertCircle, Mail, Clock, AlertTriangle, Activity, Flag, ClipboardCheck, Lock, MessageCircle } from "lucide-react";
// ✅ CORRECCIÓN: Importar solo getAllAlumnosDetalles (sin el duplicado)
import { getAllAlumnosDetalles } from "../services/user.service.js";
import { showErrorAlert, showSuccessAlert, showInfoAlert, showSelectAlert, showConfirmAlert } from "../helpers/sweetAlert.js";
import DocumentsModal from "./DocumentsModal";
import { updateEstadoPractica, cerrarPractica } from "../services/practica.service.js";
import GestionRecursosModal from "./GestionRecursosModal";
import DetallesCompletosAlumno from "./DetallesCompletosAlumno.jsx";
import BandejaMensajes from "./BandejaMensajes.jsx";

// --- COMPONENTE AUXILIAR: BADGE DE ESTADO ---
const EstadoBadge = ({ practica }) => {
  const estado = practica ? practica.estado : 'pendiente';

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
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [filter, setFilter] = useState('todas');
  const [selectedStudentForDocs, setSelectedStudentForDocs] = useState(null);
  const [alumnoDocs, setAlumnoDocs] = useState(null);
  const [showBandeja, setShowBandeja] = useState(false);
  const [isRecursosModalOpen, setIsRecursosModalOpen] = useState(false);
  
  // ✅ CORRECCIÓN: Usar getAllAlumnosDetalles() sin parámetros
  const refreshAlumnos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const alumnosArray = await getAllAlumnosDetalles(); // ← SIN ID
      console.log(alumnosArray[0]); // Verifica la estructura de los datos
      setAlumnos(alumnosArray);
    } catch (err) {
      const errorMessage = err.message || "No se pudo cargar la lista";
      setError(errorMessage);
      showErrorAlert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadAlumnos = async () => {
    if (showTable) {
      setShowTable(false);
    } else {
      setShowTable(true);
      refreshAlumnos();
    }
  };

  const alumnosFiltrados = alumnos.filter(alumno => {
    if (filter === 'todas') return true;
    const tipo = alumno.tipo_practica;
    if (filter === 'p1' && tipo === 'Profesional I') return true;
    if (filter === 'p2' && tipo === 'Profesional II') return true;
    return false;
  });

  const headers = [
    { label: "Nombre Alumno", key: "name" },
    { label: "Correo Institucional", key: "email" },
    { label: "Tipo Práctica", key: "tipo_practica" },
    { label: "Estado Práctica", key: "estado" }
  ];

  const dataParaExportar = useMemo(() => {
    return alumnosFiltrados.map(alumno => {
      const practica = alumno.practicasComoAlumno?.[0];
      const estadoRaw = practica ? practica.estado : 'pendiente';

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

  const handleVerPractica = (alumno) => {
    const practica = alumno.practicasComoAlumno?.[0];

    if (!practica) {
      showInfoAlert("Información", "Este alumno no tiene práctica inscrita.");
      return;
    }

    setAlumnoDocs(alumno);
  };

  const handleEditarEstado = async (alumno) => {
    const practica = alumno.practicasComoAlumno?.[0];

    if (!practica) {
      showErrorAlert("Error", "No se puede editar el estado: No hay práctica.");
      return;
    }

    const { value: nuevoEstado } = await showSelectAlert(
      'Modificar Estado Manualmente',
      `Estado actual: ${practica.estado}`,
      {
        pendiente: 'Pendiente (Reinicio)',
        enviada_a_empresa: 'Enviada a Empresa',
        pendiente_validacion: 'Pendiente Validación',
        en_curso: 'En Curso',
        finalizada: 'Finalizada',
        rechazada: 'Rechazada',
        cerrada: 'Cerrada'
      }
    );

    if (nuevoEstado) {
      try {
        await updateEstadoPractica(practica.id, nuevoEstado);
        showSuccessAlert("¡Listo!", `Estado actualizado a: ${nuevoEstado}`);
        refreshAlumnos();
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", "No se pudo actualizar el estado en el servidor.");
      }
    }
  };

  const handleCerrarPractica = async (alumno) => {
    const practica = alumno.practicasComoAlumno?.[0];
    if (!practica) return showErrorAlert("Error", "No hay práctica para cerrar.");
    if (practica.estado !== 'evaluada') return showErrorAlert("No permitido", "Solo puedes cerrar prácticas ya evaluadas.");
    const result = await showConfirmAlert(
      '¿Cerrar práctica?',
      '¿Cerrar definitivamente esta práctica? Esta acción no se puede deshacer.'
    );
    if (!result.isConfirmed) return;
    try {
      await cerrarPractica(practica.id);
      showSuccessAlert("Práctica cerrada", "Se ha cerrado correctamente.");
      refreshAlumnos();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "No se pudo cerrar la práctica.";
      showErrorAlert("Error", msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-blue-100">

        <h2 className="text-4xl font-extrabold text-blue-700 mb-2">
          Panel del Coordinador
        </h2>
        <p className="text-gray-600 mb-6">
          Bienvenido, <span className="font-semibold">{user.name}</span>.
        </p>

        <button 
          onClick={() => setShowBandeja(true)}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-2 z-40"
        >
          <MessageCircle size={24} />
          <span className="font-bold">Mensajes</span>
        </button>
        {showBandeja && <BandejaMensajes user={user} onClose={() => setShowBandeja(false)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 items-stretch">
          <div className="bg-blue-50 p-6 rounded-xl shadow-inner hover:shadow-md transition flex flex-col justify-between min-h-[200px]">
            <Users className="text-blue-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-blue-800">Ver Alumnos</h3>
            <p className="text-gray-600 text-sm mt-1">Revisa alumnos inscritos</p>
            <button
              onClick={handleLoadAlumnos}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              {showTable ? 'Ocultar Alumnos' : 'Gestionar Alumnos'}
            </button>
          </div>

          
          <div className="bg-purple-50 p-6 rounded-xl shadow-inner hover:shadow-md transition flex flex-col justify-between min-h-[200px]">
            <ClipboardList className="text-purple-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-purple-800">Documentos</h3>
            <p className="text-gray-600 text-sm mt-1">Revisa tus formularios y sube documentos</p>
            <button onClick={() => setIsRecursosModalOpen(true)}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg w-full">
              Ver Biblioteca
            </button>
          </div>

          <div className="bg-green-50 p-6 rounded-xl shadow-inner hover:shadow-md transition flex flex-col justify-between min-h-[200px]">
            <FileCog className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Formularios</h3>
            <p className="text-gray-600 text-sm mt-1">Edita las plantillas</p>
            <button
              onClick={() => navigate("/admin/formularios")}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Gestionar Plantillas
            </button>
          </div>

          <div className="bg-red-50 p-6 rounded-xl shadow-inner hover:shadow-md transition flex flex-col justify-between min-h-[200px]">
            <FileText className="text-red-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-red-800">Gestionar Prácticas</h3>
            <p className="text-gray-600 text-sm mt-1">Revisa confirmaciones de empresas</p>
            <button
              onClick={() => navigate("/coordinador/aprobar-practicas")}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Revisar Pendientes
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="text-gray-600 text-center py-8">Cargando alumnos...</p>
        )}
        {error && (
          <p className="text-red-600 bg-red-100 p-4 rounded-lg text-center mt-8">{error}</p>
        )}

        {showTable && !isLoading && !error && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">Gestión de Alumnos</h3>

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
                        {alumno.practicasComoAlumno?.[0]?.estado === 'evaluada' && (
                          <button onClick={() => handleCerrarPractica(alumno)} className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200" title="Cerrar práctica">
                            <Lock size={18} />
                          </button>
                        )}
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

      <DocumentsModal
        isOpen={!!selectedStudentForDocs}
        onClose={() => setSelectedStudentForDocs(null)}
        studentName={selectedStudentForDocs?.name}
        documents={selectedStudentForDocs?.practicasComoAlumno?.[0]?.documentos || []}
      />

      {!!alumnoDocs && (
        <DetallesCompletosAlumno 
          alumnoId={alumnoDocs.id}
          onClose={() => setAlumnoDocs(null)}
        />
      )}
      
      <GestionRecursosModal 
        isOpen={isRecursosModalOpen} 
        onClose={() => setIsRecursosModalOpen(false)} 
      />
    </div>
  );
};

export default DashboardCoordinador;
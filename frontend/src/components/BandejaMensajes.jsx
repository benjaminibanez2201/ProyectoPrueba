/**
 * COMPONENTE: BANDEJA DE MENSAJES
 * Centro de mensajería que permite ver recibidos/enviados y agrupar mensajes por hilos de conversación
 */
import React, { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  Mail,
  MailOpen,
  Clock,
  User,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import {
  getBandejaEntrada,
  getMensajesEnviados,
  marcarComoLeido,
} from "../services/mensaje.service.js";
import ChatMensajeria from "./ChatMensajeria";
import { showErrorAlert } from "../helpers/sweetAlert.js";

const BandejaMensajes = ({ user, onClose }) => {
  // Estados: Controlan la vista (Recibidos/Enviados), los datos y el modal de chat
  const [vista, setVista] = useState("recibidos");
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [chatAbierto, setChatAbierto] = useState(null);

  // Efecto: Recarga los mensajes cada vez que el usuario cambia de pestaña
  useEffect(() => {
    cargarMensajes();
  }, [vista]);

  const cargarMensajes = async () => {
    try {
      setLoading(true);
      let response;

      if (vista === "recibidos") {
        response = await getBandejaEntrada();
      } else {
        response = await getMensajesEnviados();
      }

      setMensajes(response.data.mensajes || response.data || []);
    } catch (error) {
      showErrorAlert("Error", "No se pudieron cargar los mensajes");
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeido = async (mensajeId) => {
    try {
      await marcarComoLeido(mensajeId);
      setMensajes((prev) =>
        prev.map((m) => (m.id === mensajeId ? { ...m, leido: true } : m))
      );
    } catch (error) {
      // Error silencioso
    }
  };

  const handleAbrirChat = (mensaje) => {
    // Usar los campos de texto de la bdd que siempre existen
    const nombreContacto =
      vista === "recibidos"
        ? mensaje.remitente_nombre || "Empresa"
        : mensaje.destinatario_nombre || "Empresa";

    // Usar email como identificador ya que la empresa no tiene ID de usuario
    const emailContacto =
      vista === "recibidos"
        ? mensaje.remitente_email
        : mensaje.destinatario_email;

    setChatAbierto({
      practicaId: mensaje.practica?.id || mensaje.practicaId,
      destinatarioId: emailContacto, // Usamos email en lugar de ID
      destinatarioNombre: nombreContacto,
    });

    if (vista === "recibidos" && !mensaje.leido) {
      handleMarcarLeido(mensaje.id);
    }
  };

  const mensajesFiltrados = mensajes.filter((msg) => {
    if (filtro === "leidos" && !msg.leido) return false;
    if (filtro === "no_leidos" && msg.leido) return false;

    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      // Buscar en los campos nuevos de la BD
      const coincide =
        msg.asunto?.toLowerCase().includes(searchLower) ||
        msg.contenido?.toLowerCase().includes(searchLower) ||
        msg.remitente_nombre?.toLowerCase().includes(searchLower) ||
        msg.destinatario_nombre?.toLowerCase().includes(searchLower) ||
        msg.practica?.student?.name?.toLowerCase().includes(searchLower);

      if (!coincide) return false;
    }
    return true;
  });

  // Agrupar mensajes por práctica y mostrar solo el más reciente de cada conversación
  const conversacionesAgrupadas = Object.values(
    mensajesFiltrados.reduce((acc, msg) => {
      const practicaId = msg.practica?.id || msg.practicaId;
      if (!practicaId) return acc;

      // Solo contar no leídos en la vista de recibidos
      const esNoLeido = vista === "recibidos" && !msg.leido;

      if (!acc[practicaId]) {
        acc[practicaId] = {
          ...msg,
          noLeidosCount: esNoLeido ? 1 : 0,
        };
      } else {
        const fechaActual = new Date(acc[practicaId].fecha_envio);
        const fechaNueva = new Date(msg.fecha_envio);
        if (fechaNueva > fechaActual) {
          const prevNoLeidos = acc[practicaId].noLeidosCount;
          acc[practicaId] = {
            ...msg,
            noLeidosCount: prevNoLeidos + (esNoLeido ? 1 : 0),
          };
        } else {
          acc[practicaId].noLeidosCount += esNoLeido ? 1 : 0;
        }
      }
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.fecha_envio) - new Date(a.fecha_envio));

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const date = new Date(fecha);
    const hoy = new Date();
    if (date.toDateString() === hoy.toDateString()) {
      return `Hoy ${date.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    return date.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-t-2xl text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <MessageCircle size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Mensajería</h2>
                  <p className="text-indigo-100 text-sm">
                    Panel de Coordinación
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setVista("recibidos")}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                  vista === "recibidos"
                    ? "bg-white text-indigo-700 shadow-lg"
                    : "bg-white bg-opacity-20 text-white"
                }`}
              >
                <Mail size={18} className="inline mr-2" /> Recibidos
              </button>
              <button
                onClick={() => setVista("enviados")}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                  vista === "enviados"
                    ? "bg-white text-indigo-700 shadow-lg"
                    : "bg-white bg-opacity-20 text-white"
                }`}
              >
                <MailOpen size={18} className="inline mr-2" /> Enviados
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
              </div>
            ) : conversacionesAgrupadas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle size={64} className="mb-4 opacity-30" />
                <p>No hay mensajes para mostrar</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {conversacionesAgrupadas.map((mensaje) => {
                  const esRecibido = vista === "recibidos";
                  // En recibidos: mostrar quien envió (remitente)
                  // En enviados: mostrar a quien se envió (destinatario)
                  const nombreMostrar = esRecibido
                    ? mensaje.remitente_nombre
                    : mensaje.destinatario_nombre;
                  const tieneNoLeidos = esRecibido && mensaje.noLeidosCount > 0;
                  const alumnoNombre = mensaje.practica?.student?.name;

                  return (
                    <div
                      key={`conv-${mensaje.practica?.id || mensaje.practicaId}`}
                      onClick={() => handleAbrirChat(mensaje)}
                      className={`p-4 hover:bg-indigo-50 cursor-pointer transition ${
                        tieneNoLeidos ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                            tieneNoLeidos
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          <User size={24} />
                          {tieneNoLeidos && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                              {mensaje.noLeidosCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p
                                className={`text-gray-900 ${
                                  tieneNoLeidos ? "font-bold" : "font-semibold"
                                }`}
                              >
                                <span className="text-xs text-gray-500 font-normal">
                                  {esRecibido ? "De: " : "Para: "}
                                </span>
                                {nombreMostrar || "Empresa"}
                              </p>
                              {alumnoNombre && (
                                <p className="text-xs text-gray-500">
                                  Alumno: {alumnoNombre}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />{" "}
                              {formatearFecha(mensaje.fecha_envio)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">
                            {mensaje.asunto}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {mensaje.contenido}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {chatAbierto && (
        <ChatMensajeria
          practicaId={chatAbierto.practicaId}
          destinatarioId={chatAbierto.destinatarioId}
          usuarioActual={user}
          onClose={() => {
            setChatAbierto(null);
            cargarMensajes();
          }}
        />
      )}
    </>
  );
};

export default BandejaMensajes;

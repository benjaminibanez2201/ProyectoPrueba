import React, { useState } from "react";
import { Trash2, Plus, Save, ArrowLeft } from "lucide-react";

const FormEditor = ({ esquemaInicial, onSave, onCancel }) => {
  const [campos, setCampos] = useState(esquemaInicial || []);

  const tiposDisponibles = [
    { value: "text", label: "Texto Corto" },
    { value: "textarea", label: "Texto Largo" },
    { value: "number", label: "Número" },
    { value: "date", label: "Fecha" },
    { value: "email", label: "Correo Electrónico" },
    { value: "header", label: "Título / Separador" },
    { value: "select", label: "Selección" },
    { value: "schedule", label: "Horario" },
    { value: "signature", label: "Firma (Canvas)" },
  ];

  const camposPara = [
    { value: "alumno", label: "Alumno" },
    { value: "empresa", label: "Empresa" },
    { value: "ambos", label: "Ambos" },
  ];

  const addField = (tipo) => {
    setCampos([
      ...campos,
      {
        id: `campo_${Date.now()}`,
        label: "Nueva Pregunta",
        tipo,
        required: false,
        fillBy: "ambos",
        options: tipo === "select" ? [] : undefined,
      },
    ]);
  };

  const removeField = (index) => {
    setCampos(campos.filter((_, i) => i !== index));
  };

  const updateField = (index, key, value) => {
    const nuevos = [...campos];
    nuevos[index][key] = value;
    setCampos(nuevos);
  };

  const handleSave = () => onSave(campos);

  const addOption = (index) => {
    const nuevos = [...campos];
    const campo = nuevos[index];

    if (!campo.tempOption || campo.tempOption.trim() === "") return;

    if (!campo.options) campo.options = [];
    campo.options.push(campo.tempOption);
    campo.tempOption = "";

    setCampos(nuevos);
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const nuevos = [...campos];
    nuevos[fieldIndex].options.splice(optionIndex, 1);
    setCampos(nuevos);
  };

  const herramientas = [
    { tipo: "text", label: "Texto Corto" },
    { tipo: "textarea", label: "Texto Largo" },
    { tipo: "number", label: "Número" },
    { tipo: "date", label: "Fecha" },
    { tipo: "email", label: "Correo" },
    { tipo: "select", label: "Selector" },
    { tipo: "header", label: "Título" },
    { tipo: "schedule", label: "Horario" },
    { tipo: "signature", label: "Firma" },
  ];

  const camposQuePermitenValidacion = ["text", "email", "number", "textarea"];
  const validacionesDisponibles = {
    text: ["text", "nombre"],
    email: ["email"],
    number: ["number"],
    textarea: ["text"],
    rut: ["rut"],
  };

  return (
    <div className="flex gap-6">
      {/* SIDEBAR */}
      <aside className="w-64 h-fit bg-gray-100 p-4 rounded-xl border border-gray-300 shadow-sm sticky top-6">
        <h3 className="font-bold text-gray-700 mb-4 text-lg">Agregar campo</h3>

        <div className="space-y-2">
          {herramientas.map((h) => (
            <button
              key={h.tipo}
              onClick={() => addField(h.tipo)}
              className="w-full px-3 py-2 bg-white shadow border hover:bg-gray-50 rounded-lg text-sm text-left"
            >
              ➕ {h.label}
            </button>
          ))}
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex-1">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Editor de Plantilla
          </h2>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition"
            >
              <ArrowLeft size={18} />
              Cancelar
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2 font-semibold shadow transition"
            >
              <Save size={18} />
              Guardar
            </button>
          </div>
        </div>

        {/* LISTA DE CAMPOS */}
        <div className="space-y-6">
          {campos.map((campo, index) => (
            <div
              key={index}
              className="p-6 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-lg transition-all space-y-6"
            >
              {/* HEADER DEL CAMPO */}
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="text-xl font-semibold text-gray-800">
                  {campo.label || `Pregunta ${index + 1}`}
                </h4>

                <button
                  onClick={() => removeField(index)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* FORMULARIO INTERNO ORDENADO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Texto de la pregunta - OCUPA 2 COLUMNAS */}
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-600">
                    Texto de la pregunta
                  </label>
                  <input
                    type="text"
                    value={campo.label}
                    onChange={(e) =>
                      updateField(index, "label", e.target.value)
                    }
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Tipo
                  </label>
                  <select
                    value={campo.tipo}
                    onChange={(e) => updateField(index, "tipo", e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {tiposDisponibles.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campo para */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Campo para
                  </label>
                  <select
                    value={campo.fillBy || "ambos"}
                    onChange={(e) =>
                      updateField(index, "fillBy", e.target.value)
                    }
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {camposPara.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tamaño */}
                {!["header", "signature", "schedule"].includes(campo.tipo) && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Tamaño (columnas)
                    </label>
                    <select
                      value={campo.cols || 12}
                      onChange={(e) =>
                        updateField(index, "cols", Number(e.target.value))
                      }
                      className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={12}>12 (completo)</option>
                      <option value={6}>6 (medio)</option>
                      <option value={4}>4 (1/3)</option>
                      <option value={3}>3 (1/4)</option>
                    </select>
                  </div>
                )}

                {/* VALIDACIÓN */}
                {camposQuePermitenValidacion.includes(campo.tipo) &&
                  campo.tipo !== "select" && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Validación
                      </label>
                      <select
                        value={campo.validation || ""}
                        onChange={(e) =>
                          updateField(index, "validation", e.target.value)
                        }
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sin validación</option>
                        {validacionesDisponibles[campo.tipo]?.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                {/* Placeholder */}
                {!["header", "signature", "schedule"].includes(campo.tipo) && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={campo.placeholder || ""}
                      onChange={(e) =>
                        updateField(index, "placeholder", e.target.value)
                      }
                      className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Obligatorio */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={campo.required || false}
                    onChange={(e) =>
                      updateField(index, "required", e.target.checked)
                    }
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    Obligatorio
                  </span>
                </div>
              </div>

              {/* SELECT OPTIONS */}
              {campo.tipo === "select" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-blue-800 uppercase">
                    Opciones del selector
                  </h4>

                  <ul className="space-y-2">
                    {campo.options?.map((opt, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center bg-white p-2 rounded-md border shadow-sm"
                      >
                        <span>{opt}</span>
                        <button
                          onClick={() => removeOption(index, i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </li>
                    ))}

                    {(!campo.options || campo.options.length === 0) && (
                      <li className="text-gray-400 text-xs italic">
                        No hay opciones aún…
                      </li>
                    )}
                  </ul>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nueva opción"
                      value={campo.tempOption || ""}
                      onChange={(e) =>
                        updateField(index, "tempOption", e.target.value)
                      }
                      onKeyDown={(e) => e.key === "Enter" && addOption(index)}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={() => addOption(index)}
                      className="bg-blue-600 text-white px-4 rounded-lg font-bold hover:bg-blue-700"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {campos.length === 0 && (
            <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-xl">
              No hay preguntas aún. ¡Agrega una!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormEditor;

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Save, ArrowLeft } from "lucide-react";

const FormEditor = ({ esquemaInicial, onSave, onCancel }) => {
  // Aquí guardamos la estructura del formulario (el JSON) en vivo
  const [campos, setCampos] = useState(esquemaInicial || []);

  // Tipos de datos disponibles para el coordinador
  const tiposDisponibles = [
    { value: "text", label: "Texto Corto" },
    { value: "textarea", label: "Texto Largo (Párrafo)" },
    { value: "number", label: "Número" },
    { value: "date", label: "Fecha" },
    { value: "email", label: "Correo Electrónico" },
    { value: "header", label: "Título de Sección (Separador)" },
    { value: "select", label: "Pregunta de selección" },
    { value: "schedule", label: "Horario" },
    { value: "signature", label: "Firma Electrónica (Canvas)" },


    // Podemos agregar select o schedule después si quieres
  ];
  const camposPara = [
    {value: "alumno", label: "Alumno"},
    {value: "empresa", label: "Empresa"},
    {value: "ambos", label: "Ambos"}
  ]

  // 1. Función para agregar una nueva pregunta vacía
  const addField = () => {
    const nuevoCampo = {
      id: `campo_${Date.now()}`, // Generamos un ID único temporal
      label: "Nueva Pregunta",
      tipo: "text",
      required: false,
      fillBy: "ambos" // Por defecto lo llena el alumno
    };
    setCampos([...campos, nuevoCampo]);
  };

  // 2. Función para eliminar una pregunta
  const removeField = (index) => {
    const nuevosCampos = campos.filter((_, i) => i !== index);
    setCampos(nuevosCampos);
  };

  // 3. Función para editar una pregunta (cuando escribes en los inputs)
  const updateField = (index, key, value) => {
    const nuevosCampos = [...campos];
    nuevosCampos[index][key] = value;
    setCampos(nuevosCampos);
  };

  // 4. Guardar cambios
  const handleSave = () => {
    onSave(campos);
  };

  // 5. Función para AGREGAR una opción a un Select
  const addOption = (index) => {
    const nuevosCampos = [...campos];
    const campo = nuevosCampos[index];

    // Usamos un campo temporal 'tempOption' para escribir la nueva opción
    if (!campo.tempOption || campo.tempOption.trim() === "") return;

    // Si no existe el array de opciones, lo creamos
    if (!campo.options) campo.options = [];

    // Agregamos la opción y limpiamos el input temporal
    campo.options.push(campo.tempOption);
    campo.tempOption = ""; 
    
    setCampos(nuevosCampos);
  };

  // 6. Función para ELIMINAR una opción
  const removeOption = (fieldIndex, optionIndex) => {
    const nuevosCampos = [...campos];
    // Borramos la opción específica usando splice
    nuevosCampos[fieldIndex].options.splice(optionIndex, 1);
    setCampos(nuevosCampos);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      
      {/* --- ENCABEZADO DEL EDITOR --- */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Editor de Plantilla</h2>
        <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2">
                <ArrowLeft size={18} /> Cancelar
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded flex items-center gap-2 font-bold shadow">
                <Save size={18} /> Guardar Cambios
            </button>
        </div>
      </div>

      {/* --- LISTA DE PREGUNTAS --- */}
      <div className="space-y-4">
        {campos.map((campo, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-gray-50 items-start md:items-center hover:shadow-md transition-shadow">
            
            {/* Número de pregunta */}
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm shrink-0">
              {index + 1}
            </div>

            {/* Input: Título de la pregunta */}
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-500 font-bold mb-1 uppercase">Etiqueta (Pregunta)</label>
              <input
                type="text"
                value={campo.label}
                onChange={(e) => updateField(index, "label", e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Select: Tipo de input */}
            <div className="w-full md:w-48">
              <label className="block text-xs text-gray-500 font-bold mb-1 uppercase">Tipo de Campo</label>
              <select
                value={campo.tipo}
                onChange={(e) => updateField(index, "tipo", e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {tiposDisponibles.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Select: Quien debe rellenar el campo */}
            <div className="w-full md:w-48">
              <label className="block text-xs text-gray-500 font-bold mb-1 uppercase">Campo para:</label>
              <select
                value={campo.fillBy || "ambos"}
                onChange={(e) => updateField(index, "fillBy", e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {camposPara.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* --- BLOQUE ESPECIAL PARA SELECT --- */}
            {campo.tipo === "select" && (
              <div className="w-full mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg col-span-full">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Opciones de la lista:</h4>
                
                {/* Lista de opciones agregadas */}
                <ul className="mb-3 space-y-2">
                  {campo.options?.map((opt, i) => (
                    <li key={i} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100 shadow-sm text-sm">
                      <span>{opt}</span>
                      <button 
                        onClick={() => removeOption(index, i)}
                        className="text-red-500 hover:text-red-700 font-bold px-2"
                        title="Borrar opción"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                  {(!campo.options || campo.options.length === 0) && (
                    <li className="text-gray-400 text-sm italic">Sin opciones definidas...</li>
                  )}
                </ul>

                {/* Input para agregar nueva opción */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe una opción (ej: Sí/No)"
                    value={campo.tempOption || ""}
                    onChange={(e) => updateField(index, "tempOption", e.target.value)}
                    className="flex-1 p-2 border rounded text-sm focus:outline-none focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addOption(index);
                    }}
                  />
                  <button
                    onClick={() => addOption(index)}
                    className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-bold hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Checkbox: Obligatorio */}
            <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                    type="checkbox" 
                    checked={campo.required || false}
                    onChange={(e) => updateField(index, "required", e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                 />
                 <span className="text-sm text-gray-700">Obligatorio</span>
               </label>
            </div>
            

            {/* Botón: Eliminar */}
            <button 
                onClick={() => removeField(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors mt-4 md:mt-0"
                title="Eliminar pregunta"
            >
                <Trash2 size={20} />
            </button>

          </div>
        ))}

        {campos.length === 0 && (
            <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                No hay preguntas en este formulario. ¡Agrega una!
            </div>
        )}
      </div>

      {/* --- BOTÓN AGREGAR --- */}
      <div className="mt-8 flex justify-center">
        <button 
            onClick={addField}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 shadow-lg hover:scale-105 transition-transform"
        >
            <Plus size={24} /> Agregar Nueva Pregunta
        </button>
      </div>

    </div>
  );
};

export default FormEditor;
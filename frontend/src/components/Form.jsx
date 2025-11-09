import { useForm } from 'react-hook-form';

const Form = ({ title, fields, buttonText, onSubmit, onChange }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };
  return (
    <form className="space-y-6 bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full" onSubmit={handleSubmit(handleFormSubmit)}>
      <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-8">
        {title}
      </h1>
      {fields.map((field, index) => (
        <div key={index} className="space-y-2">
          <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700">
            {field.label}
          </label>
          {field.fieldType === 'input' && (
            <input
              {...register(field.name, {
                required: field.required ? `${field.label} es requerido` : false,
                minLength: field.minLength ? {
                  value: field.minLength,
                  message: `Mínimo ${field.minLength} caracteres`
                } : undefined,
                maxLength: field.maxLength ? {
                  value: field.maxLength,
                  message: `Máximo ${field.maxLength} caracteres`
                } : undefined,
                validate: field.validate
              })}
              type={field.type}
              placeholder={field.placeholder}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-300"
            />
          )}
          {errors[field.name] && (
            <span className="text-red-500 text-sm font-medium">{errors[field.name].message}</span>
          )}
          {field.errorMessageData && (
            <span className="text-red-500 text-sm font-medium">{field.errorMessageData}</span>
          )}
        </div>
      ))}
      <button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
      >
        {buttonText}
      </button>
    </form>
  );
};

export default Form;

import { Link } from 'react-router-dom';

const Error404 = () => {  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 md:p-16 text-center max-w-2xl transform transition-all hover:scale-105">
        <h1 className="text-9xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link 
          to="/home" 
          className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default Error404;

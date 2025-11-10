import axios from './root.service.js';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export async function login(dataUser) {
    try {
        const { email, password } = dataUser;
        const response = await axios.post('/auth/login', {
            email,
            password
        });
        
        const { token, user } = response.data.data;
        
        cookies.set('jwt-auth', token, { path: '/' });
        sessionStorage.setItem('usuario', JSON.stringify(user));
        
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al conectar con el servidor' };
    }
}

export async function register(dataUser) {//le pasa todos los datos que se necesitan para registrar
    try {
        const response = await axios.post('/auth/register', dataUser);
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al conectar con el servidor' };
    }
}

export async function logout() {
    try {
        sessionStorage.removeItem('usuario');
        cookies.remove('jwt-auth', {path: '/'});
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

import axios from 'axios';

const api = axios.create({
    // Si estás en desarrollo usa la IP local, si no, usa la ruta relativa para Nginx
    baseURL: import.meta.env.DEV 
        ? 'http://127.0.0.1:8000/api' 
        : '/api',
});

// Interceptor para el Token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Función para limpiar las URLs de paginación que envía Django
export const cleanPaginationUrl = (url: string | null) => {
    if (!url) return null;
    
    // Esta lógica quita el protocolo y el dominio (http://dominio.com)
    // Pero también quita el '/api' inicial si existe, para que Axios 
    // no lo duplique al usar su propio baseURL.
    return url.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/api/, '');
};

export default api;
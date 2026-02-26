import api from './api';

const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('token');
};

const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
}

const authService = {
    register,
    login,
    logout,
    getCurrentUser
};

export default authService;

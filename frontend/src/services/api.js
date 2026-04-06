export const BASE_URL = 'http://127.0.0.1:5000';
const API_URL = `${BASE_URL}/api`;

const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }


    try {
        const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        
        if (response.status === 401) {
            const data = await response.json().catch(() => ({}));
            
            // For any 401, clear local storage and redirect to login
            // Skip redirecting if we're already on the login or register page
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                console.warn('Session expired or invalid token. Redirecting to login.');
                
                // Use a non-resolving promise to "hang" the caller and prevent error state flashes
                window.location.href = '/login?message=session_expired';
                return new Promise(() => {});
            }
            throw new Error(data.message || 'Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error.message);
        throw error;
    }
};

export const fetchProducts = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiCall(`/products?${query}`);
};

export const fetchCategories = async () => {
    return apiCall('/categories');
};

export const initializePayment = async (paymentData) => {
    return apiCall('/payment/initialize', {
        method: 'POST',
        body: JSON.stringify(paymentData)
    });
};

export const verifyPayment = async (reference) => {
    return apiCall(`/payment/verify/${reference}`);
};

export const fetchProductReviews = async (productId) => {
    return apiCall(`/reviews/${productId}`);
};

export const submitReview = async (productId, data) => {
    return apiCall(`/reviews/${productId}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const deleteReview = async (reviewId) => {
    return apiCall(`/reviews/${reviewId}`, { method: 'DELETE' });
};

// --- Order API Endpoints ---
export const fetchUserOrders = async () => {
    return apiCall('/orders/myorders');
};

export const fetchOrderById = async (id) => {
    return apiCall(`/orders/${id}`);
};

export const fetchAllOrders = async () => {
    return apiCall('/orders');
};

export const updateOrderStatus = async (id, data) => {
    return apiCall(`/orders/${id}/tracking`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export default apiCall;
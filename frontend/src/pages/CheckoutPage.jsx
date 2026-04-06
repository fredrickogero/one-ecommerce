import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initializePayment } from '../services/api';

const CheckoutPage = () => {
    const { cartItems, cartTotal } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        customerName: user?.name || '',
        customerPhone: user?.phone || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        county: user?.address?.county || ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const { customerName, customerPhone, street, city, county } = formData;
            if (!customerName || !customerPhone || !street || !city || !county) {
                throw new Error('Please fill in all shipping details');
            }

            const data = await initializePayment({
                amount: cartTotal,
                email: user.email,
                items: cartItems,
                customerName,
                customerPhone,
                shippingAddress: { street, city, county }
            });

            // Redirect user to Paystack checkout
            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                throw new Error('No authorization URL received');
            }
        } catch (err) {
            setError(err.message || 'Could not connect to payment server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-main min-h-screen container" style={{ padding: '60px 20px' }}>
            <div className="product-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Finalize Order</h2>
                
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Number of items:</span>
                        <span style={{ fontWeight: '600' }}>{cartItems.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800' }}>
                        <span>Order Total:</span>
                        <span style={{ color: '#007185' }}>KES {cartTotal.toLocaleString()}</span>
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#333' }}>Shipping Details</h3>
                    <input 
                        type="text" name="customerName" placeholder="Full Name" 
                        value={formData.customerName} onChange={handleChange}
                        className="category-pill" style={{ width: '100%', marginBottom: '10px' }} required 
                    />
                    <input 
                        type="text" name="customerPhone" placeholder="Phone Number" 
                        value={formData.customerPhone} onChange={handleChange}
                        className="category-pill" style={{ width: '100%', marginBottom: '10px' }} required 
                    />
                    <input 
                        type="text" name="street" placeholder="Street / Area" 
                        value={formData.street} onChange={handleChange}
                        className="category-pill" style={{ width: '100%', marginBottom: '10px' }} required 
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" name="city" placeholder="City" 
                            value={formData.city} onChange={handleChange}
                            className="category-pill" style={{ flex: 1, marginBottom: '10px' }} required 
                        />
                        <input 
                            type="text" name="county" placeholder="County" 
                            value={formData.county} onChange={handleChange}
                            className="category-pill" style={{ flex: 1, marginBottom: '10px' }} required 
                        />
                    </div>
                </div>

                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</p>}

                <button 
                    className="btn-view" 
                    style={{ padding: '18px', fontSize: '1.1rem' }}
                    onClick={handleCheckout}
                    disabled={loading}
                >
                    {loading ? 'Initializing Paystack...' : 'Pay with Paystack'}
                </button>
                
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    You will be redirected to Paystack's secure payment gateway.
                </p>
            </div>
        </div>
    );
};

export default CheckoutPage;

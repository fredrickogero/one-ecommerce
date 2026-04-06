import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserOrders } from '../services/api';
import './UserOrdersPage.css'; // We'll create a basic CSS file for it or use inline styles

const UserOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await fetchUserOrders();
                setOrders(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    if (loading) return <div className="loading-spinner">Loading orders...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="orders-page-container">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
                <div className="no-orders">
                    <p>You have no orders yet.</p>
                    <Link to="/" className="btn-primary">Start Shopping</Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <span className="order-id">Order #{order._id.substring(0, 8)}</span>
                                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className={`order-status status-${order.trackingStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {order.trackingStatus}
                                </span>
                            </div>
                            <div className="order-body">
                                <ul>
                                    {order.products.map(item => (
                                        <li key={item.product._id}>
                                            <span className="product-name">{item.product.name}</span>
                                            <span className="product-qty">Qty: {item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="order-total">
                                    Total: {order.currency} {order.totalAmount}
                                </div>
                            </div>
                            <div className="order-footer">
                                <Link to={`/orders/track/${order._id}`} className="btn-primary track-btn">
                                    Track Order
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserOrdersPage;

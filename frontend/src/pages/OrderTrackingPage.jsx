import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrderById } from '../services/api';
import './OrderTrackingPage.css';

const trackingSteps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const OrderTrackingPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const data = await fetchOrderById(id);
                setOrder(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id]);

    if (loading) return <div className="loading-spinner">Loading tracking details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!order) return <div className="error-message">Order not found.</div>;

    const currentStatusIndex = trackingSteps.indexOf(order.trackingStatus);

    return (
        <div className="tracking-page-container">
            <Link to="/orders" className="back-link">&larr; Back to My Orders</Link>
            
            <div className="tracking-header">
                <h2>Tracking Order #{order._id.substring(0, 8)}</h2>
                <span className={`status-badge status-${order.trackingStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {order.trackingStatus}
                </span>
            </div>

            <div className="tracking-timeline-container">
                <ul className="timeline">
                    {trackingSteps.map((step, index) => {
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        const historyItem = order.trackingHistory?.find(h => h.status === step);

                        return (
                            <li key={step} className={`timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                <div className="timeline-icon">
                                    {isCompleted ? '✓' : ''}
                                </div>
                                <div className="timeline-content">
                                    <h3>{step}</h3>
                                    {historyItem && (
                                        <div className="timeline-details">
                                            <p className="timeline-date">{new Date(historyItem.timestamp).toLocaleString()}</p>
                                            <p className="timeline-note">{historyItem.note}</p>
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="tracking-order-summary">
                <h3>Order Summary</h3>
                <ul>
                    {order.products.map(item => (
                        <li key={item.product._id}>
                            <span>{item.product.name} x {item.quantity}</span>
                            <span>{order.currency} {item.product.price * item.quantity}</span>
                        </li>
                    ))}
                </ul>
                <div className="summary-total">
                    <strong>Total:</strong> {order.currency} {order.totalAmount}
                </div>
            </div>

            {order.shippingAddress && (
                <div className="tracking-order-summary" style={{ marginTop: '20px' }}>
                    <h3>Delivery Address</h3>
                    <p style={{ color: '#555' }}>
                        {order.customerName}<br />
                        {order.customerPhone}<br />
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.county}
                    </p>
                </div>
            )}
        </div>
    );
};

export default OrderTrackingPage;

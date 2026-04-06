import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { verifyPayment } from '../services/api';

const VerifyPayment = () => {
    const [searchParams] = useSearchParams();
    const reference = searchParams.get('reference');
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Please wait while we verify your payment...');
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const verificationStarted = useRef(false);

    useEffect(() => {
        if (!reference) {
            setStatus('error');
            setMessage('Invalid payment reference');
            return;
        }

        if (verificationStarted.current) return;
        verificationStarted.current = true;

        const performVerification = async () => {
            try {
                const data = await verifyPayment(reference);

                if (data.status === 'success') {
                    setStatus('success');
                    setMessage('Payment successful! Your order has been placed.');
                    clearCart();
                    setTimeout(() => navigate('/'), 5000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Payment verification failed');
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Error connecting to verification server');
            }
        };

        performVerification();
    }, [reference, navigate, clearCart]);

    return (
        <div className="bg-main min-h-screen container" style={{ padding: '100px 20px', textAlign: 'center' }}>
            <div className="product-card" style={{ padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
                {status === 'verifying' && (
                    <div style={{ padding: '20px' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #007185', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                        <h2>Verifying Payment</h2>
                        <p style={{ color: '#64748b', marginTop: '10px' }}>{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ padding: '20px' }}>
                        <div style={{ fontSize: '3rem', color: '#27ae60', marginBottom: '20px' }}>✓</div>
                        <h2 style={{ color: '#27ae60' }}>Thank You!</h2>
                        <p style={{ color: '#64748b', margin: '15px 0' }}>{message}</p>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Redirecting to home page in 5 seconds...</p>
                        <button className="btn-view" style={{ marginTop: '30px' }} onClick={() => navigate('/')}>Return Home Now</button>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ padding: '20px' }}>
                        <div style={{ fontSize: '3rem', color: '#e44d26', marginBottom: '20px' }}>✕</div>
                        <h2 style={{ color: '#e44d26' }}>Payment Failed</h2>
                        <p style={{ color: '#64748b', margin: '15px 0' }}>{message}</p>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <button className="btn-view" style={{ flex: 1 }} onClick={() => navigate('/checkout')}>Try Again</button>
                            <button className="btn-view" style={{ flex: 1, background: '#64748b' }} onClick={() => navigate('/')}>Return Home</button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default VerifyPayment;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                if (data.devToken) {
                    console.log('Dev Token:', data.devToken);
                    setMessage(data.message + " (Check console for link)");
                }
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f4f7f9' }}>
            <div className="product-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Reset Password</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '0.9rem' }}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                
                {message && <div style={{ color: '#27ae60', background: '#dcfce7', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}
                {error && <div style={{ color: '#e44d26', background: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '25px' }}>
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            className="category-pill" 
                            style={{ width: '100%', borderRadius: '8px', padding: '12px', border: '1px solid #ddd' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="btn-view" style={{ width: '100%', padding: '15px' }} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <Link to="/login" style={{ color: '#007185', fontSize: '0.9rem' }}>Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

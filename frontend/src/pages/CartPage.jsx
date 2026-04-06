import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="bg-main min-h-screen container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                <div className="product-card" style={{ padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '20px', color: '#64748b' }}>Your cart is empty</h2>
                    <p style={{ marginBottom: '30px', color: '#94a3b8' }}>Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/">
                        <button className="btn-view" style={{ maxWidth: '200px' }}>Start Shopping</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-main min-h-screen">
            <header className="main-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" className="logo">Jumia-Jiji Plus</Link>
                    <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Shopping Cart</h1>
                    <button className="btn-view" style={{ marginTop: 0, width: 'auto', background: 'none', color: '#666' }} onClick={() => navigate(-1)}>Back</button>
                </div>
            </header>

            <div className="container" style={{ padding: '40px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                    <div className="product-card" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <h2 style={{ fontSize: '1.2rem' }}>Items ({cartItems.length})</h2>
                            <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#e44d26', cursor: 'pointer', fontWeight: '600' }}>Clear Cart</button>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Your Shopping Cart</h2>
                        {cartItems.map(item => (
                            <div key={item._id} style={{ display: 'flex', gap: '20px', padding: '20px', background: '#fff', borderRadius: '12px', marginBottom: '15px', alignItems: 'center' }}>
                                <img
                                    src={item.images && item.images[0] ? (item.images[0].startsWith('http') ? item.images[0] : `http://127.0.0.1:5000${item.images[0]}`) : 'https://via.placeholder.com/150'}
                                    alt={item.name}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{item.name}</h3>
                                    <p style={{ color: '#007185', fontWeight: '800' }}>KES {item.price.toLocaleString()}</p>
                                    {item.stock < item.quantity && (
                                        <p style={{ color: '#e44d26', fontSize: '0.85rem', fontWeight: '600', margin: '5px 0' }}>
                                            ⚠ Only {item.stock} left in stock. Please reduce quantity.
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ width: '25px', height: '25px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ width: '25px', height: '25px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                            <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Order Summary</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <span>Items ({cartItems.length}):</span>
                                <span>KES {cartTotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.2rem', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                                <span>Order Total:</span>
                                <span style={{ color: '#b42b09' }}>KES {cartTotal.toLocaleString()}</span>
                            </div>
                            <button
                                className="btn-view"
                                style={{ width: '100%', padding: '15px', marginTop: '30px' }}
                                onClick={() => navigate('/checkout')}
                                disabled={cartItems.some(i => i.quantity > i.stock)}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                        <div style={{ padding: '0 10px', fontSize: '0.85rem', color: '#94a3b8' }}>
                            <p>🔒 Secure Checkout with Paystack</p>
                            <p style={{ marginTop: '5px' }}>Return policy: 7-day money back guarantee</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;

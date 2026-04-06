import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchProducts, fetchCategories, BASE_URL } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
    const { cartCount } = useCart();
    const { user, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ search: '', category: '', condition: '' });
    const [selectedProduct, setSelectedProduct] = useState(null);

    const loadProducts = async (currentFilters) => {
        try {
            const data = await fetchProducts(currentFilters);
            setProducts(data);
        } catch (err) {
            setError(`Connection Error: ${err.message}`);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [pData, cData] = await Promise.all([
                    fetchProducts(filters),
                    fetchCategories()
                ]);
                setProducts(pData);
                setCategories(cData);
            } catch (err) {
                setError(`Connection Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        loadProducts(newFilters);
    };

    if (loading) return <div className="animate-fade-in" style={{ padding: '100px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #007185', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <p style={{ marginTop: '20px', color: '#2c0505ff' }}>Connecting to Kenya Marketplace...</p>
    </div>;
    
    return (
        <div className="bg-main min-h-screen">
            <header className="main-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a href="/" className="logo">Jumia-Jiji Plus</a>
                    <div style={{ flex: 1, margin: '0 40px' }}>
                        <input 
                            type="text" 
                            placeholder="Search products, brands and categories in Kenya..." 
                            className="category-pill"
                            style={{ width: '100%', borderRadius: '50px', padding: '12px 25px', border: '1px solid #e2e8f0' }}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <Link to="/cart" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.4rem' }}>🛒</span>
                            {cartCount > 0 && (
                                <span style={{ 
                                    position: 'absolute', top: '-8px', right: '-10px', 
                                    background: '#b42b09ff', color: '#fff', borderRadius: '50%', 
                                    padding: '2px 6px', fontSize: '0.7rem', fontWeight: '800' 
                                }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Kenya | KES</span>
                        {user ? (
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.name}</span>
                                <button className="btn-view" style={{ marginTop: 0, padding: '8px 15px', background: '#ccc' }} onClick={logout}>Logout</button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <button className="btn-view" style={{ marginTop: 0, padding: '8px 20px' }}>Login</button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>


            <div className="container">
                {error && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#e44d26', background: '#fff5f2', margin: '20px 0', borderRadius: '8px' }}>
                        <p><strong>{error}</strong></p>
                        <p style={{ fontSize: '0.9rem' }}>Please verify the backend is running at http://127.0.0.1:5000</p>
                    </div>
                )}
                
                <nav className="category-nav">
                    <button 
                        className="category-pill" 
                        style={!filters.category ? { background: '#007185', color: '#fff', borderColor: '#007185' } : {}}
                        onClick={() => handleFilterChange('category', '')}
                    >
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat._id} 
                            className="category-pill"
                            style={filters.category === cat._id ? { background: '#007185', color: '#fff', borderColor: '#007185' } : {}}
                            onClick={() => handleFilterChange('category', cat._id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </nav>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666', marginRight: '10px' }}>Filter:</span>
                    <button 
                        className="category-pill" 
                        style={filters.condition === 'new' ? { background: '#27ae60', color: '#fff', borderColor: '#27ae60' } : {}}
                        onClick={() => handleFilterChange('condition', filters.condition === 'new' ? '' : 'new')}
                    >
                        New Only
                    </button>
                    <button 
                        className="category-pill" 
                        style={filters.condition === 'used' ? { background: '#f39c12', color: '#fff', borderColor: '#f39c12' } : {}}
                        onClick={() => handleFilterChange('condition', filters.condition === 'used' ? '' : 'used')}
                    >
                        Used/Refurbished
                    </button>
                </div>

                <main>
                    <div className="product-grid">
                        {products.length > 0 ? (
                            products.map((product, index) => (
                                <div 
                                    key={product._id} 
                                    className="animate-fade-in" 
                                    style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }}
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0' }}>
                                <h2 style={{ color: '#ccc' }}>No products found</h2>
                                <p style={{ color: '#999' }}>Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                    background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', 
                    justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' 
                }} onClick={() => setSelectedProduct(null)}>
                    <div style={{ 
                        background: '#fff', width: '90%', maxWidth: '900px', maxHeight: '90vh', 
                        overflowY: 'auto', borderRadius: '16px', padding: '40px', position: 'relative' 
                    }} onClick={e => e.stopPropagation()}>
                        <button style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSelectedProduct(null)}>✕</button>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                            <div>
                                <img 
                                    src={selectedProduct.images && selectedProduct.images[0] ? (selectedProduct.images[0].startsWith('http') ? selectedProduct.images[0] : `${BASE_URL}${selectedProduct.images[0]}`) : 'https://via.placeholder.com/500'} 
                                    alt={selectedProduct.name} 
                                    style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                            </div>
                            <div>
                                <span className={`badge-condition ${selectedProduct.condition === 'new' ? 'badge-new' : 'badge-used'}`} style={{ position: 'static', display: 'inline-block', marginBottom: '10px' }}>
                                    {selectedProduct.condition}
                                </span>
                                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{selectedProduct.name}</h2>
                                <p style={{ fontSize: '1.8rem', color: '#007185', fontWeight: '800', marginBottom: '20px' }}>
                                    KES {selectedProduct.price.toLocaleString()}
                                </p>
                                
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <p style={{ fontWeight: '600', marginBottom: '10px' }}>Description</p>
                                    <p style={{ color: '#475569' }}>{selectedProduct.description}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', fontSize: '0.9rem', marginBottom: '30px' }}>
                                    <div style={{ color: '#666' }}>📍 Location: <strong>{selectedProduct.location?.city}, {selectedProduct.location?.county}</strong></div>
                                    <div style={{ color: '#666' }}>⭐ Rating: <strong>{selectedProduct.ratings?.average} ({selectedProduct.ratings?.count} reviews)</strong></div>
                                    <div style={{ color: '#666' }}>🛍️ Seller: <strong>{selectedProduct.seller?.name || 'Verified Partner'}</strong></div>
                                    <div style={{ color: '#666' }}>📅 Added: <strong>{new Date(selectedProduct.createdAt).toLocaleDateString()}</strong></div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button className="btn-view" style={{ flex: 2, padding: '15px' }}>Contact Seller</button>
                                    <button className="btn-view" style={{ flex: 1, padding: '15px', background: '#e44d26' }}>Make Offer</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default HomePage;

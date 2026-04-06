import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import apiCall, { fetchProductReviews, submitReview, deleteReview, BASE_URL } from '../services/api';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartCount } = useCart();
    const { user, logout } = useAuth();

    const [product, setProduct]     = useState(null);
    const [reviews, setReviews]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [activeImg, setActiveImg] = useState(0);

    // Review form
    const [myRating, setMyRating]   = useState(0);
    const [comment, setComment]     = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');

    const imgBase = (src) =>
        src ? (src.startsWith('http') ? src : `${BASE_URL}${src}`) :
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80';

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                // Fetch product first — this is critical
                const prod = await apiCall(`/products/${id}`);
                setProduct(prod);
                // Reviews are non-critical — don't fail the page if this errors
                try {
                    const revs = await fetchProductReviews(id);
                    setReviews(revs);
                } catch (_) {
                    setReviews([]);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const alreadyReviewed = user && reviews.some(r => r.user?._id === user._id);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setReviewError('');
        setReviewSuccess('');
        if (myRating === 0) { setReviewError('Please select a star rating.'); return; }
        setSubmitting(true);
        try {
            const newReview = await submitReview(id, { rating: myRating, comment });
            setReviews([newReview, ...reviews]);
            setProduct(prev => ({
                ...prev,
                ratings: {
                    average: Math.round(([newReview, ...reviews].reduce((s, r) => s + r.rating, 0) / (reviews.length + 1)) * 10) / 10,
                    count: reviews.length + 1
                }
            }));
            setMyRating(0);
            setComment('');
            setReviewSuccess('Your review has been submitted!');
        } catch (e) {
            setReviewError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await deleteReview(reviewId);
            const updated = reviews.filter(r => r._id !== reviewId);
            setReviews(updated);
            const avg = updated.length ? Math.round((updated.reduce((s, r) => s + r.rating, 0) / updated.length) * 10) / 10 : 0;
            setProduct(prev => ({ ...prev, ratings: { average: avg, count: updated.length } }));
        } catch (e) { alert(e.message); }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #007185', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 20, color: '#64748b', fontWeight: 600 }}>Loading product…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (error || !product) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <p style={{ color: '#e44d26', fontWeight: 700, fontSize: '1.2rem' }}>⚠ {error || 'Product not found'}</p>
            <button onClick={() => navigate('/')} className="btn-view" style={{ marginTop: 20 }}>← Back to Home</button>
        </div>
    );

    const images = product.images?.length ? product.images : [];

    return (
        <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Inter', sans-serif" }}>

            {/* ── NAV ─────────────────────────────────────────── */}
            <header className="main-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" className="logo" style={{ textDecoration: 'none' }}>Jumia-Jiji Plus</Link>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <Link to="/cart" style={{ textDecoration: 'none', position: 'relative' }}>
                            <span style={{ fontSize: '1.4rem' }}>🛒</span>
                            {cartCount > 0 && (
                                <span style={{ position: 'absolute', top: -8, right: -10, background: '#b42b09', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 800 }}>{cartCount}</span>
                            )}
                        </Link>
                        {user ? (
                            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
                                <button className="btn-view" style={{ marginTop: 0, padding: '8px 15px', background: '#ccc' }} onClick={logout}>Logout</button>
                            </div>
                        ) : (
                            <Link to="/login"><button className="btn-view" style={{ marginTop: 0, padding: '8px 20px' }}>Login</button></Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="container" style={{ paddingTop: 30, paddingBottom: 60 }}>
                {/* Breadcrumb */}
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Link to="/" style={{ color: '#007185', textDecoration: 'none' }}>Home</Link>
                    <span>/</span>
                    <span style={{ color: '#334155', fontWeight: 600 }}>{product.name}</span>
                </div>

                {/* ── PRODUCT DETAIL CARD ───────────────────────── */}
                <div style={{
                    background: '#fff', borderRadius: 20, boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
                    padding: '40px', display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48
                }}>
                    {/* IMAGE GALLERY */}
                    <div>
                        <div style={{ borderRadius: 16, overflow: 'hidden', background: '#f8fafc', marginBottom: 12, aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                                src={images[activeImg] ? imgBase(images[activeImg]) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80'}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>
                        {images.length > 1 && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                {images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={imgBase(img)}
                                        alt=""
                                        onClick={() => setActiveImg(i)}
                                        style={{
                                            width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                                            border: activeImg === i ? '2px solid #007185' : '2px solid transparent',
                                            opacity: activeImg === i ? 1 : 0.65, transition: 'all 0.2s'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DETAILS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className={`badge-condition ${product.condition === 'new' ? 'badge-new' : 'badge-used'}`} style={{ position: 'static', display: 'inline-block' }}>
                                {product.condition}
                            </span>
                            {product.category?.name && (
                                <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: 20, padding: '3px 12px', fontSize: '0.78rem', fontWeight: 600 }}>{product.category.name}</span>
                            )}
                        </div>

                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2, margin: 0 }}>{product.name}</h1>

                        {/* Rating summary */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <StarRating value={product.ratings?.average || 0} readonly size={22} />
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f5a623' }}>
                                {product.ratings?.average > 0 ? product.ratings.average.toFixed(1) : '—'}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                ({product.ratings?.count || 0} review{product.ratings?.count !== 1 ? 's' : ''})
                            </span>
                        </div>

                        <p style={{ fontSize: '2.4rem', fontWeight: 900, color: '#007185', margin: 0 }}>
                            KES {product.price.toLocaleString()}
                        </p>

                        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '18px 20px' }}>
                            <p style={{ fontWeight: 700, marginBottom: 8, color: '#334155' }}>Description</p>
                            <p style={{ color: '#475569', lineHeight: 1.7, margin: 0 }}>{product.description}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.88rem' }}>
                            {product.location?.city && (
                                <div style={{ background: '#f1f5f9', borderRadius: 10, padding: '10px 14px' }}>
                                    <span style={{ color: '#94a3b8' }}>📍 Location</span>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{product.location.city}, {product.location.county}</p>
                                </div>
                            )}
                            <div style={{ background: '#f1f5f9', borderRadius: 10, padding: '10px 14px' }}>
                                <span style={{ color: '#94a3b8' }}>🛍️ Seller</span>
                                <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{product.seller?.name || 'Verified Partner'}</p>
                            </div>
                            <div style={{ background: '#f1f5f9', borderRadius: 10, padding: '10px 14px' }}>
                                <span style={{ color: '#94a3b8' }}>📅 Listed</span>
                                <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{new Date(product.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div style={{ background: '#f1f5f9', borderRadius: 10, padding: '10px 14px' }}>
                                <span style={{ color: '#94a3b8' }}>📦 Stock</span>
                                <p style={{ margin: 0, fontWeight: 700, color: product.stock > 0 ? '#059669' : '#e44d26' }}>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
                            </div>
                        </div>

                        <button
                            className="btn-view"
                            style={{ padding: '16px', fontSize: '1rem', fontWeight: 700, borderRadius: 12, opacity: product.stock === 0 ? 0.5 : 1 }}
                            disabled={product.stock === 0}
                            onClick={() => addToCart(product)}
                        >
                            {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                        </button>
                    </div>
                </div>

                {/* ── REVIEWS SECTION ───────────────────────────── */}
                <div style={{ marginTop: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: 24 }}>
                        Customer Reviews
                        {reviews.length > 0 && <span style={{ marginLeft: 10, fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>({reviews.length})</span>}
                    </h2>

                    {/* SUBMIT FORM */}
                    {user && !alreadyReviewed && (
                        <div style={{
                            background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)',
                            borderRadius: 16, padding: '30px', marginBottom: 32,
                            border: '1px solid #bae6fd', boxShadow: '0 2px 12px rgba(0,113,133,0.08)'
                        }}>
                            <h3 style={{ margin: '0 0 4px', color: '#0c4a6e', fontWeight: 700 }}>Leave a Review</h3>
                            <p style={{ margin: '0 0 20px', color: '#475569', fontSize: '0.9rem' }}>Share your experience with this product</p>

                            <form onSubmit={handleSubmitReview}>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: 8 }}>Your Rating *</label>
                                    <StarRating value={myRating} onChange={setMyRating} size={34} />
                                    {myRating > 0 && (
                                        <span style={{ marginLeft: 12, color: '#007185', fontWeight: 600, fontSize: '0.9rem' }}>
                                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][myRating]}
                                        </span>
                                    )}
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: 8 }}>Comment (optional)</label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="Tell others what you think about this product..."
                                        rows={4}
                                        style={{
                                            width: '100%', borderRadius: 10, border: '1.5px solid #bae6fd',
                                            padding: '12px 14px', fontSize: '0.95rem', resize: 'vertical',
                                            outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                                            background: '#fff', transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#007185'}
                                        onBlur={e => e.target.style.borderColor = '#bae6fd'}
                                    />
                                </div>

                                {reviewError   && <p style={{ color: '#e44d26', fontWeight: 600, marginBottom: 12 }}>⚠ {reviewError}</p>}
                                {reviewSuccess && <p style={{ color: '#059669', fontWeight: 600, marginBottom: 12 }}>✓ {reviewSuccess}</p>}

                                <button
                                    type="submit"
                                    className="btn-view"
                                    disabled={submitting}
                                    style={{ padding: '12px 32px', borderRadius: 10, fontWeight: 700 }}
                                >
                                    {submitting ? 'Submitting…' : '✓ Submit Review'}
                                </button>
                            </form>
                        </div>
                    )}

                    {user && alreadyReviewed && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '14px 20px', marginBottom: 24, color: '#166534', fontWeight: 600 }}>
                            ✓ You've already reviewed this product. Thank you!
                        </div>
                    )}

                    {!user && (
                        <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: 12, padding: '14px 20px', marginBottom: 24, color: '#854d0e' }}>
                            <Link to="/login" style={{ color: '#007185', fontWeight: 700 }}>Login</Link> to leave a review.
                        </div>
                    )}

                    {/* REVIEWS LIST */}
                    {reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                            <div style={{ fontSize: '3rem' }}>⭐</div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 12 }}>No reviews yet</p>
                            <p style={{ fontSize: '0.9rem' }}>Be the first to review this product!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {reviews.map(r => (
                                <div key={r._id} style={{
                                    background: '#fff', borderRadius: 16, padding: '24px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex', gap: 16, alignItems: 'flex-start'
                                }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: 46, height: 46, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#007185,#00a99d)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0
                                    }}>
                                        {(r.user?.name || '?')[0].toUpperCase()}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{r.user?.name || 'Anonymous'}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                    <StarRating value={r.rating} readonly size={16} />
                                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                        {new Date(r.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            {user?.role === 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteReview(r._id)}
                                                    style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: '#b91c1c', fontWeight: 600, fontSize: '0.8rem' }}
                                                >
                                                    🗑 Delete
                                                </button>
                                            )}
                                        </div>
                                        {r.comment && (
                                            <p style={{ margin: '12px 0 0', color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>{r.comment}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ProductPage;

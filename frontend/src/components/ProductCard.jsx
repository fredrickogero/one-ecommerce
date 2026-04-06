import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';
import { BASE_URL } from '../services/api';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    return (
        <div className="product-card" style={{ cursor: 'default' }}>
            <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-image-container">
                    <span className={`badge-condition ${product.condition === 'new' ? 'badge-new' : 'badge-used'}`}>
                        {product.condition}
                    </span>
                    <img
                        src={product.images && product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${BASE_URL}${product.images[0]}`) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'}
                        alt={product.name}
                        className="product-image"
                    />
                </div>
                <div className="product-content">
                    <div className="product-price">
                        {product.currency} {product.price.toLocaleString()}
                    </div>
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-meta" style={{ flexDirection: 'column', gap: 4 }}>
                        <span>📍 {product.location?.city}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <StarRating value={product.ratings?.average || 0} readonly size={14} />
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                {product.ratings?.average > 0 ? product.ratings.average.toFixed(1) : 'No ratings'}
                                {product.ratings?.count > 0 && ` (${product.ratings.count})`}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
            <div style={{ padding: '0 16px 16px' }}>
                <button 
                    className="btn-view" 
                    style={{ width: '100%', opacity: product.stock === 0 ? 0.5 : 1 }} 
                    disabled={product.stock === 0}
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                    }}>
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;

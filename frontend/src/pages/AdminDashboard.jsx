import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCall, { fetchProducts, fetchCategories, fetchAllOrders, updateOrderStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '', price: '', category: '', condition: 'new', description: '', city: 'Nairobi', county: 'Nairobi', stock: 1
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('products'); // 'products', 'categories', 'users', 'orders'
    const [orders, setOrders] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const data = await apiCall('/users');
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOrdersData = async () => {
        try {
            const data = await fetchAllOrders();
            setOrders(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (view === 'users') fetchUsers();
        if (view === 'orders') fetchOrdersData();
    }, [view]);

    const handleRoleUpdate = async (id, newRole) => {
        try {
            await apiCall(`/users/${id}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole })
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const added = await apiCall('/categories', {
                method: 'POST',
                body: JSON.stringify(newCategory)
            });
            setCategories([...categories, added]);
            setNewCategory({ name: '', description: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure? This may affect products in this category.')) return;
        try {
            await apiCall(`/categories/${id}`, {
                method: 'DELETE'
            });
            setCategories(categories.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const loadData = async () => {
            try {
                const [pData, cData] = await Promise.all([fetchProducts(), fetchCategories()]);
                setProducts(pData);
                setCategories(cData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user, navigate]);

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await apiCall(`/products/${id}`, {
                method: 'DELETE'
            });
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete product');
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(prev => [...prev, ...files]);
        
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...urls]);
    };

    const removeSelectedImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            
            formData.append('name', newProduct.name);
            formData.append('description', newProduct.description);
            formData.append('price', String(newProduct.price));
            formData.append('category', newProduct.category);
            formData.append('condition', newProduct.condition);
            formData.append('stock', String(newProduct.stock));
            formData.append('city', newProduct.city);
            formData.append('county', newProduct.county);
            
            if (selectedImages.length > 0) {
                selectedImages.forEach(image => {
                    formData.append('images', image);
                });
            }

            const addedProduct = await apiCall('/products', {
                method: 'POST',
                headers: { }, // Content-Type is auto-set by browser for FormData
                body: formData,
                isFormData: true // Hint to our apiCall although it's not strictly needed if we don't set Content-Type
            });
            
            setProducts([addedProduct, ...products]);
            setShowAddModal(false);
            setNewProduct({ name: '', price: '', category: '', condition: 'new', description: '', city: 'Nairobi', county: 'Nairobi', stock: 1 });
            setSelectedImages([]);
            setPreviewUrls([]);
        } catch (err) {
            console.error(err);
            alert(`Failed to save product: ${err.message}`);
        }
    };

    const [editingProduct, setEditingProduct] = useState(null);

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            
            formData.append('name', editingProduct.name);
            formData.append('description', editingProduct.description);
            formData.append('price', String(editingProduct.price));
            formData.append('category', editingProduct.category?._id || editingProduct.category);
            formData.append('condition', editingProduct.condition);
            formData.append('stock', String(editingProduct.stock || 0));
            formData.append('city', editingProduct.city || 'Nairobi');
            formData.append('county', editingProduct.county || 'Nairobi');
            
            if (selectedImages.length > 0) {
                selectedImages.forEach(image => {
                    formData.append('images', image);
                });
            }

            const updated = await apiCall(`/products/${editingProduct._id}`, {
                method: 'PUT',
                body: formData
            });
            
            setProducts(products.map(p => p._id === updated._id ? updated : p));
            setEditingProduct(null);
            setSelectedImages([]);
            setPreviewUrls([]);
        } catch (err) {
            console.error(err);
            alert(`Failed to update product: ${err.message}`);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Admin Panel...</div>;

    // ... inside return, update table and add modal ...
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            {/* ... */}
            <div style={{ width: '260px', background: '#007185', color: '#fff', padding: '30px' }}>
                <h2 style={{ marginBottom: '40px' }}>Admin Panel</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button 
                        onClick={() => setView('products')}
                        style={{ background: view === 'products' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer' }}
                    >
                        Products
                    </button>
                    <button 
                        onClick={() => setView('categories')}
                        style={{ background: view === 'categories' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer' }}
                    >
                        Categories
                    </button>
                    <button 
                        onClick={() => setView('users')}
                        style={{ background: view === 'users' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer' }}
                    >
                        Users
                    </button>
                    <button 
                        onClick={() => setView('orders')}
                        style={{ background: view === 'orders' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer' }}
                    >
                        Orders
                    </button>
                    <div style={{ marginTop: 'auto', paddingTop: '50px' }}>
                        <button onClick={logout} style={{ color: '#ff7675', border: 'none', background: 'none', cursor: 'pointer' }}>Logout</button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '40px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1>{view === 'products' ? 'Product Management' : view === 'categories' ? 'Category Management' : view === 'orders' ? 'Order Management' : 'User Management'}</h1>
                        <p style={{ color: '#64748b' }}>Manage your marketplace listings, structure, and staff.</p>
                    </div>
                    {view === 'products' ? (
                        <button className="btn-view" style={{ marginTop: 0 }} onClick={() => setShowAddModal(true)}>+ Add New Product</button>
                    ) : null}
                </header>

                {view === 'products' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                            <div className="product-card" style={{ padding: '30px', textAlign: 'center' }}>
                                <h3 style={{ color: '#64748b', fontSize: '1rem' }}>Total Products</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#007185' }}>{products.length}</p>
                            </div>
                            <div className="product-card" style={{ padding: '30px', textAlign: 'center' }}>
                                <h3 style={{ color: '#64748b', fontSize: '1rem' }}>Total Categories</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#27ae60' }}>{categories.length}</p>
                            </div>
                            <div className="product-card" style={{ padding: '30px', textAlign: 'center' }}>
                                <h3 style={{ color: '#64748b', fontSize: '1rem' }}>Active Sellers</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f39c12' }}>1</p>
                            </div>
                        </div>

                        {/* Category Filter Pills (To match Frontend) */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '10px' }}>
                            <button 
                                onClick={() => setCategoryFilter('')}
                                style={{ 
                                    padding: '8px 16px', borderRadius: '20px', border: '1px solid #007185',
                                    background: categoryFilter === '' ? '#007185' : 'transparent',
                                    color: categoryFilter === '' ? '#fff' : '#007185',
                                    cursor: 'pointer', whiteSpace: 'nowrap'
                                }}
                            >
                                All Products
                            </button>
                            {categories.map(cat => (
                                <button 
                                    key={cat._id}
                                    onClick={() => setCategoryFilter(cat._id)}
                                    style={{ 
                                        padding: '8px 16px', borderRadius: '20px', border: '1px solid #007185',
                                        background: categoryFilter === cat._id ? '#007185' : 'transparent',
                                        color: categoryFilter === cat._id ? '#fff' : '#007185',
                                        cursor: 'pointer', whiteSpace: 'nowrap'
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="product-card" style={{ padding: '30px' }}>
                            <h2 style={{ marginBottom: '20px' }}>Recent Listings</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                        <th style={{ padding: '15px' }}>Product</th>
                                        <th style={{ padding: '15px' }}>Category</th>
                                        <th style={{ padding: '15px' }}>Price</th>
                                        <th style={{ padding: '15px' }}>Condition</th>
                                        <th style={{ padding: '15px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products
                                        .filter(p => !categoryFilter || (p.category?._id || p.category) === categoryFilter)
                                        .map(p => (
                                        <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '15px' }}>{p.name}</td>
                                            <td style={{ padding: '15px' }}>{p.category?.name || 'Uncategorized'}</td>
                                            <td style={{ padding: '15px' }}>KES {p.price.toLocaleString()}</td>
                                            <td style={{ padding: '15px' }}><span className={`badge-condition ${p.condition === 'new' ? 'badge-new' : 'badge-used'}`} style={{ position: 'static' }}>{p.condition}</span></td>
                                            <td style={{ padding: '15px' }}>
                                                <button 
                                                    onClick={() => setEditingProduct(p)}
                                                    style={{ color: '#007185', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteProduct(p._id)}
                                                    style={{ color: '#e44d26', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {view === 'categories' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                        <div className="product-card" style={{ padding: '30px', height: 'fit-content' }}>
                            <h2 style={{ marginBottom: '20px' }}>Add Category</h2>
                            <form onSubmit={handleAddCategory}>
                                <input 
                                    type="text" 
                                    placeholder="Category Name" 
                                    className="category-pill" 
                                    style={{ width: '100%', marginBottom: '15px' }} 
                                    value={newCategory.name} 
                                    onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
                                    required 
                                />
                                <button type="submit" className="btn-view" style={{ width: '100%' }}>Create Category</button>
                            </form>
                        </div>
                        <div className="product-card" style={{ padding: '30px' }}>
                            <h2 style={{ marginBottom: '20px' }}>Existing Categories</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                        <th style={{ padding: '15px' }}>Name</th>
                                        <th style={{ padding: '15px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(c => (
                                        <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '15px' }}>{c.name}</td>
                                            <td style={{ padding: '15px' }}>
                                                <button 
                                                    onClick={() => handleDeleteCategory(c._id)}
                                                    style={{ color: '#e44d26', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {view === 'users' && (
                    <div className="product-card" style={{ padding: '30px' }}>
                        <h2 style={{ marginBottom: '20px' }}>Platform Users</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ padding: '15px' }}>Name</th>
                                    <th style={{ padding: '15px' }}>Email</th>
                                    <th style={{ padding: '15px' }}>Role</th>
                                    <th style={{ padding: '15px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px' }}>{u.name}</td>
                                        <td style={{ padding: '15px' }}>{u.email}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span className={`badge-condition ${u.role === 'admin' ? 'badge-new' : 'badge-used'}`} style={{ position: 'static' }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            {u.role !== 'admin' ? (
                                                <button 
                                                    onClick={() => handleRoleUpdate(u._id, 'admin')}
                                                    style={{ color: '#27ae60', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}
                                                >
                                                    Make Admin
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleRoleUpdate(u._id, 'user')}
                                                    style={{ color: '#e44d26', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    disabled={u.email === 'fredrickotieno0461@gmail.com'}
                                                >
                                                    Revoke Admin
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'orders' && (
                    <div className="product-card" style={{ padding: '30px' }}>
                        <h2 style={{ marginBottom: '20px' }}>Platform Orders</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ padding: '15px' }}>Order ID</th>
                                    <th style={{ padding: '15px' }}>Customer</th>
                                    <th style={{ padding: '15px' }}>Phone</th>
                                    <th style={{ padding: '15px' }}>Amount</th>
                                    <th style={{ padding: '15px' }}>Status</th>
                                    <th style={{ padding: '15px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px' }}>{o._id.substring(0, 8)}</td>
                                        <td style={{ padding: '15px' }}>{o.customerName || o.user?.name || 'Unknown'}</td>
                                        <td style={{ padding: '15px' }}>{o.customerPhone || 'N/A'}</td>
                                        <td style={{ padding: '15px' }}>{o.currency} {o.totalAmount}</td>
                                        <td style={{ padding: '15px' }}>
                                            <select 
                                                value={o.trackingStatus || 'Processing'} 
                                                onChange={async (e) => {
                                                    try {
                                                        await updateOrderStatus(o._id, { trackingStatus: e.target.value });
                                                        const freshOrders = await fetchAllOrders();
                                                        setOrders(freshOrders);
                                                    } catch (err) {
                                                        alert('Failed to update status');
                                                    }
                                                }}
                                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Out for Delivery">Out for Delivery</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <button 
                                                onClick={() => setSelectedOrder(o)}
                                                style={{ color: '#007185', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                    <div className="product-card" style={{ width: '500px', padding: '30px', background: '#fff' }}>
                        <h2 style={{ marginBottom: '20px' }}>Add New Product</h2>
                        <form onSubmit={handleAddProduct}>
                            <input type="text" placeholder="Product Name" className="category-pill" style={{ width: '100%', marginBottom: '10px' }} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                            <input type="number" placeholder="Price (KES)" className="category-pill" style={{ width: '100%', marginBottom: '10px' }} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                            <select className="category-pill" style={{ width: '100%', marginBottom: '10px' }} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                            <select className="category-pill" style={{ width: '100%', marginBottom: '10px' }} value={newProduct.condition} onChange={e => setNewProduct({...newProduct, condition: e.target.value})}>
                                <option value="new">New</option>
                                <option value="used">Used</option>
                            </select>
                            <input type="number" placeholder="Initial Stock" className="category-pill" style={{ width: '100%', marginBottom: '10px' }} value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required min="0" />
                            <textarea placeholder="Description" className="category-pill" style={{ width: '100%', marginBottom: '20px', borderRadius: '12px', height: '100px' }} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} required />
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#64748b' }}>Product Images (Select multiple or add one by one)</label>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ marginBottom: '10px' }} />
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {previewUrls.map((url, i) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <img src={url} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                            <button type="button" onClick={() => removeSelectedImage(i)} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>X</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-view" style={{ flex: 1 }}>Save Product</button>
                                <button type="button" className="btn-view" style={{ flex: 1, background: '#64748b' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                    <div className="product-card" style={{ width: '500px', padding: '30px', background: '#fff' }}>
                        <h2 style={{ marginBottom: '20px' }}>Edit Product</h2>
                        <form onSubmit={handleUpdateProduct}>
                            <input type="text" placeholder="Product Name" className="category-pill" style={{ width: '100%', marginBottom: '10px' }} value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
                            <input type="number" placeholder="Price (KES)" className="category-pill" style={{ width: '100%', marginBottom: '10px' }} value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} required />
                            <select className="category-pill" style={{ width: '100%', marginBottom: '10px' }} value={editingProduct.category?._id || editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} required>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                            <select className="category-pill" style={{ width: '100%', marginBottom: '10px' }} value={editingProduct.condition} onChange={e => setEditingProduct({...editingProduct, condition: e.target.value})}>
                                <option value="new">New</option>
                                <option value="used">Used</option>
                            </select>
                            <input type="number" placeholder="Stock Level" className="category-pill" style={{ width: '100%', marginBottom: '10px' }} value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} required min="0" />
                            <textarea placeholder="Description" className="category-pill" style={{ width: '100%', marginBottom: '20px', borderRadius: '12px', height: '100px' }} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} required />

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#64748b' }}>Update Images (Replaces existing images)</label>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ marginBottom: '10px' }} />
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {previewUrls.length > 0 ? previewUrls.map((url, i) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <img src={url} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                            <button type="button" onClick={() => removeSelectedImage(i)} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>X</button>
                                        </div>
                                    )) : editingProduct.images?.map((url, i) => (
                                        <img key={i} src={`http://127.0.0.1:5000${url}`} alt="current" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-view" style={{ flex: 1 }}>Update Product</button>
                                <button type="button" className="btn-view" style={{ flex: 1, background: '#64748b' }} onClick={() => setEditingProduct(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Order Details Modal */}
            {selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                    <div className="product-card" style={{ width: '600px', padding: '30px', background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2>Order Details #{selectedOrder._id.substring(0, 8)}</h2>
                            <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        
                        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                            <h3 style={{ marginBottom: '10px' }}>Customer Information</h3>
                            <p><strong>Name:</strong> {selectedOrder.customerName || selectedOrder.user?.name}</p>
                            <p><strong>Phone:</strong> {selectedOrder.customerPhone || 'N/A'}</p>
                            <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                        </div>

                        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                            <h3 style={{ marginBottom: '10px' }}>Shipping Address</h3>
                            {selectedOrder.shippingAddress ? (
                                <p>
                                    {selectedOrder.shippingAddress.street}<br />
                                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.county}
                                </p>
                            ) : <p>No shipping address provided.</p>}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ marginBottom: '10px' }}>Items Purchased</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                        <th style={{ padding: '10px' }}>Product</th>
                                        <th style={{ padding: '10px' }}>Qty</th>
                                        <th style={{ padding: '10px' }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.products?.map((p, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                            <td style={{ padding: '10px' }}>{p.product?.name || 'Unknown Product'}</td>
                                            <td style={{ padding: '10px' }}>{p.quantity}</td>
                                            <td style={{ padding: '10px' }}>{selectedOrder.currency} {p.product?.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                Total: {selectedOrder.currency} {selectedOrder.totalAmount}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-view" style={{ flex: 1, background: '#64748b' }} onClick={() => setSelectedOrder(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

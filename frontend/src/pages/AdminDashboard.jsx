import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ChangePasswordForm from '../components/ChangePasswordForm';

const AdminDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [revenueStats, setRevenueStats] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dispatchCourier, setDispatchCourier] = useState({});
    const now = new Date();
    const [reportStartDate, setReportStartDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
    const [reportEndDate, setReportEndDate] = useState(now.toISOString().split('T')[0]);
    const [generatingReport, setGeneratingReport] = useState(false);

    const [couponForm, setCouponForm] = useState({
        code: '', discountType: 'percentage', discountValue: '', minPurchase: '', usageLimit: '', expiryDate: ''
    });
    const [creatingCoupon, setCreatingCoupon] = useState(false);

    const [policiesForm, setPoliciesForm] = useState({ shippingPolicy: '', returnPolicy: '', privacyPolicy: '', termsOfService: '' });
    const [savingPolicies, setSavingPolicies] = useState(false);

    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');

    // Edit Order State
    const [editingOrder, setEditingOrder] = useState(null);
    const [showOrderEditModal, setShowOrderEditModal] = useState(false);
    const [orderEditForm, setOrderEditForm] = useState(null);
    const [addItemProductId, setAddItemProductId] = useState('');
    const [savingOrder, setSavingOrder] = useState(false);

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    // Edit Product State
    const [editingProduct, setEditingProduct] = useState(null);
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [editForm, setEditForm] = useState({
        name: '', costPrice: 0, price: 0, images: [], brand: '', category: '', countInStock: 0, description: ''
    });

    const blankProductForm = {
        name: '', costPrice: 0, price: 0, discountPercentage: 0, images: [], brand: '', category: '', countInStock: 0, weight: 0.5, description: ''
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [{ data: ordersData }, { data: productsData }, { data: usersData }, { data: revenueData }, { data: couponsData }, { data: policiesData }, { data: categoriesData }] = await Promise.all([
                    axios.get('/api/orders', config),
                    axios.get('/api/products', config),
                    axios.get('/api/users', config),
                    axios.get('/api/orders/revenue', config),
                    axios.get('/api/coupons', config),
                    axios.get('/api/settings/policies'),
                    axios.get('/api/categories')
                ]);
                setOrders(ordersData);
                setProducts(productsData);
                setUsers(usersData);
                setRevenueStats(revenueData);
                setCoupons(couponsData);
                setPoliciesForm(policiesData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching admin data', error);
            }
            setLoading(false);
        };

        fetchData();
    }, [user, authLoading, navigate]);

    const handleGenerateSalesReport = async () => {
        if (!reportStartDate || !reportEndDate) {
            toast.warn('Please select a start and end date');
            return;
        }
        setGeneratingReport(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('/api/orders/sales-report', { startDate: reportStartDate, endDate: reportEndDate }, config);
            toast.success('Report generated!');
            window.open(data.url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate report');
        }
        setGeneratingReport(false);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/orders/${id}/status`, { status: newStatus }, config);
            setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus, isDelivered: newStatus === 'Delivered' } : o));
            toast.success('Order status updated!');
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const handlePaymentStatusChange = async (id, isPaid) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/orders/${id}/payment-status`, { isPaid: isPaid === 'true' }, config);
            setOrders(orders.map(o => o._id === id ? { ...o, isPaid: isPaid === 'true' } : o));
            toast.success('Payment status updated!');
        } catch (error) {
            toast.error('Failed to update payment status');
        }
    };

    const handleDeleteOrder = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Order',
            message: 'Are you sure you want to completely remove this order? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    await axios.delete(`/api/orders/${id}`, config);
                    setOrders(prevOrders => prevOrders.filter(o => o._id !== id));
                    toast.success('Order deleted');
                } catch (error) {
                    toast.error('Failed to delete order');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleCourierChange = (id, val) => {
        setDispatchCourier(prev => ({ ...prev, [id]: val }));
    };

    const handleEditOrderClick = (order) => {
        setEditingOrder(order);
        setOrderEditForm({
            orderItems: order.orderItems.map(item => ({
                product: item.product,
                name: item.name,
                image: item.image,
                price: item.price,
                qty: item.qty,
            })),
            shippingAddress: { ...order.shippingAddress },
            guestName: order.guestName || '',
            guestEmail: order.guestEmail || '',
            guestPhone: order.guestPhone || '',
            shippingPrice: order.shippingPrice,
            status: order.status,
        });
        setAddItemProductId('');
        setShowOrderEditModal(true);
    };

    const handleOrderItemFieldChange = (index, field, value) => {
        setOrderEditForm(prev => {
            const items = [...prev.orderItems];
            items[index] = { ...items[index], [field]: value };
            return { ...prev, orderItems: items };
        });
    };

    const handleRemoveOrderItem = (index) => {
        setOrderEditForm(prev => ({
            ...prev,
            orderItems: prev.orderItems.filter((_, i) => i !== index),
        }));
    };

    const handleAddOrderItem = () => {
        if (!addItemProductId) return;
        const product = products.find(p => p._id === addItemProductId);
        if (!product) return;
        setOrderEditForm(prev => ({
            ...prev,
            orderItems: [...prev.orderItems, {
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                qty: 1,
            }],
        }));
        setAddItemProductId('');
    };

    const submitOrderEditHandler = async (e) => {
        e.preventDefault();
        if (orderEditForm.orderItems.length === 0) {
            toast.warn('Order must have at least one item');
            return;
        }
        setSavingOrder(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: detailsUpdated } = await axios.put(`/api/orders/${editingOrder._id}/details`, {
                orderItems: orderEditForm.orderItems,
                shippingAddress: orderEditForm.shippingAddress,
                guestName: orderEditForm.guestName,
                guestEmail: orderEditForm.guestEmail,
                guestPhone: orderEditForm.guestPhone,
                shippingPrice: Number(orderEditForm.shippingPrice),
            }, config);

            let finalOrder = detailsUpdated;
            if (orderEditForm.status !== editingOrder.status) {
                const { data: statusUpdated } = await axios.put(`/api/orders/${editingOrder._id}/status`, { status: orderEditForm.status }, config);
                finalOrder = statusUpdated;
            }

            setOrders(orders.map(o => o._id === editingOrder._id ? finalOrder : o));
            setShowOrderEditModal(false);
            toast.success('Order updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order');
        }
        setSavingOrder(false);
    };

    const handleTrackOrder = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`/api/orders/${id}/track`, config);
            setOrders(orders.map(o => o._id === id ? data : o));
            toast.success(`Status synced: ${data.status}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync status');
        }
    };

    const handleDispatch = async (id) => {
        const courier = dispatchCourier[id];
        if (!courier) {
            toast.warn('Please select a courier service first');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`/api/orders/${id}/dispatch`, { courier }, config);
            setOrders(orders.map(o => o._id === id ? data : o));
            toast.success(`Dispatched to ${courier} successfully!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to dispatch order');
        }
    };

    // User Handlers
    const [togglingUserId, setTogglingUserId] = useState(null);
    const handleAdminToggle = async (id, currentStatus) => {
        if (id === user._id) {
            toast.error("You can't change your own admin status");
            return;
        }
        if (togglingUserId) return;
        setTogglingUserId(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/users/${id}`, { isAdmin: !currentStatus }, config);
            setUsers(prevUsers => prevUsers.map(u => u._id === id ? data : u));
            toast.success('User status updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user status');
        } finally {
            setTogglingUserId(null);
        }
    };

    const handleDeleteUser = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user?',
            onConfirm: async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    await axios.delete(`/api/users/${id}`, config);
                    setUsers(prevUsers => prevUsers.filter(u => u._id !== id));
                    toast.success('User deleted');
                } catch (error) {
                    toast.error('Failed to delete user');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Product Handlers
    const handleOrderAmountChangeLocal = (id, val) => {
        setOrders(orders.map(o => o._id === id ? { ...o, totalPrice: val } : o));
    };

    const submitOrderAmountChange = async (id, val) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/orders/${id}/amount`, { totalPrice: val }, config);
            toast.success('Order amount updated');
        } catch (error) {
            toast.error('Failed to update order amount');
        }
    };
    const handleOpenCreateProduct = () => {
        setEditingProduct(null);
        setIsNewProduct(true);
        setEditForm(blankProductForm);
        setShowEditModal(true);
    };

    const handleDeleteProduct = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product?',
            onConfirm: async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    await axios.delete(`/api/products/${id}`, config);
                    setProducts(prevProducts => prevProducts.filter(p => p._id !== id));
                    toast.success('Product deleted');
                } catch (error) {
                    toast.error('Failed to delete product');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setIsNewProduct(false);
        setEditForm({
            name: product.name,
            costPrice: product.costPrice || 0,
            price: product.price,
            discountPercentage: product.discountPercentage || 0,
            images: (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : []),
            brand: product.brand,
            category: product.category,
            countInStock: product.countInStock,
            weight: product.weight || 0.5,
            description: product.description,
        });
        setShowEditModal(true);
    };

    const uploadFileHandler = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.post('/api/upload/multiple', formData, config);
            setEditForm(prev => ({...prev, images: [...prev.images, ...data.imageUrls]}));
            setUploading(false);
            toast.success('Image(s) uploaded successfully');
        } catch (error) {
            console.error(error);
            setUploading(false);
            toast.error('Image upload failed');
        }
        e.target.value = '';
    };

    const handleAddImageUrl = () => {
        if (!newImageUrl.trim()) return;
        setEditForm(prev => ({...prev, images: [...prev.images, newImageUrl.trim()]}));
        setNewImageUrl('');
    };

    const handleRemoveImage = (index) => {
        setEditForm(prev => ({...prev, images: prev.images.filter((_, i) => i !== index)}));
    };

    const submitEditHandler = async (e) => {
        e.preventDefault();

        if (!editForm.name || !editForm.images || editForm.images.length === 0 || !editForm.category) {
            toast.warn('Name, at least one image, and category are required');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (isNewProduct) {
                const { data } = await axios.post('/api/products', editForm, config);
                setProducts([...products, data]);
                toast.success('Product created successfully!');
            } else {
                const { data } = await axios.put(`/api/products/${editingProduct._id}`, editForm, config);
                setProducts(products.map(p => p._id === editingProduct._id ? data : p));
                toast.success('Product updated successfully!');
            }
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || (isNewProduct ? 'Failed to create product' : 'Failed to update product'));
        }
    };

    // Coupon Handlers
    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        if (!couponForm.code.trim() || !couponForm.discountValue) {
            toast.warn('Coupon code and discount value are required');
            return;
        }
        setCreatingCoupon(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('/api/coupons', {
                code: couponForm.code.trim().toUpperCase(),
                discountType: couponForm.discountType,
                discountValue: Number(couponForm.discountValue),
                minPurchase: couponForm.minPurchase ? Number(couponForm.minPurchase) : 0,
                usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null,
                expiryDate: couponForm.expiryDate || null,
            }, config);
            setCoupons([data, ...coupons]);
            setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minPurchase: '', usageLimit: '', expiryDate: '' });
            toast.success('Coupon created');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create coupon');
        }
        setCreatingCoupon(false);
    };

    const handleToggleCouponActive = async (id, isActive) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/coupons/${id}`, { isActive: !isActive }, config);
            setCoupons(coupons.map(c => c._id === id ? data : c));
        } catch (error) {
            toast.error('Failed to update coupon');
        }
    };

    const handleDeleteCoupon = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Coupon',
            message: 'Are you sure you want to delete this coupon?',
            onConfirm: async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    await axios.delete(`/api/coupons/${id}`, config);
                    setCoupons(prevCoupons => prevCoupons.filter(c => c._id !== id));
                    toast.success('Coupon deleted');
                } catch (error) {
                    toast.error('Failed to delete coupon');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setCreatingCategory(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('/api/categories', { name: newCategoryName.trim() }, config);
            setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)));
            setNewCategoryName('');
            toast.success('Category added');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add category');
        }
        setCreatingCategory(false);
    };

    const startEditingCategory = (category) => {
        setEditingCategoryId(category._id);
        setEditingCategoryName(category.name);
    };

    const cancelEditingCategory = () => {
        setEditingCategoryId(null);
        setEditingCategoryName('');
    };

    const handleRenameCategory = async (id) => {
        if (!editingCategoryName.trim()) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/categories/${id}`, { name: editingCategoryName.trim() }, config);
            setCategories(categories.map(c => c._id === id ? data : c).sort((a, b) => a.name.localeCompare(b.name)));
            cancelEditingCategory();
            toast.success('Category renamed');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to rename category');
        }
    };

    const handleDeleteCategory = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Category',
            message: 'Are you sure you want to delete this category?',
            onConfirm: async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    await axios.delete(`/api/categories/${id}`, config);
                    setCategories(prev => prev.filter(c => c._id !== id));
                    toast.success('Category deleted');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to delete category');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleSavePolicies = async (e) => {
        e.preventDefault();
        setSavingPolicies(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put('/api/settings/policies', policiesForm, config);
            setPoliciesForm(data);
            toast.success('Policies updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update policies');
        }
        setSavingPolicies(false);
    };

    return (
        <div className="container animate-fade-in" style={styles.page}>

            <div style={styles.header}>
                <h1 style={styles.title}>Admin Dashboard</h1>
                <div style={styles.tabs}>
                    <button 
                        style={{...styles.tabBtn, ...(activeTab === 'orders' ? styles.activeTab : {})}} 
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button 
                        style={{...styles.tabBtn, ...(activeTab === 'delivered' ? styles.activeTab : {})}} 
                        onClick={() => setActiveTab('delivered')}
                    >
                        Delivered
                    </button>
                    <button 
                        style={{...styles.tabBtn, ...(activeTab === 'products' ? styles.activeTab : {})}} 
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                    <button 
                        style={{...styles.tabBtn, ...(activeTab === 'users' ? styles.activeTab : {})}} 
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        style={{...styles.tabBtn, ...(activeTab === 'revenue' ? styles.activeTab : {})}}
                        onClick={() => setActiveTab('revenue')}
                    >
                        Revenue
                    </button>
                    <button
                        style={{...styles.tabBtn, ...(activeTab === 'coupons' ? styles.activeTab : {})}}
                        onClick={() => setActiveTab('coupons')}
                    >
                        Coupons
                    </button>
                    <button
                        style={{...styles.tabBtn, ...(activeTab === 'categories' ? styles.activeTab : {})}}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categories
                    </button>
                    <button
                        style={{...styles.tabBtn, ...(activeTab === 'settings' ? styles.activeTab : {})}}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </button>
                </div>
            </div>
            
            <div style={styles.content}>
                {loading ? (
                    <p>Loading...</p>
                ) : activeTab === 'orders' ? (
                    <>
                        <h2 style={styles.sectionTitle}>Manage Orders</h2>
                        {orders.filter(order => order.status !== 'Delivered').length === 0 ? <p>No active orders found.</p> : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>ITEM</th>
                                            <th>USER</th>
                                            <th>DATE</th>
                                            <th>TOTAL</th>
                                            <th>PAID</th>
                                            <th>STATUS</th>
                                            <th>COURIER</th>
                                            <th>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.filter(order => order.status !== 'Delivered').map((order) => (
                                            <tr key={order._id}>
                                                <td>{order._id.substring(0,8).toUpperCase()}</td>
                                                <td>
                                                    {order.orderItems && order.orderItems.length > 0 && (
                                                        <img src={order.orderItems[0].image} alt="Item" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px'}} />
                                                    )}
                                                </td>
                                                <td>{order.user?.name || order.guestName || 'Guest'}</td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                                        <span>৳</span>
                                                        <input 
                                                            type="number" 
                                                            value={order.totalPrice} 
                                                            onChange={(e) => handleOrderAmountChangeLocal(order._id, e.target.value)}
                                                            onBlur={(e) => submitOrderAmountChange(order._id, e.target.value)}
                                                            style={{
                                                                width: '70px', 
                                                                padding: '0.2rem', 
                                                                marginLeft: '2px', 
                                                                border: '1px solid var(--color-border)', 
                                                                borderRadius: '4px',
                                                                backgroundColor: 'var(--color-bg-main)',
                                                                color: 'var(--color-text-main)'
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <select 
                                                        value={order.isPaid ? 'true' : 'false'} 
                                                        onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                                                        style={{...styles.select, padding: '0.2rem', borderColor: order.isPaid ? '#28a745' : '#ccc'}}
                                                    >
                                                        <option value="false">No</option>
                                                        <option value="true">Yes</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <select 
                                                        value={order.status || 'Pending'} 
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        style={{...styles.select, borderColor: order.status === 'Delivered' ? '#28a745' : '#ccc'}}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="On the way">On the way</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    {order.courierService ? (
                                                        <div>
                                                            <strong style={{color: 'var(--color-primary)'}}>{order.courierService}</strong><br/>
                                                            <small style={{color: 'var(--color-text-muted)'}}>{order.trackingCode}</small>
                                                            {order.courierService === 'Steadfast' && (
                                                                <>
                                                                    <br/>
                                                                    <button
                                                                        className="btn btn-outline"
                                                                        style={{...styles.actionBtn, marginTop: '0.25rem'}}
                                                                        onClick={() => handleTrackOrder(order._id)}
                                                                    >
                                                                        Sync Status
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                                            <select
                                                                value={dispatchCourier[order._id] || ''}
                                                                onChange={(e) => handleCourierChange(order._id, e.target.value)}
                                                                style={{...styles.select, padding: '0.2rem'}}
                                                            >
                                                                <option value="">Select Courier</option>
                                                                <option value="Steadfast">Steadfast</option>
                                                                <option value="Pathao">Pathao</option>
                                                            </select>
                                                            <button
                                                                className="btn btn-primary"
                                                                style={{padding: '0.2rem 0.5rem', fontSize: '0.8rem'}}
                                                                onClick={() => handleDispatch(order._id)}
                                                            >
                                                                Send
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={styles.actionBtn}
                                                        onClick={() => handleEditOrderClick(order)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={styles.actionBtn}
                                                        onClick={() => navigate(`/admin/invoice/${order._id}`)}
                                                    >
                                                        Print Slip
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{...styles.actionBtn, borderColor: '#dc3545', color: '#dc3545'}}
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : activeTab === 'delivered' ? (
                    <>
                        <h2 style={styles.sectionTitle}>Delivered Orders</h2>
                        {orders.filter(order => order.status === 'Delivered').length === 0 ? <p>No delivered orders found.</p> : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>ITEM</th>
                                            <th>USER</th>
                                            <th>DATE</th>
                                            <th>TOTAL</th>
                                            <th>STATUS</th>
                                            <th>COURIER</th>
                                            <th>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.filter(order => order.status === 'Delivered').map((order) => (
                                            <tr key={order._id}>
                                                <td>{order._id.substring(0,8).toUpperCase()}</td>
                                                <td>
                                                    {order.orderItems && order.orderItems.length > 0 && (
                                                        <img src={order.orderItems[0].image} alt="Item" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px'}} />
                                                    )}
                                                </td>
                                                <td>{order.user?.name || order.guestName || 'Guest'}</td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                                        <span>৳</span>
                                                        <input 
                                                            type="number" 
                                                            value={order.totalPrice} 
                                                            onChange={(e) => handleOrderAmountChangeLocal(order._id, e.target.value)}
                                                            onBlur={(e) => submitOrderAmountChange(order._id, e.target.value)}
                                                            style={{
                                                                width: '70px', 
                                                                padding: '0.2rem', 
                                                                marginLeft: '2px', 
                                                                border: '1px solid var(--color-border)', 
                                                                borderRadius: '4px',
                                                                backgroundColor: 'var(--color-bg-main)',
                                                                color: 'var(--color-text-main)'
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <select 
                                                        value={order.status || 'Pending'} 
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        style={{...styles.select, borderColor: '#28a745'}}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="On the way">On the way</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    {order.courierService ? (
                                                        <div>
                                                            <strong style={{color: 'var(--color-primary)'}}>{order.courierService}</strong><br/>
                                                            <small style={{color: 'var(--color-text-muted)'}}>{order.trackingCode}</small>
                                                        </div>
                                                    ) : (
                                                        <span style={{color: 'var(--color-text-muted)'}}>N/A</span>
                                                    )}
                                                </td>
                                                <td style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={styles.actionBtn}
                                                        onClick={() => handleEditOrderClick(order)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={styles.actionBtn}
                                                        onClick={() => navigate(`/admin/invoice/${order._id}`)}
                                                    >
                                                        Print Slip
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{...styles.actionBtn, borderColor: '#dc3545', color: '#dc3545'}}
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : activeTab === 'users' ? (
                    <>
                        <h2 style={styles.sectionTitle}>Manage Users</h2>
                        {users.length === 0 ? <p>No users found.</p> : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>NAME</th>
                                            <th>EMAIL</th>
                                            <th>ADMIN</th>
                                            <th>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id}>
                                                <td>{u._id.substring(0,8).toUpperCase()}</td>
                                                <td>{u.name}</td>
                                                <td><a href={`mailto:${u.email}`}>{u.email}</a></td>
                                                <td>{u.isAdmin ? 'Yes' : 'No'}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        style={{...styles.actionBtn, marginRight: '0.5rem', ...(togglingUserId === u._id || u._id === user._id ? styles.disabledBtn : {})}}
                                                        disabled={togglingUserId === u._id || u._id === user._id}
                                                        title={u._id === user._id ? "You can't change your own admin status" : undefined}
                                                        onClick={() => handleAdminToggle(u._id, u.isAdmin)}
                                                    >
                                                        {togglingUserId === u._id ? 'Updating...' : u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                    </button>
                                                    <button type="button" className="btn btn-outline" style={{...styles.actionBtn, borderColor: '#dc3545', color: '#dc3545'}} onClick={() => handleDeleteUser(u._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : activeTab === 'revenue' && revenueStats ? (
                    <>
                        <h2 style={styles.sectionTitle}>Revenue Analytics</h2>

                        <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: '8px', border: '1px solid var(--color-border)'}}>
                            <div className="input-group" style={{marginBottom: 0}}>
                                <label>Start Date</label>
                                <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} />
                            </div>
                            <div className="input-group" style={{marginBottom: 0}}>
                                <label>End Date</label>
                                <input type="date" value={reportEndDate} min={reportStartDate} onChange={e => setReportEndDate(e.target.value)} />
                            </div>
                            <button className="btn btn-primary" onClick={handleGenerateSalesReport} disabled={generatingReport}>
                                {generatingReport ? 'Generating...' : 'Generate Sales Report (Google Sheets)'}
                            </button>
                        </div>

                        <div style={{display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
                            <div style={styles.statCard}>
                                <h3>Total Revenue</h3>
                                <p style={styles.statValue}>৳{revenueStats.totalRevenue}</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3>Total Cost</h3>
                                <p style={{...styles.statValue, color: '#dc3545'}}>৳{revenueStats.totalCost}</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3>Total Profit</h3>
                                <p style={{...styles.statValue, color: '#28a745'}}>৳{revenueStats.totalProfit}</p>
                            </div>
                        </div>

                        <h3 style={{...styles.sectionTitle, fontSize: '1.25rem', marginTop: '2rem'}}>Monthly Data</h3>
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th>MONTH</th>
                                        <th>REVENUE</th>
                                        <th>COST</th>
                                        <th>PROFIT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(revenueStats.monthlyData).sort((a,b) => b[0].localeCompare(a[0])).map(([month, data]) => (
                                        <tr key={month}>
                                            <td>{month}</td>
                                            <td>৳{data.revenue}</td>
                                            <td style={{color: '#dc3545'}}>৳{data.cost}</td>
                                            <td style={{color: '#28a745', fontWeight: 'bold'}}>৳{data.profit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h3 style={{...styles.sectionTitle, fontSize: '1.25rem', marginTop: '2rem'}}>Yearly Data</h3>
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th>YEAR</th>
                                        <th>REVENUE</th>
                                        <th>COST</th>
                                        <th>PROFIT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(revenueStats.yearlyData).sort((a,b) => b[0].localeCompare(a[0])).map(([year, data]) => (
                                        <tr key={year}>
                                            <td>{year}</td>
                                            <td>৳{data.revenue}</td>
                                            <td style={{color: '#dc3545'}}>৳{data.cost}</td>
                                            <td style={{color: '#28a745', fontWeight: 'bold'}}>৳{data.profit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : activeTab === 'coupons' ? (
                    <>
                        <h2 style={styles.sectionTitle}>Manage Coupons</h2>

                        <form onSubmit={handleCreateCoupon} style={styles.couponForm}>
                            <div className="input-group flex-row-mobile-column" style={{marginBottom: 0}}>
                                <div style={{flex: 1}}>
                                    <label>Code</label>
                                    <input type="text" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="SUMMER20" />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Type</label>
                                    <select value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value})}>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (৳)</option>
                                    </select>
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Discount Value</label>
                                    <input type="number" min="0" value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} placeholder={couponForm.discountType === 'percentage' ? '20' : '200'} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Min Purchase (Optional)</label>
                                    <input type="number" min="0" value={couponForm.minPurchase} onChange={e => setCouponForm({...couponForm, minPurchase: e.target.value})} placeholder="0" />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Usage Limit (Optional)</label>
                                    <input type="number" min="0" value={couponForm.usageLimit} onChange={e => setCouponForm({...couponForm, usageLimit: e.target.value})} placeholder="Unlimited" />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Expiry Date (Optional)</label>
                                    <input type="date" value={couponForm.expiryDate} onChange={e => setCouponForm({...couponForm, expiryDate: e.target.value})} />
                                </div>
                                <div style={{flex: '0 0 auto', display: 'flex', alignItems: 'flex-end'}}>
                                    <button type="submit" className="btn btn-primary" disabled={creatingCoupon} style={{whiteSpace: 'nowrap'}}>
                                        {creatingCoupon ? 'Creating...' : '+ Create'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {coupons.length === 0 ? <p>No coupons created yet.</p> : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>CODE</th>
                                            <th>DISCOUNT</th>
                                            <th>MIN PURCHASE</th>
                                            <th>USED</th>
                                            <th>EXPIRY</th>
                                            <th>ACTIVE</th>
                                            <th>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.map((c) => (
                                            <tr key={c._id}>
                                                <td><strong>{c.code}</strong></td>
                                                <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `৳${c.discountValue}`}</td>
                                                <td>{c.minPurchase ? `৳${c.minPurchase}` : '-'}</td>
                                                <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                                                <td>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never'}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{...styles.actionBtn, borderColor: c.isActive ? '#28a745' : '#999', color: c.isActive ? '#28a745' : '#999'}}
                                                        onClick={() => handleToggleCouponActive(c._id, c.isActive)}
                                                    >
                                                        {c.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td>
                                                    <button className="btn btn-outline" style={{...styles.actionBtn, borderColor: '#dc3545', color: '#dc3545'}} onClick={() => handleDeleteCoupon(c._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : activeTab === 'categories' ? (
                    <>
                        <h2 style={styles.sectionTitle}>Manage Categories</h2>

                        <form onSubmit={handleCreateCategory} style={{...styles.couponForm, display: 'flex', gap: '0.75rem', alignItems: 'flex-end'}}>
                            <div style={{flex: 1}}>
                                <label style={{display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>New Category</label>
                                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g. Sunglasses" />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={creatingCategory || !newCategoryName.trim()}>
                                {creatingCategory ? 'Adding...' : '+ Add Category'}
                            </button>
                        </form>

                        {categories.length === 0 ? <p>No categories yet.</p> : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>NAME</th>
                                            <th>PRODUCTS</th>
                                            <th>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((c) => (
                                            <tr key={c._id}>
                                                <td>
                                                    {editingCategoryId === c._id ? (
                                                        <input
                                                            type="text"
                                                            value={editingCategoryName}
                                                            onChange={e => setEditingCategoryName(e.target.value)}
                                                            style={{padding: '0.3rem', width: '200px'}}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <strong>{c.name}</strong>
                                                    )}
                                                </td>
                                                <td>{products.filter(p => p.category === c.name).length}</td>
                                                <td>
                                                    {editingCategoryId === c._id ? (
                                                        <>
                                                            <button className="btn btn-primary" style={{...styles.actionBtn, marginRight: '0.5rem'}} onClick={() => handleRenameCategory(c._id)}>Save</button>
                                                            <button className="btn btn-outline" style={styles.actionBtn} onClick={cancelEditingCategory}>Cancel</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button className="btn btn-outline" style={{...styles.actionBtn, marginRight: '0.5rem'}} onClick={() => startEditingCategory(c)}>Rename</button>
                                                            <button className="btn btn-outline" style={{...styles.actionBtn, borderColor: '#dc3545', color: '#dc3545'}} onClick={() => handleDeleteCategory(c._id)}>Delete</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : activeTab === 'settings' ? (
                    <>
                        <h2 style={styles.sectionTitle}>Site Policies</h2>
                        <form onSubmit={handleSavePolicies} style={{maxWidth: '700px'}}>
                            <div className="input-group">
                                <label>Shipping Policy</label>
                                <textarea
                                    rows="8"
                                    value={policiesForm.shippingPolicy}
                                    onChange={e => setPoliciesForm({...policiesForm, shippingPolicy: e.target.value})}
                                    placeholder="One point per line..."
                                />
                            </div>
                            <div className="input-group">
                                <label>Return &amp; Refund Policy</label>
                                <textarea
                                    rows="8"
                                    value={policiesForm.returnPolicy}
                                    onChange={e => setPoliciesForm({...policiesForm, returnPolicy: e.target.value})}
                                    placeholder="One point per line..."
                                />
                            </div>
                            <div className="input-group">
                                <label>Privacy Policy</label>
                                <textarea
                                    rows="10"
                                    value={policiesForm.privacyPolicy}
                                    onChange={e => setPoliciesForm({...policiesForm, privacyPolicy: e.target.value})}
                                    placeholder="Lines starting with '1. ', '2. ', etc. render as section headings..."
                                />
                            </div>
                            <div className="input-group">
                                <label>Terms of Service</label>
                                <textarea
                                    rows="10"
                                    value={policiesForm.termsOfService}
                                    onChange={e => setPoliciesForm({...policiesForm, termsOfService: e.target.value})}
                                    placeholder="Lines starting with '1. ', '2. ', etc. render as section headings..."
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={savingPolicies}>
                                {savingPolicies ? 'Saving...' : 'Save Policies'}
                            </button>
                        </form>

                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
                            <ChangePasswordForm />
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                            <h2 style={styles.sectionTitle}>Manage Products</h2>
                            <button className="btn btn-primary" onClick={handleOpenCreateProduct}>+ Create Product</button>
                        </div>
                        {products.length === 0 ? <p>No products found.</p> : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>IMAGE</th>
                                            <th>NAME</th>
                                            <th>PRICE</th>
                                            <th>CATEGORY</th>
                                            <th>BRAND</th>
                                            <th>STOCK</th>
                                            <th>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product._id}>
                                                <td>{product._id.substring(0,8).toUpperCase()}</td>
                                                <td><img src={product.image} alt={product.name} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px'}} /></td>
                                                <td>{product.name}</td>
                                                <td>৳{product.price}</td>
                                                <td>{product.category}</td>
                                                <td>{product.brand}</td>
                                                <td>{product.countInStock}</td>
                                                <td>
                                                    <button className="btn btn-outline" style={{...styles.actionBtn, marginRight: '0.5rem'}} onClick={() => handleEditClick(product)}>Edit</button>
                                                    <button className="btn btn-outline" style={{...styles.actionBtn, borderColor: '#dc3545', color: '#dc3545'}} onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirm Modal */}
            {confirmModal.isOpen && (
                <div className="modal-overlay" style={styles.modalOverlay}>
                    <div className="modal-content" style={{...styles.modalContent, maxWidth: '400px', textAlign: 'center'}}>
                        <h2 style={{color: 'var(--color-text-main)'}}>{confirmModal.title}</h2>
                        <p style={{margin: '1.5rem 0', color: 'var(--color-text-muted)'}}>{confirmModal.message}</p>
                        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                            <button className="btn btn-outline" style={{borderColor: '#dc3545', color: '#dc3545', flex: 1}} onClick={confirmModal.onConfirm}>Yes, Delete</button>
                            <button className="btn btn-outline" style={{flex: 1}} onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {showOrderEditModal && orderEditForm && (
                <div className="modal-overlay" style={styles.modalOverlay}>
                    <div className="modal-content" style={{...styles.modalContent, maxWidth: '760px'}}>
                        <h2>Edit Order {editingOrder._id.substring(0, 8).toUpperCase()}</h2>
                        <form onSubmit={submitOrderEditHandler} style={{marginTop: '1.5rem'}}>

                            <h3 style={styles.modalSectionTitle}>Items</h3>
                            <div style={styles.orderItemsList}>
                                {orderEditForm.orderItems.map((item, index) => (
                                    <div key={index} style={styles.orderItemRow}>
                                        <img src={item.image} alt={item.name} style={{width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px'}} />
                                        <span style={{flex: 1, minWidth: '120px'}}>{item.name}</span>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
                                            <label style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>Qty</label>
                                            <input
                                                type="number" min="1" value={item.qty}
                                                onChange={e => handleOrderItemFieldChange(index, 'qty', Number(e.target.value))}
                                                style={{width: '60px', padding: '0.3rem'}}
                                            />
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
                                            <label style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>৳</label>
                                            <input
                                                type="number" min="0" value={item.price}
                                                onChange={e => handleOrderItemFieldChange(index, 'price', Number(e.target.value))}
                                                style={{width: '80px', padding: '0.3rem'}}
                                            />
                                        </div>
                                        <button type="button" className="btn btn-outline" style={{...styles.actionBtn, borderColor: '#dc3545', color: '#dc3545'}} onClick={() => handleRemoveOrderItem(index)}>Remove</button>
                                    </div>
                                ))}
                            </div>

                            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.75rem', marginBottom: '1.5rem'}}>
                                <select value={addItemProductId} onChange={e => setAddItemProductId(e.target.value)} style={{flex: 1}}>
                                    <option value="">Add a product...</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} (৳{p.price})</option>
                                    ))}
                                </select>
                                <button type="button" className="btn btn-outline" onClick={handleAddOrderItem}>+ Add Item</button>
                            </div>

                            <h3 style={styles.modalSectionTitle}>Customer Information</h3>
                            <div className="input-group flex-row-mobile-column">
                                <div style={{flex: 1}}>
                                    <label>Name</label>
                                    <input type="text" value={orderEditForm.guestName} onChange={e => setOrderEditForm({...orderEditForm, guestName: e.target.value})} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Email</label>
                                    <input type="email" value={orderEditForm.guestEmail} onChange={e => setOrderEditForm({...orderEditForm, guestEmail: e.target.value})} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Phone</label>
                                    <input type="text" value={orderEditForm.guestPhone} onChange={e => setOrderEditForm({...orderEditForm, guestPhone: e.target.value})} />
                                </div>
                            </div>

                            <h3 style={styles.modalSectionTitle}>Shipping Address</h3>
                            <div className="input-group">
                                <label>Address</label>
                                <input type="text" value={orderEditForm.shippingAddress.address} onChange={e => setOrderEditForm({...orderEditForm, shippingAddress: {...orderEditForm.shippingAddress, address: e.target.value}})} />
                            </div>
                            <div className="input-group flex-row-mobile-column">
                                <div style={{flex: 1}}>
                                    <label>City</label>
                                    <input type="text" value={orderEditForm.shippingAddress.city} onChange={e => setOrderEditForm({...orderEditForm, shippingAddress: {...orderEditForm.shippingAddress, city: e.target.value}})} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Postal Code</label>
                                    <input type="text" value={orderEditForm.shippingAddress.postalCode || ''} onChange={e => setOrderEditForm({...orderEditForm, shippingAddress: {...orderEditForm.shippingAddress, postalCode: e.target.value}})} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Country</label>
                                    <input type="text" value={orderEditForm.shippingAddress.country} onChange={e => setOrderEditForm({...orderEditForm, shippingAddress: {...orderEditForm.shippingAddress, country: e.target.value}})} />
                                </div>
                            </div>

                            <h3 style={styles.modalSectionTitle}>Order</h3>
                            <div className="input-group flex-row-mobile-column">
                                <div style={{flex: 1}}>
                                    <label>Shipping Price</label>
                                    <input type="number" min="0" value={orderEditForm.shippingPrice} onChange={e => setOrderEditForm({...orderEditForm, shippingPrice: e.target.value})} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Status</label>
                                    <select value={orderEditForm.status} onChange={e => setOrderEditForm({...orderEditForm, status: e.target.value})}>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="On the way">On the way</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                                <button type="submit" className="btn btn-primary" style={{flex: 1}} disabled={savingOrder}>
                                    {savingOrder ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowOrderEditModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && (
                <div className="modal-overlay" style={styles.modalOverlay}>
                    <div className="modal-content" style={styles.modalContent}>
                        <h2>{isNewProduct ? 'Create Product' : 'Edit Product'}</h2>
                        <form onSubmit={submitEditHandler} style={{marginTop: '1.5rem'}}>
                            <div className="input-group">
                                <label>Name</label>
                                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                            </div>
                            <div className="input-group flex-row-mobile-column">
                                <div style={{flex: 1}}>
                                    <label>Cost Price</label>
                                    <input type="number" value={editForm.costPrice} onChange={e => setEditForm({...editForm, costPrice: e.target.value})} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Selling Price</label>
                                    <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Discount (%)</label>
                                    <input type="number" min="0" max="100" value={editForm.discountPercentage || ''} onChange={e => setEditForm({...editForm, discountPercentage: e.target.value})} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Count In Stock</label>
                                    <input type="number" value={editForm.countInStock} onChange={e => setEditForm({...editForm, countInStock: e.target.value})} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Weight (kg)</label>
                                    <input type="number" step="0.1" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Images</label>
                                {editForm.images.length > 0 && (
                                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem'}}>
                                        {editForm.images.map((img, idx) => (
                                            <div key={idx} style={{position: 'relative'}}>
                                                <img src={img} alt={`Product ${idx + 1}`} style={{width: '72px', height: '72px', objectFit: 'cover', borderRadius: '4px', border: idx === 0 ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'}} />
                                                {idx === 0 && (
                                                    <span style={{position: 'absolute', bottom: '-2px', left: '0', right: '0', textAlign: 'center', fontSize: '0.65rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-text)', borderRadius: '0 0 4px 4px'}}>Main</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(idx)}
                                                    style={{position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: '#dc3545', color: '#fff', fontSize: '0.75rem', lineHeight: '20px', padding: 0, cursor: 'pointer'}}
                                                    title="Remove image"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                    <input type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Enter image URL" style={{flex: 1}}/>
                                    <button type="button" className="btn btn-outline" onClick={handleAddImageUrl}>+ Add URL</button>
                                </div>
                                <input type="file" multiple accept="image/*" onChange={uploadFileHandler} />
                                {uploading && <span>Uploading...</span>}
                            </div>
                            <div className="input-group flex-row-mobile-column">
                                <div style={{flex: 1}}>
                                    <label>Brand (optional)</label>
                                    <input type="text" value={editForm.brand} onChange={e => setEditForm({...editForm, brand: e.target.value})} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Category</label>
                                    <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c._id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Description (optional)</label>
                                <textarea rows="3" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
                            </div>
                            
                            <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                                <button type="submit" className="btn btn-primary" style={{flex: 1}}>{isNewProduct ? 'Create Product' : 'Save Changes'}</button>
                                <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowEditModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    page: {
        padding: '3rem 1rem',
        minHeight: '80vh',
    },
    header: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '1rem',
    },
    title: {
        fontSize: '1.8rem',
    },
    tabs: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    tabBtn: {
        padding: '0.5rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        borderRadius: '20px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-subtle)',
        color: 'var(--color-text-muted)',
        transition: 'all 0.2s',
    },
    activeTab: {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-text)',
        borderColor: 'var(--color-primary)',
    },
    content: {
        backgroundColor: 'var(--color-bg-main)',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        border: '1px solid var(--color-border)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
    },
    actionBtn: {
        padding: '0.4rem 0.8rem',
        fontSize: '0.85rem',
    },
    disabledBtn: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    statusSuccess: {
        color: '#28a745',
        fontWeight: '500',
    },
    statusDanger: {
        color: '#dc3545',
        fontWeight: '500',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'var(--color-bg-main)',
        padding: '2.5rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    select: {
        padding: '0.4rem',
        borderRadius: '4px',
        border: '1px solid var(--color-border)',
        fontSize: '0.9rem',
        backgroundColor: 'var(--color-bg-main)',
        color: 'var(--color-text-main)',
    },
    statCard: {
        flex: '1',
        minWidth: '250px',
        backgroundColor: 'var(--color-bg-subtle)',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginTop: '0.5rem',
        color: 'var(--color-text-main)',
    },
    couponForm: {
        backgroundColor: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
    },
    modalSectionTitle: {
        fontSize: '1.1rem',
        marginTop: '1.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '0.5rem',
    },
    orderItemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    orderItemRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        flexWrap: 'wrap',
    },
};

export default AdminDashboard;

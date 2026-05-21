import { useState, useEffect, useRef } from 'react';
import {
  fetchMyProducts,
  fetchMyOrders,
  createCoordinatorProduct,
  updateCoordinatorProduct,
  deleteCoordinatorProduct,
} from '../../services/api';
import { uploadFile } from '../../utils/uploadToStorage';
import './CoordinatorProductSection.css';

const CATEGORIES = ['Books', 'Dorm', 'Tech', 'Accessories', 'Clothing', 'Sports', 'Other'];

const STATUS_LABEL = {
  PENDING:  { label: 'Pending Approval', cls: 'status-pending'  },
  APPROVED: { label: 'Approved',         cls: 'status-approved' },
  DELETED:  { label: 'Disabled',         cls: 'status-disabled' },
};

const emptyForm = {
  name: '', description: '', price: '', category: 'Books', imageUrl: '', imageFile: null,
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
};

export default function CoordinatorProductSection() {
  const [tab, setTab]                     = useState('products');
  const [products, setProducts]           = useState([]);
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [editProduct, setEditProduct]     = useState(null);
  const [form, setForm]                   = useState(emptyForm);
  const [imagePreview, setImagePreview]   = useState('');
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving]               = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchMyProducts();
      setProducts(data || []);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await fetchMyOrders();
      setOrders(data || []);
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    if (t === 'orders' && orders.length === 0) loadOrders();
  };

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const openCreate = () => { setEditProduct(null); setForm(emptyForm); setImagePreview(''); setShowModal(true); };
  const openEdit   = (p) => {
    setEditProduct(p);
    setForm({ name: p.name||'', description: p.description||'', price: p.price||'', category: p.category||'Books', imageUrl: p.imageUrl||'', imageFile: null });
    setImagePreview(p.imageUrl || '');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditProduct(null); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, imageFile: file, imageUrl: '' }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { alert('Name and price are required.'); return; }
    try {
      setSaving(true);
      let imageUrl = form.imageUrl;
      if (form.imageFile) {
        setUploading(true); setUploadProgress(0);
        imageUrl = await uploadFile(form.imageFile, 'products', (pct) => setUploadProgress(pct));
        setUploading(false);
      }
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        imageUrl,
      };
      if (editProduct) { await updateCoordinatorProduct(editProduct.id, payload); }
      else             { await createCoordinatorProduct(payload); }
      closeModal();
      await loadProducts();
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    } finally { setSaving(false); setUploading(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteCoordinatorProduct(id); setDeleteConfirm(null); await loadProducts(); }
    catch (err) { alert('Failed to delete product: ' + err.message); }
  };

  const stats = {
    total:    products.length,
    pending:  products.filter(p => p.status === 'PENDING').length,
    approved: products.filter(p => p.status === 'APPROVED').length,
  };
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="coord-product-page">

      {/* Header */}
      <div className="coord-product-header">
        <div>
          <h2 className="coord-product-title">My Products &amp; Orders</h2>
          <p className="coord-product-sub">Manage your marketplace listings and track customer orders</p>
        </div>
        {tab === 'products' && (
          <button className="coord-product-add-btn" onClick={openCreate}>+ Add New Product</button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="cp-tabs">
        <button className={`cp-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => switchTab('products')}>
          🛍️ My Products
        </button>
        <button className={`cp-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => switchTab('orders')}>
          📦 Orders Received
        </button>
      </div>

      {/* ══════════ PRODUCTS TAB ══════════ */}
      {tab === 'products' && (
        <>
          <div className="coord-product-stats">
            <div className="cp-stat"><span className="cp-stat-num">{stats.total}</span><span className="cp-stat-lbl">Total Listings</span></div>
            <div className="cp-stat"><span className="cp-stat-num pending">{stats.pending}</span><span className="cp-stat-lbl">Pending</span></div>
            <div className="cp-stat"><span className="cp-stat-num approved">{stats.approved}</span><span className="cp-stat-lbl">Approved</span></div>
          </div>

          {loading ? (
            <div className="cp-empty">Loading your products…</div>
          ) : products.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon">🛍️</div>
              <p>You haven't listed any products yet.</p>
              <button className="coord-product-add-btn" onClick={openCreate}>List Your First Product</button>
            </div>
          ) : (
            <div className="cp-grid">
              {products.map(p => {
                const s = STATUS_LABEL[p.status] || STATUS_LABEL.PENDING;
                return (
                  <div className="cp-card" key={p.id}>
                    <div className="cp-card-img-wrap">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="cp-card-img" />
                        : <div className="cp-card-no-img">🖼️</div>}
                      <span className={`cp-status-badge ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="cp-card-body">
                      <h3 className="cp-card-name">{p.name}</h3>
                      <p className="cp-card-desc">{p.description || 'No description'}</p>
                      <div className="cp-card-meta">
                        <span className="cp-card-price">LKR {Number(p.price || 0).toLocaleString()}</span>
                        <span className="cp-card-cat">{p.category}</span>
                      </div>
                      <div className="cp-card-actions">
                        <button className="cp-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                        <button className="cp-btn-del"  onClick={() => setDeleteConfirm(p.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════ ORDERS TAB ══════════ */}
      {tab === 'orders' && (
        <>
          <div className="coord-product-stats">
            <div className="cp-stat"><span className="cp-stat-num">{orders.length}</span><span className="cp-stat-lbl">Total Orders</span></div>
            <div className="cp-stat"><span className="cp-stat-num approved">LKR {totalRevenue.toLocaleString()}</span><span className="cp-stat-lbl">Total Revenue</span></div>
          </div>

          {ordersLoading ? (
            <div className="cp-empty">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon">📦</div>
              <p>No orders yet. Orders will appear here once customers purchase your products.</p>
            </div>
          ) : (
            <div className="cp-orders-list">
              {orders.map(order => (
                <div className="cp-order-card" key={order.saleId}>
                  {/* Order header */}
                  <div className="cp-order-header">
                    <div>
                      <span className="cp-order-id">Order #{(order.saleId || '').slice(-8).toUpperCase()}</span>
                      <span className="cp-order-date">{fmtDate(order.purchasedAt)}</span>
                    </div>
                    <span className="cp-order-total">LKR {Number(order.totalAmount || 0).toLocaleString()}</span>
                  </div>

                  {/* Buyer info */}
                  <div className="cp-order-buyer">
                    <span className="cp-order-label">Buyer</span>
                    <span className="cp-order-value">{order.userName || '—'}</span>
                    <span className="cp-order-value muted">{order.userEmail || ''}</span>
                  </div>

                  {/* Items */}
                  <div className="cp-order-items">
                    <span className="cp-order-label">Items Purchased</span>
                    {(order.items || []).map((item, idx) => (
                      <div className="cp-order-item-row" key={idx}>
                        <span className="cp-order-item-name">{item.productName}</span>
                        <span className="cp-order-item-qty">× {item.quantity}</span>
                        <span className="cp-order-item-price">
                          LKR {Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Payment ID */}
                  {order.stripePaymentId && (
                    <div className="cp-order-payment">
                      <span className="cp-order-label">Payment ID</span>
                      <span className="cp-order-payment-id">{order.stripePaymentId}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="cp-modal-bg" onClick={closeModal}>
          <div className="cp-modal" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3>{editProduct ? 'Edit Product' : 'New Product Listing'}</h3>
              <button className="cp-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form className="cp-modal-form" onSubmit={handleSave}>
              <div className="cp-field">
                <label>Product Image</label>
                <div className="cp-img-upload" onClick={() => fileRef.current?.click()}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className="cp-img-preview" />
                    : <div className="cp-img-placeholder"><span>📷</span><p>Click to upload image</p></div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                {uploading && (
                  <div className="cp-upload-bar">
                    <div className="cp-upload-fill" style={{ width: `${uploadProgress}%` }} />
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>
              <div className="cp-field">
                <label>Product Name *</label>
                <input type="text" placeholder="e.g. Engineering Textbook"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="cp-field">
                <label>Description</label>
                <textarea placeholder="Describe the product condition, details…" rows={3}
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="cp-field-row">
                <div className="cp-field">
                  <label>Price (LKR) *</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="cp-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <p className="cp-note">ℹ️ Listing will be submitted for admin approval before appearing in the marketplace.</p>
              <div className="cp-modal-footer">
                <button type="button" className="cp-btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="cp-btn-save" disabled={saving || uploading}>
                  {saving ? 'Saving…' : editProduct ? 'Update Product' : 'Submit Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="cp-modal-bg" onClick={() => setDeleteConfirm(null)}>
          <div className="cp-modal cp-modal--sm" onClick={e => e.stopPropagation()}>
            <h3>Delete Product?</h3>
            <p>This action cannot be undone.</p>
            <div className="cp-modal-footer">
              <button className="cp-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="cp-btn-del" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
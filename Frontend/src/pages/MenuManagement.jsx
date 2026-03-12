import { useMemo, useState } from "react";
import {
  Search, Plus, Filter, Eye, RefreshCw, Globe, Share2, 
  MoreVertical, Edit3, CheckCircle2, AlertCircle, MapPin, ChevronDown, Bell, X
} from "lucide-react";

const INITIAL_MENU_ITEMS = [
  { id: 1, name: "Truffle Mushroom Soup", category: "Starter", tags: ["Veg", "Featured"], price: "24.50", status: "Live", pos: "POS Synced", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=200" },
  { id: 2, name: "Grilled Salmon", category: "Main course", tags: ["Non-Veg", "Limited"], price: "24.50", status: "Not Live", pos: "Issue POS Error", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=200" },
  { id: 3, name: "Margherita Pizz", category: "Pizza", tags: ["Veg", "Featured"], price: "24.50", status: "Live", pos: "POS Synced", locallyModified: true, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=200" },
  { id: 4, name: "Pad Thai Noodle", category: "Asian Cuisine", tags: ["Veg", "Featured"], price: "24.50", status: "Pending Approval", pos: null, img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=200" }
];

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState(INITIAL_MENU_ITEMS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Main course", price: "", tags: "Veg" });

  // ── FILTER LOGIC ──
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, items]);

  // ── ADD ITEM LOGIC ──
  const handleSaveItem = (e) => {
    e.preventDefault();
    const itemToAdd = {
      ...newItem,
      id: Date.now(),
      tags: newItem.tags.split(",").map(t => t.trim()),
      status: "Pending Approval",
      pos: "Syncing...",
      img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200"
    };
    setItems([itemToAdd, ...items]);
    setShowAddModal(false);
    setNewItem({ name: "", category: "Main course", price: "", tags: "Veg" });
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div style={{ flex: 1, padding: "32px 48px", background: "#ffffff", height: '100vh', overflowY: 'auto', position: 'relative' }}>
      
      {/* ── ADD ITEM MODAL ── */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div className="animate-in" style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900 }}>Add New Item</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>Item Name*</label>
                <input required style={inputStyle} placeholder="e.g. Pasta Carbonara" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={inputStyle} value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                  <option>Main course</option><option>Starter</option><option>Dessert</option><option>Drinks</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 15 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Price ($)</label>
                  <input required type="number" style={inputStyle} placeholder="0.00" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Tags (comma separated)</label>
                  <input style={inputStyle} placeholder="Veg, Spicy" value={newItem.tags} onChange={e => setNewItem({...newItem, tags: e.target.value})} />
                </div>
              </div>
              <button type="submit" style={saveBtnStyle}>Add to Menu</button>
            </form>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "10px 14px", borderRadius: 12, border: "1px solid #f1f5f9" }}>
          <MapPin size={16} color="#64748b" />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Sub Branch - Aston Cafe, NY City.</span>
          <ChevronDown size={14} color="#64748b" />
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: "#1e293b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>SD</div>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Admin</span>
            <div style={{ position: "relative" }}>
              <Bell size={22} color="#64748b" />
              <span style={notifBadgeStyle}>16</span>
            </div>
          </div>
          <button style={refreshBtnStyle}><RefreshCw size={14} /> Refresh data</button>
        </div>
      </header>

      {/* ── TITLE BLOCK ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
        <div>
          <p style={{ color: "#4f46e5", fontSize: 10, fontWeight: 900, margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>Active Branch</p>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: "6px 0 0 0" }}>Menu Management</h1>
        </div>
        <button onClick={() => setShowAddModal(true)} style={primaryBtnStyle}>Create new item <Plus size={20} /></button>
      </div>

      {/* ── TOOLBAR ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
        <button onClick={() => setShowAddModal(true)} style={toolbarBtnStyle}><Plus size={15} /> Add Item</button>
        <button style={toolbarBtnStyle}><Plus size={15} /> Category</button>
        <button style={toolbarBtnStyle}><Filter size={15} /> Filters</button>
        <button style={toolbarBtnStyle}><Eye size={15} /> Preview</button>
        <button style={toolbarBtnStyle}><RefreshCw size={14} /> Sync POS</button>
      </div>

      <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 24px 0' }}>Summer Brunch Menu</h3>
      
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={20} style={{ position: "absolute", left: 16, top: 12, color: "#94a3b8" }} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search menu items" style={searchInputStyle} />
        </div>
      </div>

      {/* ── LIST ── */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {filteredItems.map((item) => (
          <div key={item.id} style={itemRowStyle}>
            <img src={item.img} alt={item.name} style={thumbStyle} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 17, fontWeight: 900, margin: "0 0 6px 0" }}>{item.name}</h4>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>{item.category}</span>
                {item.tags.map(tag => <span key={tag} style={tagStyle}>{tag}</span>)}
              </div>
              <div style={{ marginTop: 14, fontSize: 20, fontWeight: 900 }}>${item.price}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>{item.status}</span>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => deleteItem(item.id)} style={actionBtnStyle} title="Delete"><X size={18} color="#ef4444" /></button>
                  <button style={actionBtnStyle}><Edit3 size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── STYLES ── */
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' };
const modalContentStyle = { width: 450, background: '#fff', height: '100%', padding: 40, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none' };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 8, color: '#475569' };
const saveBtnStyle = { background: '#1e1b4b', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, cursor: 'pointer', marginTop: 20 };
const primaryBtnStyle = { background: "#1e1b4b", color: "#fff", border: "none", padding: "14px 24px", borderRadius: 14, fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" };
const toolbarBtnStyle = { display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, fontWeight: 800, color: "#475569", cursor: "pointer" };
const searchInputStyle = { width: "100%", height: 46, padding: "0 16px 0 48px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 15, outline: "none" };
const itemRowStyle = { display: "flex", gap: 24, padding: "24px 0", borderBottom: "1.5px solid #f8fafc", alignItems: "center" };
const thumbStyle = { width: 110, height: 80, borderRadius: 14, objectFit: "cover" };
const tagStyle = { fontSize: 12, fontWeight: 800, color: "#64748b", background: "#f1f5f9", padding: "3px 10px", borderRadius: 6 };
const actionBtnStyle = { width: 38, height: 38, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const refreshBtnStyle = { display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 800, color: "#1e293b", cursor: "pointer" };
const notifBadgeStyle = { position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 900, width: 15, height: 15, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" };
const filterPillStyle = { display: "flex", alignItems: "center", gap: 10, padding: "0 18px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#ffffff", fontSize: 14, fontWeight: 800, color: "#475569", height: 46, cursor: "pointer" };
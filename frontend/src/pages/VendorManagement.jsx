// frontend/src/pages/VendorManagement.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import vendorService from '../services/vendorService';
import {
  Store, Users, CheckCircle2, Clock, Plus, Edit3, Eye, Trash2,
  X, Phone, Mail, CalendarDays, Tag, Activity, TrendingUp,
  Utensils, Camera, Cpu, Star, Zap, AlertCircle, Loader2,
} from 'lucide-react';

/* ─────────────── Constants ─────────────── */
const SERVICE_TYPES  = ['Equipment', 'Catering', 'Media'];
const STATUS_OPTIONS = ['Active', 'Pending', 'Completed'];
const EVENTS = [
  'Annual Tech Expo', 'Leadership Summit', 'Award Night 2026',
  'Cultural Festival', 'Graduation Ceremony', 'Hackathon 2026', 'Sports Meet 2026',
];

const EMPTY_FORM = { name: '', service: '', contact: '', email: '', event: '', status: 'Pending' };

/* ─────────────── Style helpers ─────────────── */
const serviceIcon  = (s) => s === 'Equipment' ? <Cpu size={13}/> : s === 'Catering' ? <Utensils size={13}/> : <Camera size={13}/>;
const serviceColor = (s) =>
  s === 'Equipment' ? { color:'#38bdf8', bg:'rgba(56,189,248,0.12)' }
  : s === 'Catering'  ? { color:'#fb923c', bg:'rgba(251,146,60,0.12)' }
  : { color:'#a78bfa', bg:'rgba(167,139,250,0.12)' };
const statusStyle  = (st) =>
  st === 'Active'    ? { color:'#34d399', bg:'rgba(52,211,153,0.12)',  border:'rgba(52,211,153,0.3)' }
  : st === 'Completed' ? { color:'#818cf8', bg:'rgba(129,140,248,0.12)', border:'rgba(129,140,248,0.3)' }
  : { color:'#fbbf24', bg:'rgba(251,191,36,0.12)', border:'rgba(251,191,36,0.3)' };

/* ─────────────── Standalone sub-components (OUTSIDE main component) ─────────────── */
// NOTE: These are intentionally outside VendorManagement so React never unmounts them on re-render.

const TextInput = ({ label, id, type = 'text', placeholder, value, onChange, error }) => (
  <div style={{ marginBottom: '1.1rem' }}>
    <label htmlFor={id} style={{ display:'block', fontSize:'0.82rem', color:'#94a3b8', marginBottom:'5px', fontWeight:500 }}>
      {label}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete="off"
      onChange={onChange}
      style={{
        width:'100%', padding:'11px 14px', borderRadius:'10px',
        background:'rgba(15,23,42,0.6)', color:'white', fontSize:'0.94rem', outline:'none',
        border:`1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
        transition:'border-color 0.2s',
      }}
      onFocus={ev  => { ev.target.style.borderColor = error ? '#ef4444' : '#6366f1'; }}
      onBlur={ev   => { ev.target.style.borderColor = error ? '#ef4444' : 'rgba(255,255,255,0.1)'; }}
    />
    {error && (
      <p style={{ display:'flex', alignItems:'center', gap:'4px', color:'#ef4444', fontSize:'0.75rem', marginTop:'4px' }}>
        <AlertCircle size={12}/> {error}
      </p>
    )}
  </div>
);

const SelectInput = ({ label, id, options, value, onChange, error }) => (
  <div style={{ marginBottom: '1.1rem' }}>
    <label htmlFor={id} style={{ display:'block', fontSize:'0.82rem', color:'#94a3b8', marginBottom:'5px', fontWeight:500 }}>
      {label}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      style={{
        width:'100%', padding:'11px 14px', borderRadius:'10px', cursor:'pointer',
        background:'rgba(15,23,42,0.9)', color: value ? 'white' : '#64748b',
        fontSize:'0.94rem', outline:'none',
        border:`1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <option value="" disabled>Select {label}</option>
      {options.map(o => <option key={o} value={o} style={{ color:'white', background:'#1e293b' }}>{o}</option>)}
    </select>
    {error && (
      <p style={{ display:'flex', alignItems:'center', gap:'4px', color:'#ef4444', fontSize:'0.75rem', marginTop:'4px' }}>
        <AlertCircle size={12}/> {error}
      </p>
    )}
  </div>
);

const ActionBtn = ({ icon, color, title, onClick, disabled }) => (
  <motion.button
    whileHover={!disabled ? { scale:1.15 } : {}} whileTap={!disabled ? { scale:0.9 } : {}}
    title={title} onClick={onClick} disabled={disabled}
    style={{
      background:`${color}18`, border:`1px solid ${color}30`, color,
      borderRadius:'8px', padding:'6px 9px', cursor: disabled ? 'not-allowed' : 'pointer',
      display:'flex', alignItems:'center', lineHeight:1,
    }}
  >{icon}</motion.button>
);

/* ─────────────── Frontend validation ─────────────── */
const validate = (form) => {
  const e = {};
  if (!form.name.trim())
    e.name = 'Vendor name is required';
  else if (form.name.trim().length < 2)
    e.name = 'Vendor name must be at least 2 characters';
  else if (form.name.trim().length > 100)
    e.name = 'Vendor name cannot exceed 100 characters';

  if (!form.service)
    e.service = 'Service type is required';

  if (!form.contact.trim())
    e.contact = 'Contact number is required';
  else if (!/^\+?[\d\s\-]{7,15}$/.test(form.contact.trim()))
    e.contact = 'Enter a valid contact number (7–15 digits)';

  if (!form.email.trim())
    e.email = 'Email address is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    e.email = 'Enter a valid email address';

  if (!form.event)
    e.event = 'Please assign an event';

  return e;
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const VendorManagement = () => {
  const [vendors,     setVendors]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [apiError,    setApiError]    = useState('');

  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);   // null = add, id = edit
  const [viewTarget,  setViewTarget]  = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [deleting,    setDeleting]    = useState(false);

  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  /* ── Fetch from backend ── */
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vendorService.getAll();
      setVendors(res.data);
    } catch {
      // fallback to an empty list; user can still add new
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  /* ── Summary ── */
  const total     = vendors.length;
  const active    = vendors.filter(v => v.status === 'Active').length;
  const pending   = vendors.filter(v => v.status === 'Pending').length;
  const completed = vendors.filter(v => v.status === 'Completed').length;

  const summaryCards = [
    { label:'Total Vendors',      value:total,     icon:<Store size={26}/>,        accent:'#6366f1' },
    { label:'Active Vendors',     value:active,    icon:<CheckCircle2 size={26}/>, accent:'#10b981' },
    { label:'Pending Requests',   value:pending,   icon:<Clock size={26}/>,        accent:'#f59e0b' },
    { label:'Completed Services', value:completed, icon:<Users size={26}/>,        accent:'#ec4899' },
  ];

  /* ── Analytics ── */
  const mostUsed = SERVICE_TYPES.reduce((acc, s) => {
    const cnt = vendors.filter(v => v.service === s).length;
    return cnt > acc.count ? { type:s, count:cnt } : acc;
  }, { type:'', count:0 });

  const recentActivity = [...vendors].slice(-3).reverse();

  /* ── Handlers: field change ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // clear individual error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  /* ── Open modals ── */
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setApiError('');
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditTarget(v._id || v.id);
    setForm({ name:v.name, service:v.service, contact:v.contact, email:v.email, event:v.event, status:v.status });
    setErrors({});
    setApiError('');
    setModalOpen(true);
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      if (editTarget) {
        const res = await vendorService.update(editTarget, form);
        setVendors(prev => prev.map(v => (v._id || v.id) === editTarget ? res.data : v));
        toast.success('Vendor updated successfully!');
      } else {
        const res = await vendorService.create(form);
        setVendors(prev => [res.data, ...prev]);
        toast.success('Vendor added successfully!');
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save vendor. Please try again.';
      setApiError(msg);
      // also surface per-field errors from back-end if possible
      const beErrors = err?.response?.data?.errors || [];
      if (beErrors.length > 0) toast.error(beErrors[0]);
      else toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await vendorService.remove(deleteId);
      setVendors(prev => prev.filter(v => (v._id || v.id) !== deleteId));
      toast.success('Vendor removed.');
    } catch {
      toast.error('Failed to remove vendor.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  /* ════════════════ RENDER ════════════════ */
  return (
    <div style={{ padding:'2rem 5%', minHeight:'100vh', position:'relative' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom:'0.6rem' }}>
          <div>
            <h1 style={{ fontSize:'2.2rem', fontWeight:800, lineHeight:1.2 }}>
              Vendor{' '}
              <span style={{ background:'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Management
              </span>
            </h1>
            <p style={{ color:'#94a3b8', marginTop:'0.4rem', fontSize:'0.9rem', maxWidth:'620px' }}>
              Third Party Vendor Coordinator &amp; Services — Manages external vendors such as equipment providers,
              catering, and media services. Organizers can assign vendors, track service status, and manage
              event-related resources efficiently.
            </p>
          </div>

          <motion.button
            whileHover={{ scale:1.04, boxShadow:'0 8px 30px rgba(99,102,241,0.5)' }}
            whileTap={{ scale:0.97 }}
            onClick={openAdd}
            style={{
              display:'flex', alignItems:'center', gap:'8px',
              background:'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)',
              color:'white', border:'none', borderRadius:'12px',
              padding:'12px 22px', fontWeight:600, fontSize:'0.95rem',
              cursor:'pointer', boxShadow:'0 4px 15px rgba(99,102,241,0.35)',
            }}
          >
            <Plus size={18}/> Add Vendor
          </motion.button>
        </div>
      </motion.div>

      {/* ── Summary Cards ── */}
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.1 }}
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'1.2rem', margin:'2rem 0' }}
      >
        {summaryCards.map((c, i) => (
          <motion.div key={i} whileHover={{ scale:1.03, y:-4 }} className="glass-card"
            style={{ padding:'1.4rem 1.6rem', borderLeft:`4px solid ${c.accent}`, boxShadow:`0 0 20px ${c.accent}22`, display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            <div style={{ color:c.accent }}>{c.icon}</div>
            <div style={{ fontSize:'2rem', fontWeight:800, color:'white' }}>{loading ? '—' : c.value}</div>
            <div style={{ fontSize:'0.85rem', color:'#94a3b8', fontWeight:500 }}>{c.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.2 }}
        className="glass-card" style={{ padding:'1.8rem', marginBottom:'2rem', overflowX:'auto' }}
      >
        <h2 style={{ fontSize:'1.2rem', fontWeight:700, marginBottom:'1.4rem', display:'flex', alignItems:'center', gap:'10px' }}>
          <Activity size={20} style={{ color:'#6366f1' }}/> Vendor Directory
        </h2>

        {loading ? (
          <div style={{ textAlign:'center', padding:'3rem', color:'#64748b' }}>
            <Loader2 size={32} style={{ animation:'spin 1s linear infinite', color:'#6366f1' }}/>
            <p style={{ marginTop:'0.8rem' }}>Loading vendors…</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'720px' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                {['Vendor Name','Service Type','Assigned Event','Status','Contact','Actions'].map(col => (
                  <th key={col} style={{ padding:'10px 14px', textAlign:'left', fontSize:'0.75rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, idx) => {
                const sc = serviceColor(v.service);
                const ss = statusStyle(v.status);
                const vid = v._id || v.id;
                return (
                  <motion.tr key={vid}
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:idx*0.04 }}
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'13px 14px', fontWeight:600, color:'white' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:34, height:34, borderRadius:'10px', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8', fontWeight:700, fontSize:'0.85rem', flexShrink:0 }}>
                          {v.name.charAt(0).toUpperCase()}
                        </div>
                        {v.name}
                      </div>
                    </td>
                    <td style={{ padding:'13px 14px' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'4px 10px', borderRadius:'20px', background:sc.bg, color:sc.color, fontSize:'0.78rem', fontWeight:600 }}>
                        {serviceIcon(v.service)} {v.service}
                      </span>
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:'0.85rem', color:'#94a3b8' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <CalendarDays size={13} style={{ color:'#64748b' }}/> {v.event}
                      </div>
                    </td>
                    <td style={{ padding:'13px 14px' }}>
                      <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:'20px', background:ss.bg, color:ss.color, border:`1px solid ${ss.border}`, fontSize:'0.78rem', fontWeight:600 }}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:'0.82rem', color:'#94a3b8' }}>{v.contact}</td>
                    <td style={{ padding:'13px 14px' }}>
                      <div style={{ display:'flex', gap:'8px' }}>
                        <ActionBtn icon={<Eye size={14}/>}   color="#38bdf8" title="View"   onClick={() => setViewTarget(v)}/>
                        <ActionBtn icon={<Edit3 size={14}/>}  color="#818cf8" title="Edit"   onClick={() => openEdit(v)}/>
                        <ActionBtn icon={<Trash2 size={14}/>} color="#f87171" title="Remove" onClick={() => setDeleteId(vid)}/>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && vendors.length === 0 && (
          <div style={{ textAlign:'center', color:'#475569', padding:'3rem 0' }}>
            No vendors yet. Click <strong style={{ color:'#818cf8' }}>Add Vendor</strong> to get started.
          </div>
        )}
      </motion.div>

      {/* ── Analytics ── */}
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.3 }}
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1.2rem', marginBottom:'4rem' }}
      >
        {/* Performance */}
        <div className="glass-card" style={{ padding:'1.5rem', borderLeft:'4px solid #6366f1' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem' }}>
            <TrendingUp size={18} style={{ color:'#6366f1' }}/>
            <span style={{ fontWeight:600, fontSize:'0.95rem' }}>Vendor Performance</span>
          </div>
          {SERVICE_TYPES.map(s => {
            const cnt = vendors.filter(v => v.service === s).length;
            const pct = total ? Math.round((cnt/total)*100) : 0;
            const sc  = serviceColor(s);
            return (
              <div key={s} style={{ marginBottom:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#94a3b8', marginBottom:'4px' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:'5px', color:sc.color }}>{serviceIcon(s)} {s}</span>
                  <span>{pct}%</span>
                </div>
                <div style={{ height:'6px', borderRadius:'99px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ delay:0.5, duration:0.8 }}
                    style={{ height:'100%', borderRadius:'99px', background:sc.color }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Most Used */}
        <div className="glass-card" style={{ padding:'1.5rem', borderLeft:'4px solid #f59e0b' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem' }}>
            <Star size={18} style={{ color:'#f59e0b' }}/>
            <span style={{ fontWeight:600, fontSize:'0.95rem' }}>Most Used Type</span>
          </div>
          {mostUsed.type ? (
            <>
              <div style={{ fontSize:'2.2rem', fontWeight:800, color:'white', marginBottom:'0.2rem' }}>{mostUsed.type}</div>
              <div style={{ color:'#94a3b8', fontSize:'0.85rem' }}>{mostUsed.count} vendor{mostUsed.count!==1?'s':''} assigned</div>
              <div style={{ marginTop:'1rem', display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {STATUS_OPTIONS.map(s => {
                  const n  = vendors.filter(v => v.service===mostUsed.type && v.status===s).length;
                  const ss = statusStyle(s);
                  return <span key={s} style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.75rem', background:ss.bg, color:ss.color, border:`1px solid ${ss.border}` }}>{s}: {n}</span>;
                })}
              </div>
            </>
          ) : <p style={{ color:'#475569' }}>No data yet.</p>}
        </div>

        {/* Recent */}
        <div className="glass-card" style={{ padding:'1.5rem', borderLeft:'4px solid #10b981' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem' }}>
            <Zap size={18} style={{ color:'#10b981' }}/>
            <span style={{ fontWeight:600, fontSize:'0.95rem' }}>Recent Activity</span>
          </div>
          {recentActivity.length === 0 && <p style={{ color:'#475569' }}>No vendors yet.</p>}
          {recentActivity.map(v => {
            const ss = statusStyle(v.status);
            return (
              <div key={v._id||v.id} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:ss.color, flexShrink:0, boxShadow:`0 0 6px ${ss.color}` }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:600, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{v.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{v.service} · {v.status}</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ══════════ ADD / EDIT MODAL ══════════ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div key="bd" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => !submitting && setModalOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(5px)', zIndex:900, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          >
            <motion.div key="box"
              initial={{ scale:0.9, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.9, opacity:0, y:20 }}
              transition={{ type:'spring', stiffness:300, damping:28 }}
              onClick={e => e.stopPropagation()}
              className="glass-card"
              style={{ width:'100%', maxWidth:'520px', padding:'2rem', maxHeight:'90vh', overflowY:'auto', position:'relative' }}
            >
              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.6rem' }}>
                <div>
                  <h2 style={{ fontSize:'1.25rem', fontWeight:700 }}>
                    {editTarget ? 'Edit' : 'Add'}{' '}
                    <span style={{ color:'#818cf8' }}>Vendor</span>
                  </h2>
                  <p style={{ fontSize:'0.8rem', color:'#64748b', marginTop:'2px' }}>
                    {editTarget ? 'Update vendor details below.' : 'Fill in the details to register a new vendor.'}
                  </p>
                </div>
                <button onClick={() => !submitting && setModalOpen(false)}
                  style={{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:'8px', color:'#94a3b8', cursor:'pointer', padding:'6px' }}>
                  <X size={18}/>
                </button>
              </div>

              {/* API-level error banner */}
              {apiError && (
                <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'10px 14px', marginBottom:'1rem', color:'#f87171', fontSize:'0.85rem' }}>
                  <AlertCircle size={16}/> {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <TextInput  label="Vendor Name"     id="name"    placeholder="e.g. TechSound Pro"    value={form.name}    onChange={handleChange} error={errors.name}/>
                <SelectInput label="Service Type"   id="service" options={SERVICE_TYPES}              value={form.service} onChange={handleChange} error={errors.service}/>
                <TextInput  label="Contact Number"  id="contact" placeholder="+94 77 000 0000"        value={form.contact} onChange={handleChange} error={errors.contact}/>
                <TextInput  label="Email Address"   id="email"   type="email" placeholder="vendor@example.com" value={form.email} onChange={handleChange} error={errors.email}/>
                <SelectInput label="Assign Event"   id="event"   options={EVENTS}                    value={form.event}   onChange={handleChange} error={errors.event}/>
                <SelectInput label="Status"         id="status"  options={STATUS_OPTIONS}             value={form.status}  onChange={handleChange} error={errors.status}/>

                <motion.button type="submit" disabled={submitting}
                  whileHover={!submitting ? { scale:1.02, boxShadow:'0 8px 30px rgba(99,102,241,0.5)' } : {}}
                  whileTap={!submitting ? { scale:0.98 } : {}}
                  style={{
                    width:'100%', padding:'13px', borderRadius:'12px', border:'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    background: submitting
                      ? 'rgba(99,102,241,0.4)'
                      : 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)',
                    color:'white', fontWeight:700, fontSize:'1rem', marginTop:'0.4rem',
                    boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                  }}
                >
                  {submitting && <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }}/>}
                  {submitting ? 'Saving…' : (editTarget ? 'Save Changes' : 'Add Vendor')}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ VIEW MODAL ══════════ */}
      <AnimatePresence>
        {viewTarget && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setViewTarget(null)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(5px)', zIndex:900, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          >
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              onClick={e => e.stopPropagation()} className="glass-card"
              style={{ width:'100%', maxWidth:'440px', padding:'2rem', position:'relative' }}
            >
              <button onClick={() => setViewTarget(null)}
                style={{ position:'absolute', top:'1rem', right:'1rem', background:'rgba(255,255,255,0.07)', border:'none', borderRadius:'8px', color:'#94a3b8', cursor:'pointer', padding:'6px' }}>
                <X size={18}/>
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'1.5rem' }}>
                <div style={{ width:52, height:52, borderRadius:'14px', background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:800, color:'white' }}>
                  {viewTarget.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize:'1.2rem', fontWeight:700 }}>{viewTarget.name}</h2>
                  {(() => { const sc = serviceColor(viewTarget.service); return (
                    <span style={{ ...sc, fontSize:'0.78rem', fontWeight:600, display:'inline-flex', alignItems:'center', gap:'4px', padding:'2px 9px', borderRadius:'20px', background:sc.bg }}>
                      {serviceIcon(viewTarget.service)} {viewTarget.service}
                    </span>
                  ); })()}
                </div>
              </div>
              {[
                { icon:<CalendarDays size={15}/>, label:'Assigned Event', val:viewTarget.event },
                { icon:<Tag size={15}/>,          label:'Status',         val:viewTarget.status },
                { icon:<Phone size={15}/>,        label:'Contact',        val:viewTarget.contact },
                { icon:<Mail size={15}/>,         label:'Email',          val:viewTarget.email },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color:'#64748b' }}>{icon}</span>
                  <span style={{ color:'#64748b', fontSize:'0.82rem', width:'120px', flexShrink:0 }}>{label}</span>
                  <span style={{ fontSize:'0.9rem', color:'white', fontWeight:500 }}>{val}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ DELETE CONFIRM ══════════ */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(5px)', zIndex:950, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          >
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              className="glass-card" style={{ width:'100%', maxWidth:'380px', padding:'2rem', textAlign:'center' }}
            >
              <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', border:'1px solid rgba(239,68,68,0.3)' }}>
                <Trash2 size={24} style={{ color:'#ef4444' }}/>
              </div>
              <h3 style={{ fontSize:'1.15rem', fontWeight:700, marginBottom:'0.5rem' }}>Remove Vendor?</h3>
              <p style={{ color:'#94a3b8', fontSize:'0.87rem', marginBottom:'1.5rem' }}>This action cannot be undone. The vendor will be permanently removed from the system.</p>
              <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
                <button onClick={() => setDeleteId(null)} disabled={deleting}
                  style={{ padding:'10px 22px', borderRadius:'10px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'white', cursor:'pointer', fontWeight:600 }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  style={{ padding:'10px 22px', borderRadius:'10px', background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', color:'white', cursor:deleting?'not-allowed':'pointer', fontWeight:600, boxShadow:'0 4px 15px rgba(239,68,68,0.35)', display:'flex', alignItems:'center', gap:'6px' }}>
                  {deleting && <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>}
                  {deleting ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VendorManagement;

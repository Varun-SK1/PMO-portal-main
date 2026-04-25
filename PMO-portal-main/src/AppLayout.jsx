import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import UpdateButton from './UpdateButton';


function getTimeAgo(dateString) {
  const now = new Date(); const date = new Date(dateString);
  const d = Math.floor((now - date) / 86400000);
  const h = Math.floor((now - date) / 3600000);
  const m = Math.floor((now - date) / 60000);
  if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`; if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const IconOverview = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>);
const IconProgrammes = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>);
const IconDashboard = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>);
const IconChat = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>);
const IconMessages = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
const IconPowerBI = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>);
const IconBell = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>);
const IconMenu = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const IconExternal = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.4 }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>);

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const [theme, setTheme] = useState(localStorage.getItem('jlr-theme') || 'default');

  const applyTheme = (name) => {
    setTheme(name);
    localStorage.setItem('jlr-theme', name);
    const themes = {
      default: {
        bg: '#F5F2ED', card: '#fff', border: '#E8E4DE', borderSubtle: '#F0EEEB',
        text: '#2A2A2A', muted: '#777', faint: '#AAA',
        hover: '#F5F2ED', inputBg: '#FAFAF8',
      },
      'high-contrast': {
        bg: '#FFFFFF', card: '#FFFFFF', border: '#000000', borderSubtle: '#555555',
        text: '#000000', muted: '#333333', faint: '#555555',
        hover: '#EEEEEE', inputBg: '#FFFFFF',
      },
      'dark': {
        bg: '#1A1A1A', card: '#2A2A2A', border: '#444444', borderSubtle: '#333333',
        text: '#E8E8E8', muted: '#AAAAAA', faint: '#777777',
        hover: '#333333', inputBg: '#222222',
      },
      'warm': {
        bg: '#FDF8F0', card: '#FFFFFF', border: '#E8DDD0', borderSubtle: '#F0E8D8',
        text: '#3A2A1A', muted: '#8A7A6A', faint: '#B0A090',
        hover: '#F8F0E0', inputBg: '#FDFAF3',
      },
    };
    const t = themes[name];
    const root = document.documentElement.style;
    root.setProperty('--jlr-bg', t.bg);
    root.setProperty('--jlr-card', t.card);
    root.setProperty('--jlr-border', t.border);
    root.setProperty('--jlr-border-subtle', t.borderSubtle);
    root.setProperty('--jlr-text', t.text);
    root.setProperty('--jlr-muted', t.muted);
    root.setProperty('--jlr-faint', t.faint);
    root.setProperty('--jlr-hover', t.hover);
    root.setProperty('--jlr-input-bg', t.inputBg);
  };

 // eslint-disable-next-line react-hooks/exhaustive-deps
   useEffect(() => { applyTheme(theme); }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (prof) setProfile(prof);
      }
    };
    getUser();
  }, []);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (!error && data) setNotifications(data);
  }, []);
  useEffect(() => { fetchNotifications(); const i = setInterval(fetchNotifications, 30000); return () => clearInterval(i); }, [fetchNotifications]);

  const markAsRead = async (id) => { await supabase.from('notifications').update({ is_read: true }).eq('id', id); setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: true } : n)); };
  const markAllRead = async () => { const ids = notifications.filter(n => !n.is_read).map(n => n.id); if (!ids.length) return; await supabase.from('notifications').update({ is_read: true }).in('id', ids); setNotifications(p => p.map(n => ({ ...n, is_read: true }))); };
  const handleLogout = async () => { await supabase.auth.signOut(); };
  const getInitials = (e) => e ? e.split('@')[0].slice(0, 2).toUpperCase() : 'U';

  const allNavItems = [
    { label: 'Overview', path: '/', Icon: IconOverview, roles: ['executive_manager', 'programme_manager'] },
    { label: 'Programmes', path: '/programmes', Icon: IconProgrammes, roles: ['executive_manager', 'programme_manager', 'employee'] },
    { label: 'Dashboard', path: '/dashboard', Icon: IconDashboard, roles: ['executive_manager', 'programme_manager', 'employee'] },
    { label: 'Messaging Channel', path: '/chat', Icon: IconChat, roles: ['executive_manager', 'programme_manager', 'employee'] },
    { label: 'Leadership Updates', path: '/messages', Icon: IconMessages, roles: ['executive_manager', 'programme_manager'] },
    { label: 'Power BI Service', path: 'https://app.powerbi.com', Icon: IconPowerBI, roles: ['executive_manager', 'programme_manager'], external: true },
  ];

  const navItems = allNavItems.filter(item =>
    !profile || item.roles.includes(profile.role)
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--jlr-bg)', display: 'flex', flexDirection: 'column', fontFamily: "'Aptos', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ─── Navbar ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '56px', background: '#2B3A2E', position: 'sticky', top: 0, zIndex: 300 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#fff', padding: '7px', display: 'flex', borderRadius: '6px' }}><IconMenu /></button>
          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <img src="/jlr-logo.png" alt="JLR" style={{ height: '26px', objectFit: 'contain', filter: 'brightness(2)' }} />
          <div>
            <span style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>PMO Portal</span>
            <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Jaguar Land Rover</span>
          </div>
          {profile && (
            <div style={{ marginLeft: '12px', background: 'rgba(196,162,101,0.15)', border: '1px solid rgba(196,162,101,0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', color: '#C4A265', fontWeight: 600, letterSpacing: '0.03em' }}>
              {profile.role === 'executive_manager' ? 'All Programmes' : `Programme: ${profile.programme_code?.replace('PRG_', '') || 'Unassigned'}`}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>

          <UpdateButton pageName={location.pathname.replace('/', '') || 'Overview'} />

          <button onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', padding: '7px', color: '#fff', borderRadius: '6px', display: 'flex' }}>
            <IconBell />
            {unreadCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: '#D03438', borderRadius: '50%', fontSize: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '2px solid #2B3A2E' }}>{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div style={{ position: 'absolute', top: '48px', right: '40px', background: 'var(--jlr-card)', border: '1px solid var(--jlr-border)', borderRadius: '10px', width: '340px', zIndex: 200, boxShadow: '0 16px 48px rgba(0,0,0,0.1)', maxHeight: '420px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--jlr-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--jlr-text)', fontSize: '14px', fontWeight: 600 }}>Notifications</span>
                {unreadCount > 0 && <span onClick={markAllRead} style={{ color: '#C4A265', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>}
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? <div style={{ padding: '28px', textAlign: 'center', color: 'var(--jlr-faint)', fontSize: '13px' }}>No notifications</div>
                : notifications.map(n => (
                  <div key={n.id} onClick={() => markAsRead(n.id)} style={{ padding: '11px 16px', borderBottom: '1px solid var(--jlr-border-subtle)', background: n.is_read ? 'transparent' : 'var(--jlr-hover)', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ marginTop: '3px', width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: n.type === 'programme_alert' ? '#D4880F' : '#2B3A2E' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {n.programme_code && <p style={{ margin: 0, fontSize: '10px', color: '#C4A265', fontWeight: 700 }}>{n.programme_code}</p>}
                      <p style={{ margin: '1px 0 0', fontSize: '13px', color: 'var(--jlr-text)', fontWeight: 500, lineHeight: 1.35 }}>{n.title}</p>
                      <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'var(--jlr-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '10px', color: 'var(--jlr-faint)' }}>{getTimeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }} style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#C4A265', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getInitials(user?.email)}</button>

          {dropdownOpen && (
            <div style={{ position: 'absolute', top: '48px', right: '0', background: 'var(--jlr-card)', border: '1px solid var(--jlr-border)', borderRadius: '8px', padding: '6px', minWidth: '220px', zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              <p style={{ color: 'var(--jlr-muted)', fontSize: '12px', padding: '8px 10px', margin: 0 }}>{user?.email}</p>
              <hr style={{ border: 'none', borderTop: '1px solid var(--jlr-border-subtle)', margin: '4px 0' }} />
              <p style={{ color: 'var(--jlr-muted)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '8px 10px 4px', margin: 0 }}>Theme</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '0 6px 6px' }}>
                {[
                  { name: 'default', label: 'Default', color: '#F5F2ED' },
                  { name: 'high-contrast', label: 'High Contrast', color: '#FFFFFF' },
                  { name: 'dark', label: 'Dark', color: '#1A1A1A' },
                  { name: 'warm', label: 'Warm', color: '#FDF8F0' },
                ].map(t => (
                  <button key={t.name} onClick={() => applyTheme(t.name)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: theme === t.name ? 'var(--jlr-hover)' : 'transparent',
                    border: theme === t.name ? '1px solid var(--jlr-border)' : '1px solid transparent',
                    borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', fontSize: '11px',
                    color: 'var(--jlr-text)', fontFamily: 'inherit',
                  }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: t.color, border: '1px solid var(--jlr-border)', flexShrink: 0 }} />
                    {t.label}
                  </button>
                ))}
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--jlr-border-subtle)', margin: '4px 0' }} />
              <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--jlr-text)', cursor: 'pointer', padding: '8px 10px', textAlign: 'left', fontSize: '13px', borderRadius: '5px', fontWeight: 500 }}>Sign out</button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Sidebar ─── */}
      <div style={{ position: 'fixed', top: '56px', left: 0, width: menuOpen ? '240px' : '0px', height: 'calc(100vh - 56px)', background: '#2B3A2E', transition: 'width 0.25s cubic-bezier(.22,1,.36,1)', overflow: 'hidden', zIndex: 99, boxShadow: menuOpen ? '4px 0 24px rgba(0,0,0,0.12)' : 'none' }}>
        <div style={{ padding: '20px 14px', whiteSpace: 'nowrap' }}>
          <div style={{ padding: '0 8px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '14px' }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>PMO Portal</span>
            <span style={{ display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginTop: '2px' }}>Jaguar Land Rover</span>
          </div>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            if (item.external) {
              return (
                <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'transparent', borderLeft: '3px solid transparent', borderRadius: '0 6px 6px 0', color: 'rgba(255,255,255,0.55)', padding: '9px 12px', fontSize: '13px', fontWeight: 400, cursor: 'pointer', marginBottom: '2px', textAlign: 'left', textDecoration: 'none', transition: 'all 0.15s ease' }}>
                  <item.Icon />{item.label}<IconExternal />
                </a>
              );
            }
            return (
              <button key={item.path} onClick={() => { navigate(item.path); setMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: active ? 'rgba(196,162,101,0.12)' : 'transparent', border: 'none', borderLeft: active ? '3px solid #C4A265' : '3px solid transparent', borderRadius: '0 6px 6px 0', color: active ? '#C4A265' : 'rgba(255,255,255,0.55)', padding: '9px 12px', fontSize: '13px', fontWeight: active ? 600 : 400, cursor: 'pointer', marginBottom: '2px', textAlign: 'left', transition: 'all 0.15s ease' }}>
                <item.Icon />{item.label}
              </button>
            );
          })}
        </div>
      </div>

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', top: '56px', left: '240px', right: 0, bottom: 0, background: 'rgba(0,0,0,0.06)', zIndex: 98 }} />}
      {(notifOpen || dropdownOpen) && <div onClick={() => { setNotifOpen(false); setDropdownOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />}

      <Outlet />
    </div>
  );
}

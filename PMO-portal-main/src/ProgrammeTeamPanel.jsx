import React, { useState, useEffect } from 'react';

// ============================================================================
// DUMMY PROGRAMME MANAGERS — edit names/emails/phones here as needed.
// The key (ATLAS, AURORA, etc.) must match the channel's programme_code.
// ============================================================================
const TEAM_DATA = {
  ATLAS: [
    { id: 'atlas-1', name: 'James Whitfield',  role: 'Senior Programme Manager', email: 'j.whitfield@jaguarlandrover.com', phone: '+44 7700 900101', teams_status: 'online' },
    { id: 'atlas-2', name: 'Priya Raman',      role: 'Programme Manager',        email: 'p.raman@jaguarlandrover.com',     phone: '+44 7700 900102', teams_status: 'busy'   },
  ],
  AURORA: [
    { id: 'aurora-1', name: 'Oliver Chen',       role: 'Senior Programme Manager', email: 'o.chen@jaguarlandrover.com',      phone: '+44 7700 900201', teams_status: 'online' },
    { id: 'aurora-2', name: 'Fatima Al-Hassan',  role: 'Programme Manager',        email: 'f.alhassan@jaguarlandrover.com',  phone: '+44 7700 900202', teams_status: 'online' },
    { id: 'aurora-3', name: 'David Kowalski',    role: 'Programme Manager',        email: 'd.kowalski@jaguarlandrover.com',  phone: '+44 7700 900203', teams_status: 'away'   },
  ],
  ECHO: [
    { id: 'echo-1', name: 'Rachel Morgan',     role: 'Senior Programme Manager', email: 'r.morgan@jaguarlandrover.com',    phone: '+44 7700 900301', teams_status: 'busy' },
  ],
  LYNX: [
    { id: 'lynx-1', name: 'Ahmed Patel',       role: 'Senior Programme Manager', email: 'a.patel@jaguarlandrover.com',     phone: '+44 7700 900401', teams_status: 'online'  },
    { id: 'lynx-2', name: 'Sarah Johnson',     role: 'Programme Manager',        email: 's.johnson@jaguarlandrover.com',   phone: '+44 7700 900402', teams_status: 'offline' },
  ],
  NOVA: [
    { id: 'nova-1', name: 'Marcus Bennett',    role: 'Senior Programme Manager', email: 'm.bennett@jaguarlandrover.com',   phone: '+44 7700 900501', teams_status: 'online' },
    { id: 'nova-2', name: 'Elena Rossi',       role: 'Programme Manager',        email: 'e.rossi@jaguarlandrover.com',     phone: '+44 7700 900502', teams_status: 'busy'   },
  ],
  ORION: [
    { id: 'orion-1', name: 'Thomas Wright',    role: 'Senior Programme Manager', email: 't.wright@jaguarlandrover.com',    phone: '+44 7700 900601', teams_status: 'away' },
  ],
  PHOENIX: [
    { id: 'phoenix-1', name: 'Nadia Kapoor',   role: 'Senior Programme Manager', email: 'n.kapoor@jaguarlandrover.com',    phone: '+44 7700 900701', teams_status: 'online'  },
    { id: 'phoenix-2', name: 'Robert Hayes',   role: 'Programme Manager',        email: 'r.hayes@jaguarlandrover.com',     phone: '+44 7700 900702', teams_status: 'online'  },
    { id: 'phoenix-3', name: 'Yuki Tanaka',    role: 'Programme Manager',        email: 'y.tanaka@jaguarlandrover.com',    phone: '+44 7700 900703', teams_status: 'offline' },
  ],
  SOLAR: [
    { id: 'solar-1', name: 'Claire Dubois',    role: 'Senior Programme Manager', email: 'c.dubois@jaguarlandrover.com',    phone: '+44 7700 900801', teams_status: 'busy' },
  ],
  TITAN: [
    { id: 'titan-1', name: 'Ibrahim Osei',     role: 'Senior Programme Manager', email: 'i.osei@jaguarlandrover.com',      phone: '+44 7700 900901', teams_status: 'online' },
    { id: 'titan-2', name: 'Laura Fenton',     role: 'Programme Manager',        email: 'l.fenton@jaguarlandrover.com',    phone: '+44 7700 900902', teams_status: 'online' },
  ],
  ZEN: [
    { id: 'zen-1', name: 'Kai Nakamura',       role: 'Senior Programme Manager', email: 'k.nakamura@jaguarlandrover.com',  phone: '+44 7700 901001', teams_status: 'away'   },
    { id: 'zen-2', name: 'Hannah Reeves',      role: 'Programme Manager',        email: 'h.reeves@jaguarlandrover.com',    phone: '+44 7700 901002', teams_status: 'online' },
  ],
};

const STATUS_LABELS = { online: 'Available', busy: 'Busy', away: 'Away', offline: 'Offline' };
const STATUS_COLORS = {
  online:  { dot: '#2EA043', bg: '#DCF5E1', fg: '#1A6F2E' },
  busy:    { dot: '#D29922', bg: '#FFF3D4', fg: '#8A5A00' },
  away:    { dot: '#BF8700', bg: '#FFF0D4', fg: '#8A5A00' },
  offline: { dot: '#8B949E', bg: '#EBEBEB', fg: '#666' },
};

function getInitials(n) {
  if (!n) return '?';
  const p = n.split(' ');
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : n.slice(0, 2).toUpperCase();
}

function openOutlook(pm, programmeLabel) {
  const firstName = (pm.name || '').split(' ')[0];
  const subject = encodeURIComponent(`Re: ${programmeLabel}`);
  const body = encodeURIComponent(
    `Hi ${firstName},\n\n[Your message here]\n\nRegarding: ${programmeLabel}\nSent via JLR PMO Portal`
  );
  window.location.href = `mailto:${pm.email}?subject=${subject}&body=${body}`;
}

function openTeams(pm, programmeLabel) {
  const firstName = (pm.name || '').split(' ')[0];
  const message = encodeURIComponent(`Hi ${firstName}, regarding ${programmeLabel}...`);
  const url = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(pm.email)}&message=${message}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function ProgrammeTeamPanel({ programmeCode, programmeLabel, isOpen, onClose }) {
  const [activePm, setActivePm] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2400); };

  const lookupKey = (programmeCode || programmeLabel || '').replace(/^#\s*/, '').replace(/^PRG_/, '');
  const managers = TEAM_DATA[lookupKey] || [];

  return (
    <>
      <aside style={{
        position: 'fixed', right: 0, top: 56, bottom: 0, width: 360,
        background: 'var(--jlr-card)', borderLeft: '1px solid var(--jlr-border)',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.05)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease',
        zIndex: 40, display: 'flex', flexDirection: 'column',
        fontFamily: "'Aptos', 'Segoe UI', system-ui, sans-serif",
      }}>
        <div style={{ background: '#2B3A2E', color: '#fff', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{programmeLabel} — Team</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: '2px 6px' }} aria-label="Close">✕</button>
        </div>

        <div style={{ padding: '10px 18px', background: 'var(--jlr-bg)', borderBottom: '1px solid var(--jlr-border)', fontSize: 10, color: 'var(--jlr-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
          Programme Managers
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {managers.length === 0 && (
            <p style={{ padding: 20, color: 'var(--jlr-faint)', textAlign: 'center', fontSize: 13 }}>No programme managers assigned.</p>
          )}
          {managers.map((pm) => {
            const col = STATUS_COLORS[pm.teams_status] || STATUS_COLORS.offline;
            return (
              <div key={pm.id} style={{ background: 'var(--jlr-card)', border: '1px solid var(--jlr-border)', borderRadius: 6, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ position: 'relative', width: 42, height: 42, borderRadius: '50%', background: '#2B3A2E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>
                    {getInitials(pm.name)}
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: col.dot, border: '2px solid var(--jlr-card)' }} title={STATUS_LABELS[pm.teams_status]} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--jlr-text)' }}>{pm.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--jlr-muted)', marginTop: 2 }}>{pm.role}</div>
                    <div style={{ fontSize: 11, color: 'var(--jlr-muted)', marginTop: 6, wordBreak: 'break-all' }}>📧 {pm.email}</div>
                    {pm.phone && <div style={{ fontSize: 11, color: 'var(--jlr-muted)', marginTop: 2 }}>📞 {pm.phone}</div>}
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600, background: col.bg, color: col.fg }}>
                      ● {STATUS_LABELS[pm.teams_status]}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  <button onClick={() => setActivePm(pm)} style={{ flex: 1, padding: '6px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: '#2B3A2E', color: '#fff', border: '1px solid #2B3A2E' }}>💬 In-app</button>
                  <button onClick={() => { openTeams(pm, programmeLabel); showToast(`Opening Teams chat with ${pm.name}…`); }} style={{ flex: 1, padding: '6px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'var(--jlr-card)', color: '#464EB8', border: '1px solid #C5C7E0' }}>👥 Teams</button>
                  <button onClick={() => { openOutlook(pm, programmeLabel); showToast(`Opening Outlook for ${pm.name}…`); }} style={{ flex: 1, padding: '6px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'var(--jlr-card)', color: '#0078D4', border: '1px solid #C0DBF0' }}>✉ Outlook</button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {activePm && (
        <InAppModal
          pm={activePm}
          programmeLabel={programmeLabel}
          onClose={() => setActivePm(null)}
          onSent={(name) => { setActivePm(null); showToast(`Message sent to ${name}`); }}
        />
      )}

      <div style={{
        position: 'fixed', bottom: 30, left: '50%',
        transform: `translateX(-50%) translateY(${toast ? 0 : 80}px)`,
        background: '#2B3A2E', color: '#fff', padding: '12px 20px',
        borderRadius: 6, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        transition: 'transform 0.3s', zIndex: 1000, pointerEvents: 'none',
        fontFamily: "'Aptos', 'Segoe UI', system-ui, sans-serif",
      }}>
        {toast}
      </div>
    </>
  );
}

function InAppModal({ pm, programmeLabel, onClose, onSent }) {
  const [subject, setSubject] = useState(`Regarding ${programmeLabel}`);
  const [body, setBody] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSend = () => {
    if (!body.trim()) { setErr('Please enter a message.'); return; }
    onSent(pm.name);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, fontFamily: "'Aptos', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ background: 'var(--jlr-card)', borderRadius: 8, width: 460, maxWidth: '90%', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ background: '#2B3A2E', color: '#fff', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Message {pm.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 18 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--jlr-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>To</label>
          <input value={`${pm.name} <${pm.email}>`} readOnly style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--jlr-border)', borderRadius: 4, fontSize: 13, marginBottom: 12, background: 'var(--jlr-input-bg)', color: 'var(--jlr-text)', fontFamily: 'inherit', boxSizing: 'border-box' }} />

          <label style={{ display: 'block', fontSize: 11, color: 'var(--jlr-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--jlr-border)', borderRadius: 4, fontSize: 13, marginBottom: 12, background: 'var(--jlr-input-bg)', color: 'var(--jlr-text)', fontFamily: 'inherit', boxSizing: 'border-box' }} />

          <label style={{ display: 'block', fontSize: 11, color: 'var(--jlr-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Message</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your message..." autoFocus style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--jlr-border)', borderRadius: 4, fontSize: 13, minHeight: 100, resize: 'vertical', background: 'var(--jlr-input-bg)', color: 'var(--jlr-text)', fontFamily: 'inherit', boxSizing: 'border-box' }} />

          {err && <p style={{ color: '#D03438', fontSize: 12, marginTop: 4 }}>{err}</p>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 18px 18px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--jlr-border)', background: 'var(--jlr-hover)', color: 'var(--jlr-text)', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={handleSend} style={{ padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: '#2B3A2E', color: '#fff', fontFamily: 'inherit' }}>Send in-app</button>
        </div>
      </div>
    </div>
  );
}
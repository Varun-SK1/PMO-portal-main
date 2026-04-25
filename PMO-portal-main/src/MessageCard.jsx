import React from 'react';

const priorityConfig = {
  urgent:    { label: 'Urgent',    bg: '#FCE4E4', text: '#D03438' },
  important: { label: 'Important', bg: '#FEF3C7', text: '#B8720A' },
  general:   { label: 'General',   bg: 'var(--jlr-hover)', text: 'var(--jlr-muted)' },
};

function getTimeAgo(d) { const now = new Date(); const date = new Date(d); const m = Math.floor((now-date)/60000); const h = Math.floor((now-date)/3600000); const dy = Math.floor((now-date)/86400000); if (m<1) return 'Just now'; if (m<60) return `${m}m ago`; if (h<24) return `${h}h ago`; if (dy<7) return `${dy}d ago`; return date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }

export default function MessageCard({ message, currentUserId, onPin, onDelete }) {
  const pri = priorityConfig[message.priority] || priorityConfig.general;
  const isAuthor = currentUserId === message.author_id;
  return (
    <div style={{ background: 'var(--jlr-card)', border: message.is_pinned ? '1px solid #C4A265' : '1px solid var(--jlr-border)', borderRadius: '10px', padding: '18px 20px', marginBottom: '10px', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      {message.is_pinned && <div style={{ position: 'absolute', top: '12px', right: '14px', color: '#C4A265', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><span>📌</span><span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Pinned</span></div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ background: pri.bg, color: pri.text, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', padding: '3px 8px', borderRadius: '4px' }}>{pri.label}</span>
        {message.visibility !== 'all' && <span style={{ fontSize: '11px', color: 'var(--jlr-faint)' }}>🔒 {message.visibility === 'managers_only' ? 'Managers' : 'Executives'}</span>}
      </div>
      <h3 style={{ color: 'var(--jlr-text)', fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0' }}>{message.title}</h3>
      <p style={{ color: 'var(--jlr-muted)', fontSize: '13.5px', lineHeight: 1.6, margin: '0 0 14px 0', whiteSpace: 'pre-wrap' }}>{message.content}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--jlr-border-subtle)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2B3A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700 }}>{message.author_name?.charAt(0)?.toUpperCase() || '?'}</div>
          <span style={{ color: 'var(--jlr-text)', fontSize: '13px', fontWeight: 500 }}>{message.author_name}</span>
          <span style={{ color: 'var(--jlr-faint)', fontSize: '12px' }}>{getTimeAgo(message.created_at)}</span>
        </div>
        {isAuthor && <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => onPin(message.id, !message.is_pinned)} style={{ background: 'var(--jlr-hover)', border: '1px solid var(--jlr-border)', borderRadius: '6px', color: message.is_pinned ? '#C4A265' : 'var(--jlr-muted)', fontSize: '12px', padding: '4px 10px', cursor: 'pointer', fontWeight: 500 }}>{message.is_pinned ? 'Unpin' : 'Pin'}</button>
          <button onClick={() => onDelete(message.id)} style={{ background: 'var(--jlr-hover)', border: '1px solid var(--jlr-border)', borderRadius: '6px', color: 'var(--jlr-muted)', fontSize: '12px', padding: '4px 10px', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
        </div>}
      </div>
    </div>
  );
}
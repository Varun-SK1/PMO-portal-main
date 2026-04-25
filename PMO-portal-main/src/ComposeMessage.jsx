import React, { useState } from 'react';

export default function ComposeMessage({ onSubmit, onCancel }) {
  const [title, setTitle] = useState(''); const [content, setContent] = useState('');
  const [priority, setPriority] = useState('general'); const [visibility, setVisibility] = useState('all');
  const [isPinned, setIsPinned] = useState(false); const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return; setSubmitting(true);
    try { await onSubmit({ title, content, priority, visibility, is_pinned: isPinned }); setTitle(''); setContent(''); setPriority('general'); setVisibility('all'); setIsPinned(false); }
    catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const inp = { width: '100%', background: 'var(--jlr-input-bg)', border: '1px solid var(--jlr-border)', borderRadius: '8px', color: 'var(--jlr-text)', padding: '10px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const lab = { color: 'var(--jlr-text)', fontSize: '12px', fontWeight: 600, marginBottom: '5px', display: 'block' };

  return (
    <div style={{ background: 'var(--jlr-card)', border: '1px solid #C4A265', borderRadius: '10px', padding: '22px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(196,162,101,0.08)' }}>
      <h3 style={{ color: 'var(--jlr-text)', fontSize: '15px', fontWeight: 600, margin: '0 0 18px 0' }}>New Update</h3>
      <div style={{ marginBottom: '14px' }}><label style={lab}>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Update title..." style={inp} /></div>
      <div style={{ marginBottom: '14px' }}><label style={lab}>Message</label><textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your update..." rows={4} style={{ ...inp, resize: 'vertical', minHeight: '100px' }} /></div>
      <div style={{ display: 'flex', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '170px' }}><label style={lab}>Priority</label><select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="general">General</option><option value="important">Important</option><option value="urgent">Urgent</option></select></div>
        <div style={{ flex: 1, minWidth: '170px' }}><label style={lab}>Visibility</label><select value={visibility} onChange={e => setVisibility(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="all">All Users</option><option value="managers_only">Managers Only</option><option value="executives_only">Executives Only</option></select></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', cursor: 'pointer' }} onClick={() => setIsPinned(!isPinned)}>
        <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: isPinned ? '2px solid #C4A265' : '2px solid var(--jlr-border)', background: isPinned ? '#C4A265' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isPinned && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span>}</div>
        <span style={{ color: 'var(--jlr-muted)', fontSize: '13px' }}>Pin this update</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {onCancel && <button onClick={onCancel} style={{ background: 'var(--jlr-hover)', border: '1px solid var(--jlr-border)', borderRadius: '8px', color: 'var(--jlr-muted)', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>}
        <button onClick={handleSubmit} disabled={submitting || !title.trim() || !content.trim()} style={{ background: '#2B3A2E', border: 'none', borderRadius: '8px', color: '#fff', padding: '8px 22px', fontSize: '13px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: !title.trim() || !content.trim() ? 0.5 : 1 }}>{submitting ? 'Posting...' : 'Post Update'}</button>
      </div>
    </div>
  );
}
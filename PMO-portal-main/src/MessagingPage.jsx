import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import MessageCard from './MessageCard';
import ComposeMessage from './ComposeMessage';

export default function MessagingPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user)); }, []);
  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase.from('leadership_messages').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    setMessages(data || []); setLoading(false);
  };

  const handleSubmit = async (messageData) => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();
    await supabase.from('leadership_messages').insert({ ...messageData, author_id: user.id, author_name: profile?.full_name || user.email, author_role: profile?.role || 'employee' });
    setShowCompose(false); fetchMessages();
  };

  const handlePin = async (id, p) => { await supabase.from('leadership_messages').update({ is_pinned: p }).eq('id', id); fetchMessages(); };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; await supabase.from('leadership_messages').delete().eq('id', id); fetchMessages(); };

  const filtered = filter === 'all' ? messages : messages.filter(m => m.priority === filter);
  const pinned = messages.filter(m => m.is_pinned).length;

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--jlr-bg)', padding: '28px 32px', fontFamily: "'Aptos', 'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: 'var(--jlr-text)', fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Leadership Updates</h1>
          <p style={{ color: 'var(--jlr-muted)', fontSize: '13px', margin: 0 }}>{messages.length} update{messages.length !== 1 ? 's' : ''}{pinned > 0 && ` · ${pinned} pinned`}</p>
        </div>
        <button onClick={() => setShowCompose(!showCompose)} style={{ background: showCompose ? 'var(--jlr-card)' : '#2B3A2E', border: showCompose ? '1px solid #2B3A2E' : 'none', borderRadius: '8px', color: showCompose ? '#2B3A2E' : '#fff', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{showCompose ? 'Cancel' : '+ New Update'}</button>
      </div>
      {showCompose && <ComposeMessage onSubmit={handleSubmit} onCancel={() => setShowCompose(false)} />}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '18px' }}>
        {['all', 'urgent', 'important', 'general'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? '#2B3A2E' : 'var(--jlr-card)', border: '1px solid ' + (filter === f ? '#2B3A2E' : 'var(--jlr-border)'), borderRadius: '6px', color: filter === f ? '#fff' : 'var(--jlr-muted)', padding: '6px 14px', fontSize: '12px', fontWeight: 500, textTransform: 'capitalize', cursor: 'pointer' }}>{f === 'all' ? 'All' : f}</button>
        ))}
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--jlr-faint)' }}>Loading...</div>
        : filtered.length === 0 ? <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--jlr-faint)' }}>{filter === 'all' ? 'No updates yet.' : `No ${filter} updates.`}</div>
        : filtered.map(m => <MessageCard key={m.id} message={m} currentUserId={currentUser?.id} onPin={handlePin} onDelete={handleDelete} />)}
    </div>
  );
}
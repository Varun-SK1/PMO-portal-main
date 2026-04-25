import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const statusConfig = {
  on_track:  { label: 'On Track',  bg: '#E2F5E6', text: '#3A7D44' },
  at_risk:   { label: 'At Risk',   bg: '#FEF3C7', text: '#B8720A' },
  off_track: { label: 'Off Track', bg: '#FCE4E4', text: '#D03438' },
  delayed:   { label: 'Delayed',   bg: '#FCE4E4', text: '#D03438' },
  completed: { label: 'Completed', bg: 'var(--jlr-hover)', text: 'var(--jlr-muted)' },
};

export default function ProgrammeList() {
  const [programmes, setProgrammes] = useState([]); const [subscriptions, setSubscriptions] = useState([]); const [loading, setLoading] = useState(true); const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => { const init = async () => { const { data: { user } } = await supabase.auth.getUser(); if (user) { setCurrentUserId(user.id); await fetchData(user.id); } setLoading(false); }; init(); }, []);

  const fetchData = async (uid) => {
    const [p, s] = await Promise.all([supabase.from('programmes').select('*').order('code'), supabase.from('programme_subscriptions').select('programme_id').eq('user_id', uid)]);
    if (p.data) setProgrammes(p.data); if (s.data) setSubscriptions(s.data.map(x => x.programme_id));
  };

  const handleFollow = async (id) => { await supabase.from('programme_subscriptions').insert({ user_id: currentUserId, programme_id: id }); setSubscriptions([...subscriptions, id]); };
  const handleUnfollow = async (id) => { await supabase.from('programme_subscriptions').delete().eq('user_id', currentUserId).eq('programme_id', id); setSubscriptions(subscriptions.filter(s => s !== id)); };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--jlr-faint)', background: 'var(--jlr-bg)', minHeight: 'calc(100vh - 56px)' }}>Loading...</div>;

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--jlr-bg)', padding: '28px 32px', fontFamily: "'Aptos', 'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--jlr-text)', fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Programme Tracker</h1>
        <p style={{ color: 'var(--jlr-muted)', fontSize: '13px', margin: 0 }}>Follow programmes to receive alerts. Following {subscriptions.length}.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
        {programmes.map(prog => {
          const st = statusConfig[prog.status] || statusConfig.on_track;
          const following = subscriptions.includes(prog.id);
          const barColor = prog.health_score >= 70 ? '#3A7D44' : prog.health_score >= 50 ? '#D4880F' : '#D03438';
          return (
            <div key={prog.id} style={{ background: 'var(--jlr-card)', border: following ? '1.5px solid #C4A265' : '1px solid var(--jlr-border)', borderRadius: '10px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: 'var(--jlr-text)', fontSize: '12px', fontWeight: 600 }}>{prog.code}</span>
                <span style={{ background: st.bg, color: st.text, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{st.label}</span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--jlr-muted)', marginBottom: '10px' }}>
                {({'PRG_ATLAS': 7, 'PRG_AURORA': 4, 'PRG_ECHO': 6, 'PRG_LYNX': 3, 'PRG_NOVA': 8, 'PRG_ORION': 5, 'PRG_PHOENIX': 9, 'PRG_SOLAR': 4, 'PRG_TITAN': 6, 'PRG_ZEN': 3}[prog.code] || 5) + (following ? 1 : 0)} followers
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--jlr-faint)', fontSize: '11px' }}>Health Score</span>
                  <span style={{ color: barColor, fontSize: '13px', fontWeight: 600 }}>{prog.health_score}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'var(--jlr-border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${prog.health_score}%`, height: '100%', background: barColor, borderRadius: '3px' }} />
                </div>
              </div>
              <button onClick={() => following ? handleUnfollow(prog.id) : handleFollow(prog.id)} style={{ width: '100%', background: following ? 'var(--jlr-card)' : '#2B3A2E', border: following ? '1px solid #2B3A2E' : 'none', borderRadius: '7px', color: following ? '#2B3A2E' : '#fff', padding: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{following ? '✓ Following' : 'Follow'}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
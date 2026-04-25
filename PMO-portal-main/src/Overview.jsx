import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const statusLabel = (s) => {
  if (s === 'on_track') return { text: 'On track', color: '#3A7D44' };
  if (s === 'at_risk') return { text: 'At risk', color: '#D4880F' };
  if (s === 'delayed') return { text: 'Delayed', color: '#D03438' };
  return { text: s, color: 'var(--jlr-muted)' };
};
const statusBorder = (s) => s === 'on_track' ? '#3A7D44' : s === 'at_risk' ? '#D4880F' : s === 'delayed' ? '#D03438' : 'var(--jlr-muted)';
const healthDots = (score, status) => {
  const segs = [score >= 20, score >= 40, score >= 55, score >= 65, score >= 75];
  const c = status === 'on_track' ? '#3A7D44' : status === 'at_risk' ? '#D4880F' : '#D03438';
  return segs.map(met => met ? c : 'var(--jlr-border)');
};
const severityColor = { critical: '#D03438', warning: '#D4880F', success: '#3A7D44', info: '#2B3A2E' };

function getTimeAgo(d) {
  const now = new Date(); const date = new Date(d);
  const h = Math.floor((now - date) / 3600000); const days = Math.floor((now - date) / 86400000);
  const t = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (h < 24) return 'Today, ' + t; if (days < 2) return 'Yesterday, ' + t; return `${days} days ago`;
}

export default function Overview() {
  const [programmes, setProgrammes] = useState([]);
  const [activity, setActivity] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let prof = null;
      if (user) { const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single(); if (p) { setProfile(p); prof = p; } }

      const isExec = prof?.role === 'executive_manager';
      const userProg = prof?.programme_code;

      let progQuery = supabase.from('programmes').select('*').order('code');
      let actQuery = supabase.from('recent_activity').select('*').order('created_at', { ascending: false }).limit(10);
      let flagQuery = supabase.from('flagged_items').select('*').eq('is_resolved', false).order('created_at', { ascending: false });

      if (!isExec && userProg) {
        progQuery = progQuery.eq('code', userProg);
        actQuery = actQuery.or(`programme_code.eq.${userProg},programme_code.is.null`);
        flagQuery = flagQuery.eq('programme_code', userProg);
      }

      const [pr, ac, fl] = await Promise.all([progQuery, actQuery, flagQuery]);
      if (pr.data) setProgrammes(pr.data); if (ac.data) setActivity(ac.data); if (fl.data) setFlagged(fl.data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const onTrack = programmes.filter(p => p.status === 'on_track').length;
  const atRisk = programmes.filter(p => p.status === 'at_risk').length;
  const delayed = programmes.filter(p => p.status === 'delayed').length;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px)', background: 'var(--jlr-bg)', color: 'var(--jlr-muted)', fontFamily: "'Aptos', sans-serif" }}>Loading overview...</div>;

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--jlr-bg)', padding: '28px 32px', fontFamily: "'Aptos', 'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--jlr-text)', fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>Overview</h1>
          <p style={{ color: 'var(--jlr-muted)', fontSize: '13px', margin: 0 }}>Programme health across all dimensions</p>
        </div>
        {profile && <div style={{ background: 'var(--jlr-card)', border: '1px solid var(--jlr-border)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: 'var(--jlr-text)', fontWeight: 500 }}>{profile.role === 'executive_manager' ? 'Executive' : profile.role === 'programme_manager' ? 'Programme Manager' : 'Employee'} view — {profile.full_name}</div>}
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: 'var(--jlr-card)', borderRadius: '10px', border: '1px solid var(--jlr-border)', marginBottom: '24px', overflow: 'hidden' }}>
        {[{ l: 'Programmes tracked', v: programmes.length, c: 'var(--jlr-text)' }, { l: 'On track', v: onTrack, c: '#3A7D44' }, { l: 'At risk', v: atRisk, c: '#D4880F' }, { l: 'Delayed', v: delayed, c: '#D03438' }].map((k, i) => (
          <div key={i} style={{ padding: '18px 24px', borderRight: i < 3 ? '1px solid var(--jlr-border-subtle)' : 'none' }}>
            <div style={{ fontSize: '15px', color: 'var(--jlr-muted)', marginBottom: '4px' }}>{k.l}</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: k.c, lineHeight: 1 }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Scorecards */}
          <div style={{ background: 'var(--jlr-card)', borderRadius: '10px', border: '1px solid var(--jlr-border)', padding: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--jlr-text)', margin: '0 0 16px 0' }}>Programme health scorecards</h2>
            <div style={{ display: 'grid', gridTemplateColumns: profile?.role === 'executive_manager' ? '1fr 1fr' : '1fr', gap: '10px' }}>
              {programmes.map(p => {
                const st = statusLabel(p.status); const dots = healthDots(p.health_score, p.status);
                return (
                  <div key={p.id} style={{ border: '1px solid var(--jlr-border-subtle)', borderRadius: '8px', padding: '14px 16px', borderLeft: `3px solid ${statusBorder(p.status)}` }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jlr-muted)', marginBottom: '4px' }}>{p.code}</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--jlr-text)', lineHeight: 1 }}>{p.health_score}</div>
                    <div style={{ fontSize: '12px', color: st.color, fontWeight: 600, marginTop: '2px' }}>{st.text}</div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>{dots.map((c, i) => <div key={i} style={{ width: '20px', height: '5px', borderRadius: '3px', background: c }} />)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flagged items - inside left column for PM/employee */}
          {profile?.role !== 'executive_manager' && (
            <div style={{ background: 'var(--jlr-card)', borderRadius: '10px', border: '1px solid var(--jlr-border)', padding: '20px', marginTop: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--jlr-text)', margin: '0 0 16px 0' }}>Flagged items requiring attention</h2>
              {flagged.length === 0 ? <p style={{ color: 'var(--jlr-faint)', fontSize: '13px' }}>No flagged items — all clear.</p>
              : <div style={{ display: 'grid', gap: '10px' }}>
                {flagged.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: item.severity === 'critical' ? '#FDF2F2' : '#FFFBF0', border: `1px solid ${item.severity === 'critical' ? '#F5CECE' : '#F5E8C8'}`, borderRadius: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.severity === 'critical' ? '#D03438' : '#D4880F', marginTop: '5px', flexShrink: 0 }} />
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#2A2A2A' }}>{item.programme_code}</span>
                        <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '3px', background: item.severity === 'critical' ? '#FCE4E4' : '#FEF3C7', color: item.severity === 'critical' ? '#D03438' : '#B8720A' }}>{item.severity}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#2A2A2A' }}>{item.title}</p>
                      {item.description && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#777' }}>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>}
            </div>
          )}
        </div>

        {/* Activity */}
        <div style={{ background: 'var(--jlr-card)', borderRadius: '10px', border: '1px solid var(--jlr-border)', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--jlr-text)', margin: '0 0 16px 0' }}>Recent activity</h2>
          <div style={{ overflowY: 'auto' }}>
            {activity.length === 0 ? <p style={{ color: 'var(--jlr-faint)', fontSize: '13px' }}>No recent activity.</p>
            : activity.map(a => (
              <div key={a.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--jlr-border-subtle)' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: severityColor[a.severity] || 'var(--jlr-faint)', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--jlr-text)', lineHeight: 1.4 }}>{a.programme_code && <span style={{ fontWeight: 600 }}>{a.programme_code} — </span>}{a.message}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--jlr-faint)' }}>{getTimeAgo(a.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged - full width only for executive */}
      {profile?.role === 'executive_manager' && (
        <div style={{ background: 'var(--jlr-card)', borderRadius: '10px', border: '1px solid var(--jlr-border)', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--jlr-text)', margin: '0 0 16px 0' }}>Flagged items requiring attention</h2>
          {flagged.length === 0 ? <p style={{ color: 'var(--jlr-faint)', fontSize: '13px' }}>No flagged items — all clear.</p>
          : <div style={{ display: 'grid', gap: '10px' }}>
            {flagged.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: item.severity === 'critical' ? '#FDF2F2' : '#FFFBF0', border: `1px solid ${item.severity === 'critical' ? '#F5CECE' : '#F5E8C8'}`, borderRadius: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.severity === 'critical' ? '#D03438' : '#D4880F', marginTop: '5px', flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#2A2A2A' }}>{item.programme_code}</span>
                    <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '3px', background: item.severity === 'critical' ? '#FCE4E4' : '#FEF3C7', color: item.severity === 'critical' ? '#D03438' : '#B8720A' }}>{item.severity}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#2A2A2A' }}>{item.title}</p>
                  {item.description && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#777' }}>{item.description}</p>}
                </div>
              </div>
            ))}
          </div>}
        </div>
      )}
    </div>
  );
}
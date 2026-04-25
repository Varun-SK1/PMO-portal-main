import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const updateTypes = [
  { value: 'powerbi_modified', label: 'Power BI Modified' },
  { value: 'new_data_added', label: 'Added New Data' },
  { value: 'report_refreshed', label: 'Report Refreshed' },
  { value: 'filters_updated', label: 'Filters Updated' },
];

export default function UpdateButton({ pageName }) {
  const [open, setOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (p) setProfile(p);
      }
    };
    getProfile();
  }, []);

  const handleUpdate = async (type) => {
    if (posting) return;
    setPosting(true);

    const label = updateTypes.find(t => t.value === type)?.label || type;
    const authorName = profile?.full_name || 'Someone';
    const progCode = profile?.programme_code || null;
    const message = `${authorName} updated ${pageName}: ${label}`;

    // Add to recent_activity
    await supabase.from('recent_activity').insert({
      programme_code: progCode,
      message: message,
      severity: 'info',
    });

    // Notify all PMs and executives
    const { data: recipients } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['programme_manager', 'executive_manager']);

    if (recipients && recipients.length > 0) {
      const notifications = recipients
        .filter(r => r.id !== profile?.id) // don't notify yourself
        .map(r => ({
          user_id: r.id,
          programme_code: progCode,
          type: 'general',
          title: `${pageName} Updated`,
          message: message,
        }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
    }

    setPosting(false);
    setOpen(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: success ? '#3A7D44' : '#2B3A2E',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: "'Aptos', 'Segoe UI', sans-serif",
          transition: 'background 0.2s ease',
        }}
      >
        {success ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            Updated
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Update
          </>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
          <div style={{
            position: 'absolute', top: '42px', right: '0',
            background: '#fff', border: '1px solid #E8E4DE', borderRadius: '10px',
            padding: '6px', minWidth: '200px', zIndex: 200,
            boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
          }}>
            <p style={{ color: '#999', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px 4px', margin: 0 }}>
              Log an update
            </p>
            {updateTypes.map(t => (
              <button
                key={t.value}
                onClick={() => handleUpdate(t.value)}
                disabled={posting}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'transparent', border: 'none',
                  padding: '9px 10px', fontSize: '13px', color: '#2A2A2A',
                  cursor: posting ? 'not-allowed' : 'pointer',
                  borderRadius: '6px', fontFamily: 'inherit', fontWeight: 450,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.target.style.background = '#F5F2ED'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
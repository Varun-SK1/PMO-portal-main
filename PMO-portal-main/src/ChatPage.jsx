import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabase';
import ProgrammeTeamPanel from './ProgrammeTeamPanel';

const priorityConfig = { normal: { label: null }, important: { label: 'IMPORTANT', bg: '#FEF3C7', color: '#B8720A' }, urgent: { label: 'URGENT', bg: '#FCE4E4', color: '#D03438' } };

function getTimeStamp(d) { const date = new Date(d); const now = new Date(); const y = new Date(now); y.setDate(y.getDate()-1); const t = date.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); if (date.toDateString()===now.toDateString()) return t; if (date.toDateString()===y.toDateString()) return `Yesterday ${t}`; return date.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+` ${t}`; }

export default function ChatPage() {
  const [channels, setChannels] = useState([]); const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]); const [newMessage, setNewMessage] = useState('');
  const [priority, setPriority] = useState('normal'); const [searchQuery, setSearchQuery] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false); const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null); const [channelSidebarOpen, setChannelSidebarOpen] = useState(true);
  const [sending, setSending] = useState(false);
  const [teamPanelOpen, setTeamPanelOpen] = useState(false);
  const messagesEndRef = useRef(null); const inputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser(); let up = null;
      if (user) { setCurrentUser(user); const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single(); if (p) { setProfile(p); up = p; } }
      const { data: ch } = await supabase.from('chat_channels').select('*').order('type',{ascending:true}).order('name',{ascending:true});
      if (ch?.length > 0) {
        let v = ch;
        if (up?.role === 'executive_manager') {
          v = ch;
        } else if (up?.role === 'employee') {
          v = ch.filter(c => c.programme_code === up?.programme_code);
        } else {
          v = ch.filter(c => c.type === 'general' || c.programme_code === up?.programme_code);
        }
        setChannels(v); setActiveChannel(v[0]);
      }
    }; init();
  }, []);

  const fetchMessages = useCallback(async () => { if (!activeChannel) return; const { data } = await supabase.from('chat_messages').select('*').eq('channel_id', activeChannel.id).order('created_at',{ascending:true}); if (data) setMessages(data); }, [activeChannel]);
  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { if (!activeChannel) return; const s = supabase.channel(`chat-${activeChannel.id}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages',filter:`channel_id=eq.${activeChannel.id}`},(p)=>setMessages(prev=>[...prev,p.new])).on('postgres_changes',{event:'UPDATE',schema:'public',table:'chat_messages',filter:`channel_id=eq.${activeChannel.id}`},(p)=>setMessages(prev=>prev.map(m=>m.id===p.new.id?p.new:m))).subscribe(); return ()=>supabase.removeChannel(s); }, [activeChannel]);
  useEffect(() => { if (!showPinnedOnly && !searchQuery) messagesEndRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages, showPinnedOnly, searchQuery]);

  const handleSend = async () => { if (!newMessage.trim()||!currentUser||!activeChannel||sending) return; setSending(true); await supabase.from('chat_messages').insert({channel_id:activeChannel.id,author_id:currentUser.id,author_name:profile?.full_name||currentUser.email.split('@')[0],content:newMessage.trim(),priority}); setNewMessage(''); setPriority('normal'); setSending(false); inputRef.current?.focus(); };
  const handleKeyDown = (e) => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); handleSend(); } };
  const togglePin = async (m) => { await supabase.from('chat_messages').update({is_pinned:!m.is_pinned}).eq('id',m.id); fetchMessages(); };

  const filtered = messages.filter(m => { if (showPinnedOnly && !m.is_pinned) return false; if (searchQuery) { const q = searchQuery.toLowerCase(); return m.content.toLowerCase().includes(q)||m.author_name.toLowerCase().includes(q); } return true; });
  const getInitials = (n) => { if (!n) return '?'; const p = n.split(' '); return p.length>=2?(p[0][0]+p[1][0]).toUpperCase():n.slice(0,2).toUpperCase(); };

  const canSeeTeam = activeChannel?.type === 'programme';

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: 'var(--jlr-bg)', fontFamily: "'Aptos', 'Segoe UI', system-ui, sans-serif" }}>

      {/* Channels */}
      <div style={{ width: channelSidebarOpen?'220px':'0px', minWidth: channelSidebarOpen?'220px':'0px', background: 'var(--jlr-card)', borderRight: '1px solid var(--jlr-border)', overflow: 'hidden', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--jlr-border-subtle)' }}><h3 style={{ color: 'var(--jlr-text)', fontSize: '13px', fontWeight: 600, margin: 0 }}>Channels</h3></div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {channels.filter(c=>c.type==='general').length > 0 && <>
            <p style={{ color: 'var(--jlr-faint)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '8px 6px 4px', fontWeight: 600 }}>General</p>
            {channels.filter(c=>c.type==='general').map(ch=>(
              <button key={ch.id} onClick={()=>{setActiveChannel(ch);setSearchQuery('');setShowPinnedOnly(false);}} style={{ display:'block',width:'100%',background:activeChannel?.id===ch.id?'var(--jlr-hover)':'transparent',border:activeChannel?.id===ch.id?'1px solid var(--jlr-border)':'1px solid transparent',borderRadius:'6px',color:activeChannel?.id===ch.id?'var(--jlr-text)':'var(--jlr-muted)',padding:'7px 10px',fontSize:'13px',fontWeight:activeChannel?.id===ch.id?600:400,cursor:'pointer',textAlign:'left',marginBottom:'1px'}}>
                # {ch.name}
              </button>
            ))}
          </>}
          {channels.filter(c=>c.type==='programme').length>0&&<>
            <p style={{ color: 'var(--jlr-faint)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '14px 6px 4px', fontWeight: 600 }}>Programmes</p>
            {channels.filter(c=>c.type==='programme').map(ch=>(
              <button key={ch.id} onClick={()=>{setActiveChannel(ch);setSearchQuery('');setShowPinnedOnly(false);}} style={{ display:'block',width:'100%',background:activeChannel?.id===ch.id?'var(--jlr-hover)':'transparent',border:activeChannel?.id===ch.id?'1px solid var(--jlr-border)':'1px solid transparent',borderRadius:'6px',color:activeChannel?.id===ch.id?'var(--jlr-text)':'var(--jlr-muted)',padding:'7px 10px',fontSize:'12.5px',fontWeight:activeChannel?.id===ch.id?600:400,cursor:'pointer',textAlign:'left',marginBottom:'1px'}}>
                # {ch.name}
              </button>
            ))}
          </>}
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--jlr-border)', background: 'var(--jlr-card)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={()=>setChannelSidebarOpen(!channelSidebarOpen)} style={{ background:'transparent',border:'none',cursor:'pointer',color:'var(--jlr-text)',fontSize:'16px',padding:'4px'}}>☰</button>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: 'var(--jlr-text)', fontSize: '14px', fontWeight: 600, margin: 0 }}># {activeChannel?.name||'...'}</h2>
            <span style={{ color: 'var(--jlr-faint)', fontSize: '11px' }}>{messages.length} message{messages.length!==1?'s':''}{messages.filter(m=>m.is_pinned).length>0&&` · ${messages.filter(m=>m.is_pinned).length} pinned`}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search..." style={{ background:'var(--jlr-input-bg)',border:'1px solid var(--jlr-border)',borderRadius:'6px',color:'var(--jlr-text)',padding:'6px 10px 6px 28px',fontSize:'12px',width:'160px',outline:'none'}} />
            <span style={{ position:'absolute',left:'8px',top:'50%',transform:'translateY(-50%)',color:'var(--jlr-faint)',fontSize:'12px'}}>🔍</span>
          </div>
          <button onClick={()=>setShowPinnedOnly(!showPinnedOnly)} style={{ background:showPinnedOnly?'#FEF3C7':'var(--jlr-input-bg)',border:'1px solid '+(showPinnedOnly?'#C4A265':'var(--jlr-border)'),borderRadius:'6px',color:showPinnedOnly?'#B8720A':'var(--jlr-muted)',padding:'6px 10px',fontSize:'12px',cursor:'pointer',fontWeight:500}}>📌 {showPinnedOnly?'All':'Pinned'}</button>
          {canSeeTeam && (
            <button onClick={()=>setTeamPanelOpen(true)} style={{ background:'#2B3A2E',border:'none',borderRadius:'6px',color:'#fff',padding:'6px 12px',fontSize:'12px',cursor:'pointer',fontWeight:600}}>👥 Team</button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', background: 'var(--jlr-bg)' }}>
          {filtered.length===0?<div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--jlr-faint)',fontSize:'14px'}}>{searchQuery?'No results':showPinnedOnly?'No pinned messages':'No messages yet — start the conversation!'}</div>
          :filtered.map((msg,i)=>{
            const isOwn=msg.author_id===currentUser?.id; const showAv=i===0||filtered[i-1].author_id!==msg.author_id;
            const pri=priorityConfig[msg.priority]||priorityConfig.normal;
            return(
              <div key={msg.id} style={{display:'flex',gap:'10px',marginBottom:showAv?'14px':'3px',marginTop:showAv&&i!==0?'6px':'0',alignItems:'flex-start'}}>
                <div style={{width:'32px',flexShrink:0}}>
                  {showAv&&<div style={{width:'32px',height:'32px',borderRadius:'50%',background:isOwn?'#C4A265':'#2B3A2E',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'11px',fontWeight:700}}>{getInitials(msg.author_name)}</div>}
                </div>
                <div style={{flex:1,minWidth:0,background:msg.is_pinned?'#FFFDF5':'var(--jlr-card)',border:msg.is_pinned?'1px solid #F0E8CC':'1px solid var(--jlr-border)',borderRadius:'10px',padding:'10px 14px',boxShadow:'0 1px 2px rgba(0,0,0,0.02)'}}>
                  {showAv&&<div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3px'}}>
                    <span style={{color:'var(--jlr-text)',fontSize:'13px',fontWeight:600}}>{msg.author_name}</span>
                    <span style={{color:'var(--jlr-faint)',fontSize:'11px'}}>{getTimeStamp(msg.created_at)}</span>
                    {pri.label&&<span style={{background:pri.bg,color:pri.color,fontSize:'9px',fontWeight:700,padding:'2px 6px',borderRadius:'3px',letterSpacing:'0.5px'}}>{pri.label}</span>}
                    {msg.is_pinned&&<span style={{fontSize:'11px'}}>📌</span>}
                  </div>}
                  <p style={{margin:0,color:msg.is_pinned?'#333':'var(--jlr-text)',fontSize:'13.5px',lineHeight:1.5,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{msg.content}</p>
                </div>
                {isOwn&&<button onClick={()=>togglePin(msg)} style={{background:'transparent',border:'none',color:msg.is_pinned?'#C4A265':'var(--jlr-border)',cursor:'pointer',fontSize:'12px',padding:'4px',flexShrink:0,alignSelf:'center'}}>📌</button>}
              </div>
            );
          })}
          <div ref={messagesEndRef}/>
        </div>

        <div style={{padding:'10px 18px 14px',borderTop:'1px solid var(--jlr-border)',background:'var(--jlr-card)'}}>
          <div style={{display:'flex',gap:'4px',marginBottom:'6px'}}>
            {['normal','important','urgent'].map(p=>(
              <button key={p} onClick={()=>setPriority(p)} style={{background:priority===p?(p==='urgent'?'#FCE4E4':p==='important'?'#FEF3C7':'var(--jlr-hover)'):'var(--jlr-input-bg)',border:'1px solid '+(priority===p?(p==='urgent'?'#F0CECE':p==='important'?'#F0E0AA':'var(--jlr-border)'):'var(--jlr-border)'),borderRadius:'4px',color:priority===p?(p==='urgent'?'#D03438':p==='important'?'#B8720A':'var(--jlr-text)'):'var(--jlr-faint)',padding:'3px 8px',fontSize:'11px',cursor:'pointer',textTransform:'capitalize',fontWeight:500}}>{p}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'flex-end'}}>
            <textarea ref={inputRef} value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={`Message #${activeChannel?.name||''}...`} rows={1}
              style={{flex:1,background:'var(--jlr-input-bg)',border:'1px solid var(--jlr-border)',borderRadius:'8px',color:'var(--jlr-text)',padding:'10px 14px',fontSize:'13px',outline:'none',resize:'none',fontFamily:'inherit',lineHeight:1.4,maxHeight:'100px',overflowY:'auto'}}
              onInput={(e)=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,100)+'px';}} />
            <button onClick={handleSend} disabled={!newMessage.trim()||sending} style={{background:newMessage.trim()?'#2B3A2E':'var(--jlr-border)',border:'none',borderRadius:'8px',width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',cursor:newMessage.trim()?'pointer':'not-allowed',flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <ProgrammeTeamPanel
        programmeCode={activeChannel?.programme_code}
        programmeLabel={activeChannel ? `# ${activeChannel.name}` : ''}
        isOpen={teamPanelOpen}
        onClose={() => setTeamPanelOpen(false)}
        currentUser={currentUser}
        currentUserProfile={profile}
      />
    </div>
  );
}
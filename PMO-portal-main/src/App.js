import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import LoginPage from './LoginPage';
import Overview from './Overview';
import MessagingPage from './MessagingPage';
import ProgrammeList from './ProgrammeList';
import ChatPage from './ChatPage';
import Dashboard from './Dashboard';
import AppLayout from './AppLayout';


export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!session) return <LoginPage />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
  <Route path="/" element={<Overview />} />
  <Route path="/programmes" element={<ProgrammeList />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/messages" element={<MessagingPage />} />
  <Route path="/chat" element={<ChatPage />} />
</Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
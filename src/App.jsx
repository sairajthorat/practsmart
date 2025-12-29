import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Classroom from './pages/Classroom';
import Handson from './pages/Handson';
import RoleSelection from './components/RoleSelection';

function App() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSelectedRole('teacher');
      }
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSelectedRole('teacher');
      } else {
        setSelectedRole((prev) => (prev === 'teacher' ? null : prev));
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
     return (
        <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
     )
  }

  if (!selectedRole) {
    return <RoleSelection onSelectRole={setSelectedRole} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Classroom />} />
          <Route path="handson" element={<Handson />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

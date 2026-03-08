import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Registration } from './components/Registration';
import { Catalog } from './components/Catalog';
import { AppointmentForm } from './components/AppointmentForm';
import { Payment } from './components/Payment';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { Guide } from './components/Guide';
import { Support } from './components/Support';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Client } from './types';

export default function App() {
  const [client, setClient] = useState<Client | null>(() => {
    const saved = localStorage.getItem('gloria_client');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('gloria_admin') === 'true';
  });

  useEffect(() => {
    if (client) {
      localStorage.setItem('gloria_client', JSON.stringify(client));
    } else {
      localStorage.removeItem('gloria_client');
    }
  }, [client]);

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('gloria_admin', 'true');
    } else {
      localStorage.removeItem('gloria_admin');
    }
  }, [isAdmin]);

  const handleLogout = () => {
    setClient(null);
    setIsAdmin(false);
  };

  if (!client && !isAdmin) {
    return (
      <div>
        <Registration onRegister={setClient} onAdminLogin={() => setIsAdmin(true)} />
      </div>
    );
  }

  return (
    <div>
      <Router>
        <Layout client={client} isAdmin={isAdmin} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/agendar" element={<AppointmentForm client={client} onLogout={handleLogout} />} />
            <Route path="/pagamento" element={<Payment client={client} />} />
            <Route path="/perfil" element={<Profile client={client} onLogout={handleLogout} />} />
            <Route path="/guia" element={<Guide />} />
            <Route path="/suporte" element={<Support />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            {isAdmin && <Route path="/admin" element={<AdminPanel onLogout={() => setIsAdmin(false)} />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}


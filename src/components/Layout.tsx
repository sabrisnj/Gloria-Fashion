import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Client } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  client: Client | null;
  isAdmin: boolean;
  onLogout: () => void;
}

export function Layout({ children, client, isAdmin, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar isAdmin={isAdmin} />
      
      <main className="flex-grow container mx-auto px-4 py-6 pb-24 max-w-md">
        {children}
      </main>

      <Footer />
    </div>
  );
}

// src/layouts/PublicLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../components/Navbar.css';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16"> {/* Add pt-16 to account for fixed navbar */}
        <Outlet />
      </main>
    </div>
  );
}
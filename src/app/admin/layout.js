'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { 
  LayoutDashboard, Users, FileText, BookOpen, MessageSquare, 
  LogOut, GraduationCap, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/registrations', label: 'Pendaftaran', icon: FileText },
  { href: '/admin/students', label: 'Siswa', icon: Users },
  { href: '/admin/materials', label: 'Materi', icon: BookOpen },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
];

export default function AdminLayout({ children }) {
  // const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // const router = useRouter();
  // const pathname = usePathname();

  const [user, setUser] = useState(null);
  // const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔥 ambil data user + student dari API
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/me');
      const data = await res.json();

      if (!res.ok || data.role !== 'admin') {
        router.push('/login');
        return;
      }

      setUser(data);

      // // ambil data student
      // const resAdmin = await fetch('/api/admin');
      // const adminData = await resAdmin.json();

      // setAdmin(adminData);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--neutral-400)' }}>Memuat...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Toggle */}
      <button 
        className="sidebar-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <GraduationCap size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          La Masia
          <small>Admin Dashboard</small>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', gap: '10px', padding: '10px' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user.username?.charAt(0).toUpperCase()}
              </div>

              <div>
                <div>{user.username}</div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {user.email}
                </div>
              </div>
            </div>

            <button onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}

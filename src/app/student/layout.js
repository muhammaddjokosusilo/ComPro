'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import StudentRenewalPopup from '@/components/StudentRenewalPopup';
import { 
  LayoutDashboard, Calendar, BookOpen, MessageSquare, 
  LogOut, GraduationCap, Menu, X, RefreshCw
} from 'lucide-react';

const navItems = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/schedule', label: 'Jadwal', icon: Calendar },
  { href: '/student/materials', label: 'Materi', icon: BookOpen },
  { href: '/student/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/student/renew', label: 'Perpanjang Paket', icon: RefreshCw },
];

export default function StudentLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔥 ambil data user + student dari API
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/me');
      const data = await res.json();

      if (!res.ok || data.role !== 'student') {
        router.push('/login');
        return;
      }

      setUser(data);

      // ambil data student
      const resStudent = await fetch('/api/student');
      const studentData = await resStudent.json();

      setStudent(studentData);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // 🔥 logout
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  // loading state
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
          <GraduationCap size={20} style={{ marginRight: 6 }} />
          La Masia
          <small>Portal Siswa</small>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
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

        {/* USER INFO */}
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

      {/* MAIN */}
      <main className="dashboard-main">

        {/* 🔥 Popup jika sesi habis */}
        {student?.remainingSessions === 0 && pathname !== '/student/renew' && (
          <StudentRenewalPopup student={student} />
        )}

        {children}
      </main>
    </div>
  );
}
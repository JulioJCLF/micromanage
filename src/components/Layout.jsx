import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, Settings, LogOut, Briefcase, Target, Package, Moon, Sun } from 'lucide-react';
import AIAssistant from './AIAssistant';

export default function Layout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Catálogo 3D', path: '/catalog', icon: Package },
    { name: 'Configurações', path: '/settings', icon: Settings },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 'var(--spacing-6)', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', fontWeight: 600, fontSize: '1.125rem' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: 'var(--spacing-1)', borderRadius: 'var(--radius-sm)' }}>
              <Briefcase size={20} />
            </div>
            MicroManage
          </div>
        </div>

        <nav style={{ flex: 1, padding: 'var(--spacing-4)' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-3)',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: isActive ? 500 : 400,
                      transition: 'var(--transition)'
                    }}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
              {(user?.user_metadata?.name || user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.user_metadata?.name || user?.name || user?.email}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</div>
            </div>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-main)', padding: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          <button 
            onClick={signOut}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)', padding: 'var(--spacing-2)' }}
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Floating AI Button */}
      <button 
        onClick={() => setIsAIOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 40,
          border: 'none',
          cursor: 'pointer'
        }}
        title="Estratégia e Análise"
      >
        <Target size={24} />
      </button>

      {/* AI Assistant Panel */}
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  );
}

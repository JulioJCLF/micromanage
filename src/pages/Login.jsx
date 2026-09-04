import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente ou crie uma conta.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary)', color: 'white', marginBottom: 'var(--spacing-4)' }}>
            <LogIn size={24} />
          </div>
          <h2>Bem-vindo de volta</h2>
          <p>Faça login para gerenciar seus projetos</p>
        </div>

        {error && (
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: '#FEE2E2', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500 }}>Senha</label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500 }}>Esqueceu a senha?</Link>
            </div>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-2)', width: '100%', padding: 'var(--spacing-3)' }}>
            Entrar
          </button>
        </form>

        <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Crie seu usuário no painel do Supabase.
        </div>
      </div>
    </div>
  );
}

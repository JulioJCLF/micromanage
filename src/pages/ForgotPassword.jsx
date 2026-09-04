import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Email de recuperação enviado!');
    } catch (err) {
      toast.error(err.message || 'Erro ao enviar email de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary)', color: 'white', marginBottom: 'var(--spacing-4)' }}>
            <KeyRound size={24} />
          </div>
          <h2>Recuperar Senha</h2>
          <p>Enviaremos um link para você redefinir sua senha.</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-6)' }}>
              Um link de recuperação foi enviado para <strong>{email}</strong>.
              Verifique sua caixa de entrada e a pasta de spam.
            </div>
            <Link to="/login" className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Email cadastrado</label>
              <input 
                type="email" 
                className="input-field" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--spacing-2)', width: '100%', padding: 'var(--spacing-3)' }}>
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
            <div style={{ marginTop: 'var(--spacing-4)', textAlign: 'center' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <ArrowLeft size={16} /> Voltar ao login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

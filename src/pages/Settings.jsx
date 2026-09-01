import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser({ name });
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error('Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: 'var(--spacing-2)' }}>Configurações da Conta</h1>
      <p style={{ marginBottom: 'var(--spacing-8)' }}>Gerencie suas informações de perfil e preferências.</p>

      <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-6)' }}>
          <User size={20} className="text-primary" />
          Perfil
        </h2>
        
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Nome Completo</label>
            <input 
              type="text" 
              className="input-field" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Email (não editável)</label>
            <input 
              type="email" 
              className="input-field" 
              value={user?.email}
              disabled
              style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || name === user?.name}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
          <Shield size={20} className="text-primary" />
          Nível de Acesso
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <div style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: user?.role === 'admin' ? 'var(--primary)' : 'var(--bg-hover)', color: user?.role === 'admin' ? 'white' : 'var(--text-main)', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>
            {user?.role || 'User'}
          </div>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            {user?.role === 'admin' ? 'Você tem acesso total ao sistema e configurações de usuários.' : 'Seu acesso é limitado aos seus próprios projetos.'}
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updates = {
        data: { name }
      };
      if (email && email !== user?.email) {
        updates.email = email;
      }
      if (password) {
        updates.password = password;
      }

      await updateUser(updates);
      
      if (email && email !== user?.email) {
        toast.success('Perfil atualizado! Verifique seu novo e antigo email para confirmar a troca.');
      } else {
        toast.success('Perfil atualizado com sucesso!');
      }
      setPassword(''); // clear password field after save
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: 'var(--spacing-2)' }}>Configurações da Conta</h1>
      <p style={{ marginBottom: 'var(--spacing-8)' }}>Gerencie suas informações de perfil, email e senha.</p>

      <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-6)' }}>
          <User size={20} className="text-primary" />
          Perfil e Segurança
        </h2>
        
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Nome de Exibição</label>
            <input 
              type="text" 
              className="input-field" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Como quer ser chamado?"
            />
          </div>
          
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Nova Senha</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Deixe em branco para manter a atual"
              minLength={6}
            />
            <p style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-1)' }}>Mínimo de 6 caracteres.</p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
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

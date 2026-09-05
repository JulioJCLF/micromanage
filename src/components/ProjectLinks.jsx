import { useState, useEffect } from 'react';
import { supabaseMock } from '../services/api';
import { Link2, ExternalLink, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectLinks({ projectId }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('drive'); // drive, figma, github, other

  const loadLinks = async () => {
    setLoading(true);
    const { data } = await supabaseMock.links.list(projectId);
    setLinks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadLinks();
  }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('A URL deve começar com http:// ou https://');
      return;
    }
    
    try {
      await supabaseMock.links.create({
        project_id: projectId,
        title,
        url,
        category
      });
      toast.success('Link adicionado!');
      setIsModalOpen(false);
      setTitle('');
      setUrl('');
      setCategory('drive');
      loadLinks();
    } catch (error) {
      toast.error('Erro ao adicionar link');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remover este link?')) {
      await supabaseMock.links.delete(id);
      toast.success('Link removido');
      loadLinks();
    }
  };

  if (loading) return <div style={{ padding: 'var(--spacing-4)' }}>Carregando links...</div>;

  return (
    <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <Link2 size={20} className="text-primary" />
            Recursos e Links
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Acesse rápido Google Drive, Figma, Docs, etc.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Adicionar Link
        </button>
      </div>

      {links.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <Link2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto var(--spacing-4)' }} />
          <h3 style={{ marginBottom: 'var(--spacing-2)' }}>Nenhum link salvo</h3>
          <p style={{ color: 'var(--text-muted)' }}>Mantenha pastas do Drive ou referências centralizadas aqui.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-4)' }}>
          {links.map(link => (
            <div key={link.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '2px 8px', 
                    backgroundColor: 'var(--bg-hover)', 
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}>
                    {link.category}
                  </span>
                  <span style={{ fontWeight: 500 }}>{link.title}</span>
                </div>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {link.url} <ExternalLink size={12} />
                </a>
              </div>
              <button className="btn-ghost" onClick={() => handleDelete(link.id)} style={{ color: 'var(--danger)', padding: 'var(--spacing-2)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-card)' }}>
            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Adicionar Novo Link</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 'var(--spacing-3)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Título</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Pasta Google Drive"
                  required
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 'var(--spacing-3)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>URL</label>
                <input 
                  type="url" 
                  className="input-field" 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Categoria</label>
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="drive">Google Drive</option>
                  <option value="figma">Figma / Design</option>
                  <option value="docs">Documentação</option>
                  <option value="referencia">Referência / Ideia</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Link</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

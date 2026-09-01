import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabaseMock } from '../services/api';
import KanbanBoard from '../components/KanbanBoard';
import NotesArea from '../components/NotesArea';
import ProjectLinks from '../components/ProjectLinks';
import { ArrowLeft, Layout, FileText, Settings, Trash2, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' or 'notes'
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      const { data } = await supabaseMock.projects.get(id);
      setProject(data);
      if (data) {
        setEditName(data.name);
        setEditDesc(data.description || '');
      }
      setLoading(false);
    };
    loadProject();
  }, [id]);

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    const { data } = await supabaseMock.projects.update(id, { name: editName, description: editDesc });
    setProject(data);
    setIsSettingsOpen(false);
    toast.success('Projeto atualizado!');
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Tem certeza absoluta? Isso apagará todos os cards e notas deste projeto. Esta ação é irreversível.')) {
      await supabaseMock.projects.delete(id);
      toast.success('Projeto excluído.');
      navigate('/');
    }
  };

  if (loading) return <div>Carregando projeto...</div>;
  if (!project) return <div>Projeto não encontrado.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-4)', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Voltar ao Dashboard
          </Link>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            {project.name}
          </h1>
          {project.description && <p style={{ marginTop: 'var(--spacing-2)' }}>{project.description}</p>}
        </div>
        
        <button className="btn btn-secondary" onClick={() => setIsSettingsOpen(true)}>
          <Settings size={18} /> Configurações do Projeto
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-4)', borderBottom: '1px solid var(--border-color)', marginBottom: 'var(--spacing-6)' }}>
        <button 
          onClick={() => setActiveTab('kanban')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', 
            padding: 'var(--spacing-2) var(--spacing-4)',
            borderBottom: activeTab === 'kanban' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'kanban' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'kanban' ? 500 : 400
          }}
        >
          <Layout size={18} /> Quadro Kanban
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', 
            padding: 'var(--spacing-2) var(--spacing-4)',
            borderBottom: activeTab === 'notes' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'notes' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'notes' ? 500 : 400
          }}
        >
          <FileText size={18} /> Anotações
        </button>
        <button 
          onClick={() => setActiveTab('links')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', 
            padding: 'var(--spacing-2) var(--spacing-4)',
            borderBottom: activeTab === 'links' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'links' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'links' ? 500 : 400
          }}
        >
          <Link2 size={18} /> Links Rápidos
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'kanban' && <KanbanBoard projectId={project.id} />}
        {activeTab === 'notes' && <NotesArea projectId={project.id} />}
        {activeTab === 'links' && <ProjectLinks projectId={project.id} />}
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-card)' }}>
            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Configurações do Projeto</h2>
            <form onSubmit={handleUpdateProject}>
              <div style={{ marginBottom: 'var(--spacing-3)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Nome do Projeto</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Descrição</label>
                <textarea 
                  className="input-field" 
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h4 style={{ color: 'var(--danger)', marginBottom: 'var(--spacing-2)', fontSize: '0.875rem' }}>Zona de Perigo</h4>
                <button type="button" className="btn" style={{ backgroundColor: 'white', color: 'var(--danger)', border: '1px solid var(--danger)', width: '100%', justifyContent: 'center' }} onClick={handleDeleteProject}>
                  <Trash2 size={16} /> Excluir Projeto
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsSettingsOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

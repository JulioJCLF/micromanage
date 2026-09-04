import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseMock } from '../services/api';
import { Link } from 'react-router-dom';
import { Plus, Clock, FolderKanban, CheckSquare } from 'lucide-react';
import { handleError } from '../utils/errors';

export default function Dashboard() {
  const { user, currentTenant } = useAuth();
  const [projects, setProjects] = useState([]);
  const [recentCards, setRecentCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectColumns, setProjectColumns] = useState([]);
  const [selectedColumnId, setSelectedColumnId] = useState('');

  const loadData = async () => {
    if (!currentTenant) return;
    setLoading(true);
    const { data: projData } = await supabaseMock.projects.list(currentTenant.id);
    setProjects(projData);

    const { data: cardsData } = await supabaseMock.cards.listAll(currentTenant.id);
    // Get 5 most recent cards
    setRecentCards(cardsData.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentTenant]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!currentTenant) return;
    try {
      const { data, error } = await supabaseMock.projects.create({
        name: newProjectName,
        description: newProjectDesc,
        tenant_id: currentTenant.id
      });
      if (error) throw error;
      
      // se foi criado com template, nós poderiamos criar as colunas aqui.
      // por enquanto, vamos apenas criar colunas padrao
      const defaultCols = ['A Fazer', 'Em Andamento', 'Concluído'];
      for (let i = 0; i < defaultCols.length; i++) {
        await supabaseMock.columns.create({
          project_id: data.id,
          name: defaultCols[i],
          order: i
        });
      }

      setNewProjectName('');
      setNewProjectDesc('');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      handleError(error, 'Erro ao criar projeto');
    }
  };

  const handleProjectSelect = async (projectId) => {
    setSelectedProjectId(projectId);
    if (projectId) {
      const { data } = await supabaseMock.columns.list(projectId);
      setProjectColumns(data);
      if (data.length > 0) {
        setSelectedColumnId(data[0].id);
      } else {
        setSelectedColumnId('');
      }
    } else {
      setProjectColumns([]);
      setSelectedColumnId('');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedColumnId) return;
    
    const { data: cardsData } = await supabaseMock.cards.list(selectedProjectId);
    const columnCards = cardsData.filter(c => c.column_id === selectedColumnId);
    const order = columnCards.length > 0 ? Math.max(...columnCards.map(c => c.order || 0)) + 1 : 0;
    
    await supabaseMock.cards.create({
      project_id: selectedProjectId,
      column_id: selectedColumnId,
      title: newTaskTitle,
      order
    });
    
    setNewTaskTitle('');
    setIsTaskModalOpen(false);
    loadData();
  };

  if (loading) return <div>Carregando dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-8)' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral dos seus projetos e tarefas recentes.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <button className="btn btn-secondary" onClick={() => {
            setIsTaskModalOpen(true);
            if (projects.length > 0) {
              const defaultProj = projects.find(p => p.name === 'Projeto Geral') || projects[0];
              handleProjectSelect(defaultProj.id);
            }
          }}>
            <CheckSquare size={18} />
            Nova Tarefa
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Novo Projeto
          </button>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Main Column: Projects */}
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
            <FolderKanban size={20} className="text-primary" />
            Projetos Ativos
          </h2>
          
          {projects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
              <p style={{ marginBottom: 'var(--spacing-4)' }}>Você ainda não tem nenhum projeto.</p>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Começar agora</button>
            </div>
          ) : (
            <div className="project-grid">
              {projects.map(project => (
                <Link to={`/project/${project.id}`} key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h3 style={{ marginBottom: 'var(--spacing-2)' }}>{project.name}</h3>
                  <p style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-4)', flex: 1 }}>{project.description || 'Sem descrição'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--spacing-3)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    <span style={{ backgroundColor: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{project.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Column: Recent Cards */}
        <div>
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', fontSize: '1rem' }}>
              <Clock size={18} />
              Tarefas Recentes
            </h3>
            
            {recentCards.length === 0 ? (
              <p style={{ fontSize: '0.875rem' }}>Nenhuma tarefa recente.</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                {recentCards.map(card => {
                  const project = projects.find(p => p.id === card.project_id);
                  return (
                    <li key={card.id} style={{ paddingBottom: 'var(--spacing-3)', borderBottom: '1px solid var(--border-light)' }}>
                      <Link to={`/project/${card.project_id}`} style={{ display: 'block' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '4px' }}>{card.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{project?.name}</span>
                          <span>{new Date(card.created_at).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-card)' }}>
            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Novo Projeto</h2>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: 'var(--spacing-3)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Nome do Projeto</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 'var(--spacing-3)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Template</label>
                <select 
                  className="input-field" 
                  value={newProjectTemplate}
                  onChange={e => setNewProjectTemplate(e.target.value)}
                >
                  <option value="default">Padrão (A Fazer, Em Andamento, Concluído)</option>
                  <option value="crm">Funil de Vendas 3D/Airsoft</option>
                  <option value="content">Calendário de Produção de Conteúdo</option>
                  <option value="factory">Fila de Impressoras 3D (Fábrica)</option>
                </select>
              </div>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Descrição (opcional)</label>
                <textarea 
                  className="input-field" 
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar Projeto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-card)' }}>
            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Nova Tarefa</h2>
            {projects.length === 0 ? (
              <div>
                <p style={{ marginBottom: 'var(--spacing-4)', color: 'var(--text-muted)' }}>Você precisa criar um projeto primeiro.</p>
                <button className="btn btn-ghost" onClick={() => setIsTaskModalOpen(false)}>Fechar</button>
              </div>
            ) : (
              <form onSubmit={handleCreateTask}>
                <div style={{ marginBottom: 'var(--spacing-3)' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Projeto</label>
                  <select 
                    className="input-field" 
                    value={selectedProjectId}
                    onChange={e => handleProjectSelect(e.target.value)}
                    required
                  >
                    <option value="">Selecione um projeto</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {projectColumns.length > 0 && (
                  <div style={{ marginBottom: 'var(--spacing-3)' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Coluna</label>
                    <select 
                      className="input-field" 
                      value={selectedColumnId}
                      onChange={e => setSelectedColumnId(e.target.value)}
                      required
                    >
                      {projectColumns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedProjectId && projectColumns.length === 0 && (
                  <div style={{ marginBottom: 'var(--spacing-3)', color: 'var(--warning)', fontSize: '0.875rem' }}>
                    Este projeto não tem colunas.
                  </div>
                )}

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Título da Tarefa</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    required
                    disabled={!selectedColumnId}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsTaskModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={!selectedColumnId}>Criar Tarefa</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

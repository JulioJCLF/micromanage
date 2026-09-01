import { useState, useEffect } from 'react';
import { supabaseMock } from '../services/api';
import { Plus, Save, FileText, PenTool, Video } from 'lucide-react';

export default function NotesArea({ projectId }) {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabaseMock.notes.list(projectId);
    setNotes(data);
    if (data.length > 0 && !activeNote) {
      setActiveNote(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleCreateNote = async () => {
    const { data } = await supabaseMock.notes.create({
      project_id: projectId,
      title: 'Nova Anotação',
      content: ''
    });
    setNotes([data, ...notes]);
    setActiveNote(data);
    setIsEditing(true);
    setEditTitle(data.title);
    setEditContent(data.content);
  };

  const handleEditNote = (note) => {
    setActiveNote(note);
    setIsEditing(true);
    setEditTitle(note.title);
    setEditContent(note.content || '');
  };

  const handleSaveNote = async () => {
    if (!activeNote) return;
    const { data } = await supabaseMock.notes.update(activeNote.id, {
      title: editTitle,
      content: editContent
    });
    setNotes(notes.map(n => n.id === activeNote.id ? data : n));
    setActiveNote(data);
    setIsEditing(false);
  };

  if (loading) return <div>Carregando anotações...</div>;

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--spacing-6)' }}>
      {/* Sidebar with Note List */}
      <div style={{ width: '250px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', paddingRight: 'var(--spacing-4)' }}>
        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 'var(--spacing-4)' }} onClick={handleCreateNote}>
          <Plus size={18} />
          Nova Anotação
        </button>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notes.length === 0 ? (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--spacing-4)' }}>
              Nenhuma anotação criada.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
              {notes.map(note => (
                <li key={note.id}>
                  <button 
                    onClick={() => {
                      setActiveNote(note);
                      setIsEditing(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: activeNote?.id === note.id ? 'var(--bg-hover)' : 'transparent',
                      color: activeNote?.id === note.id ? 'var(--text-main)' : 'var(--text-muted)',
                      fontWeight: activeNote?.id === note.id ? 500 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)'
                    }}
                  >
                    <FileText size={16} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Note Editor Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--spacing-2) 0' }}>
        {activeNote ? (
          isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)' }}>
                <input 
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '1.5rem', fontWeight: 600, border: 'none', backgroundColor: 'transparent', padding: 0 }}
                  placeholder="Título da anotação"
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  <button className="btn btn-secondary" onClick={() => {
                    const prompt = window.prompt("Sobre o que é a legenda?");
                    if (prompt) {
                      setEditContent(prev => prev + `\n\n[Legenda Gerada]: Aumente seu desempenho no campo! 🎯 Chegaram os novos suportes de GoPro e grips texturizados, tudo impresso em 3D de alta resistência. 🔥 Pronta entrega. Chama na DM!\n#airsoft #airsoftbrasil #impressao3d`);
                    }
                  }} title="Escrever Legenda">
                    <PenTool size={16} style={{ color: 'var(--text-muted)' }} /> Legenda
                  </button>
                  <button className="btn btn-secondary" onClick={() => {
                    const prompt = window.prompt("Qual o tema do roteiro?");
                    if (prompt) {
                      setEditContent(prev => prev + `\n\n[Roteiro de Vídeo]:\nCENA 1: Close no marcador de airsoft sem acessório.\nÁUDIO: "Cansado de perder estabilidade na hora do jogo?"\nCENA 2: Instalação rápida do grip impresso em 3D.\nÁUDIO: "Nosso novo foregrip 3D muda tudo."\nCENA 3: Teste de precisão (gameplay).\nÁUDIO: "Mais precisão, mais leveza e resistência ABS. Link na bio."`);
                    }
                  }} title="Estruturar Roteiro de Vídeo">
                    <Video size={16} style={{ color: 'var(--text-muted)' }} /> Roteiro
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveNote}>
                    <Save size={18} /> Salvar
                  </button>
                </div>
              </div>
              <textarea 
                className="input-field"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                style={{ flex: 1, resize: 'none', padding: 'var(--spacing-4)', minHeight: '400px' }}
                placeholder="Escreva sua anotação aqui..."
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)', paddingBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--border-light)' }}>
                <h2>{activeNote.title}</h2>
                <button className="btn btn-secondary" onClick={() => handleEditNote(activeNote)}>
                  Editar
                </button>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                {activeNote.content || <span style={{ color: 'var(--text-muted)' }}>Sem conteúdo. Clique em Editar para escrever.</span>}
              </div>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Selecione ou crie uma anotação para começar.
          </div>
        )}
      </div>
    </div>
  );
}

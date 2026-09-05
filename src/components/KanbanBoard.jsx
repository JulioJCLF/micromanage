import { useState, useEffect } from 'react';
import { supabaseMock } from '../services/api';
import { Plus, MoreHorizontal, X, MessageSquare, AlignLeft } from 'lucide-react';

export default function KanbanBoard({ projectId }) {
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColName, setNewColName] = useState('');
  
  const [addingCardToCol, setAddingCardToCol] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  
  const [selectedCard, setSelectedCard] = useState(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDesc, setEditCardDesc] = useState('');
  const [newComment, setNewComment] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [{ data: colsData }, { data: cardsData }] = await Promise.all([
      supabaseMock.columns.list(projectId),
      supabaseMock.cards.list(projectId)
    ]);
    setColumns(colsData);
    setCards(cardsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    await supabaseMock.columns.create({
      project_id: projectId,
      name: newColName,
      order: columns.length
    });
    setNewColName('');
    setIsAddingCol(false);
    loadData();
  };

  const handleAddCard = async (e, columnId) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    
    // Calculate order for new card (append to end of column)
    const columnCards = cards.filter(c => c.column_id === columnId);
    const order = columnCards.length > 0 ? Math.max(...columnCards.map(c => c.order || 0)) + 1 : 0;
    
    await supabaseMock.cards.create({
      project_id: projectId,
      column_id: columnId,
      title: newCardTitle,
      order
    });
    setNewCardTitle('');
    setAddingCardToCol(null);
    loadData();
  };

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData('cardId', card.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // necessary to allow dropping
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    if (!cardId) return;

    const card = cards.find(c => c.id === cardId);
    if (card && card.column_id !== columnId) {
      // Optimistic update
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, column_id: columnId } : c));
      await supabaseMock.cards.update(cardId, { column_id: columnId });
    }
  };

  const handleUpdateCard = async () => {
    if (!selectedCard) return;
    const updates = { title: editCardTitle, description: editCardDesc };
    const { data } = await supabaseMock.cards.update(selectedCard.id, updates);
    setCards(prev => prev.map(c => c.id === selectedCard.id ? data : c));
    setSelectedCard(data);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedCard) return;
    
    const comment = {
      id: Date.now().toString(),
      text: newComment,
      created_at: new Date().toISOString()
    };
    
    const updatedComments = [...(selectedCard.comments || []), comment];
    const { data } = await supabaseMock.cards.update(selectedCard.id, { comments: updatedComments });
    
    setCards(prev => prev.map(c => c.id === selectedCard.id ? data : c));
    setSelectedCard(data);
    setNewComment('');
  };

  if (loading) return <div>Carregando quadro...</div>;

  return (
    <div className="no-scrollbar kanban-board" style={{ display: 'flex', gap: 'var(--spacing-4)', height: '100%', overflowX: 'auto', paddingBottom: 'var(--spacing-4)' }}>
      {columns.map(column => {
        const columnCards = cards.filter(c => c.column_id === column.id);
        return (
          <div 
            key={column.id} 
            className="kanban-column"
            style={{ 
              width: '320px', 
              minWidth: '320px', 
              backgroundColor: 'var(--bg-hover)', 
              borderRadius: 'var(--radius-lg)', 
              display: 'flex', 
              flexDirection: 'column', 
              maxHeight: '100%',
              border: '1px solid transparent' // For potential drag states later
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: 'var(--text-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <span>{column.name}</span>
                <span style={{ 
                  backgroundColor: 'var(--border-light)', 
                  color: 'var(--text-muted)', 
                  fontSize: '0.75rem', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  fontWeight: 500
                }}>
                  {columnCards.length}
                </span>
              </div>
              <button className="btn-ghost" style={{ padding: '4px', color: 'var(--text-muted)' }}>
                <MoreHorizontal size={16} />
              </button>
            </div>
            
            {/* Cards List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--spacing-3) var(--spacing-3) var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {columnCards.map(card => (
                <div 
                  key={card.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, card)}
                  onClick={() => {
                    setSelectedCard(card);
                    setEditCardTitle(card.title);
                    setEditCardDesc(card.description || '');
                  }}
                  style={{ 
                    padding: 'var(--spacing-3)', 
                    cursor: 'grab', 
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                    border: '1px solid var(--border-light)',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)';
                  }}
                >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: card.title.match(/\[(.*?)\]/g) ? '8px' : '0' }}>
                  {(card.title.match(/\[(.*?)\]/g) || []).map((tag, i) => {
                    const tagText = tag.replace('[', '').replace(']', '');
                    let color = 'var(--bg-hover)';
                    let textColor = 'var(--text-main)';
                    if (tagText.toLowerCase() === 'vídeo') { color = '#DBEAFE'; textColor = '#1D4ED8'; }
                    if (tagText.toLowerCase() === 'post') { color = '#FCE7F3'; textColor = '#BE185D'; }
                    if (tagText.toLowerCase() === 'lead') { color = '#D1FAE5'; textColor = '#047857'; }
                    
                    return (
                      <span key={i} style={{ backgroundColor: color, color: textColor, padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        {tagText}
                      </span>
                    )
                  })}
                </div>
                <div style={{ wordBreak: 'break-word' }}>
                  {card.title.replace(/\[(.*?)\]/g, '').trim()}
                </div>
              </div>
            ))}
            
            {addingCardToCol === column.id ? (
              <form onSubmit={(e) => handleAddCard(e, column.id)} style={{ marginTop: 'var(--spacing-2)' }}>
                <input 
                  autoFocus
                  className="input-field" 
                  value={newCardTitle}
                  onChange={e => setNewCardTitle(e.target.value)}
                  placeholder="Título do card..."
                  style={{ marginBottom: 'var(--spacing-2)' }}
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '4px 8px' }}>Adicionar</button>
                  <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setAddingCardToCol(null)}>Cancelar</button>
                </div>
              </form>
            ) : (
              <button 
                className="btn btn-ghost" 
                style={{ width: '100%', justifyContent: 'flex-start', padding: 'var(--spacing-2)', color: 'var(--text-muted)' }}
                onClick={() => setAddingCardToCol(column.id)}
              >
                <Plus size={16} />
                Adicionar card
              </button>
            )}
          </div>
        </div>
        );
      })}

      {/* Add Column Button */}
      <div style={{ width: '300px', minWidth: '300px' }}>
        {isAddingCol ? (
          <form className="card" onSubmit={handleAddColumn} style={{ padding: 'var(--spacing-3)' }}>
            <input 
              autoFocus
              className="input-field" 
              value={newColName}
              onChange={e => setNewColName(e.target.value)}
              placeholder="Nome da coluna"
              style={{ marginBottom: 'var(--spacing-2)' }}
            />
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '4px 8px' }}>Salvar</button>
              <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setIsAddingCol(false)}>Cancelar</button>
            </div>
          </form>
        ) : (
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', justifyContent: 'flex-start', borderStyle: 'dashed', borderWidth: '1px' }}
            onClick={() => setIsAddingCol(true)}
          >
            <Plus size={18} />
            Adicionar coluna
          </button>
        )}
      </div>

      {/* Spacer to prevent right cutoff on scroll */}
      <div style={{ minWidth: '16px', flexShrink: 0 }} />

      {/* Card Detail Modal */}
      {selectedCard && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-main)', padding: 0, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 'var(--spacing-6) var(--spacing-6) var(--spacing-4) var(--spacing-6)' }}>
              <input 
                className="input-field"
                style={{ fontSize: '1.25rem', fontWeight: 600, border: 'none', backgroundColor: 'transparent', padding: 0, flex: 1, marginRight: 'var(--spacing-4)' }}
                value={editCardTitle}
                onChange={e => setEditCardTitle(e.target.value)}
                onBlur={handleUpdateCard}
              />
              <button className="btn-ghost" onClick={() => setSelectedCard(null)} style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--spacing-6) var(--spacing-6) var(--spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              
              {/* Description */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)', fontWeight: 500, color: 'var(--text-main)' }}>
                  <AlignLeft size={18} />
                  Descrição
                </div>
                <textarea 
                  className="input-field"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Adicione uma descrição mais detalhada..."
                  value={editCardDesc}
                  onChange={e => setEditCardDesc(e.target.value)}
                  onBlur={handleUpdateCard}
                />
              </div>

              {/* Comments Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', fontWeight: 500, color: 'var(--text-main)' }}>
                  <MessageSquare size={18} />
                  Mensagens / Atividade
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                  {(selectedCard.comments || []).map(comment => (
                    <div key={comment.id} style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                        EU
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-2)', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Você</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', backgroundColor: 'var(--bg-card)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Escreva um comentário..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary" disabled={!newComment.trim()}>Enviar</button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

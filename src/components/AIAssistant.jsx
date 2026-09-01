import { useState } from 'react';
import { Target, X, Send } from 'lucide-react';

export default function AIAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Analisador Estratégico ativado. Cole o link do seu vídeo, roteiro ou peça ajuda para otimizar suas conversões de vendas.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const mockResponses = [
    "Analisando o roteiro... O início está bom, mas nos primeiros 3 segundos você precisa prender mais a atenção. Sugiro começar logo com a cena da mira ou disparo em primeira pessoa (POV).",
    "Gostei do vídeo! No entanto, o trecho entre 0:15 e 0:25 ficou sem dinâmica. Experimente adicionar uma música de fundo estilo 'suspense' e fazer cortes mais secos no ritmo da batida.",
    "Esse rascunho está ótimo para o Instagram, mas o CTA (Call to Action) no final está muito fraco. Mude de 'Compre no site' para 'Comenta EU QUERO que te envio o link do suporte 3D inbox'.",
    "Verifiquei o texto: Os gatilhos mentais estão bem aplicados, especialmente a prova social. Para melhorar, adicione um senso de urgência no final ('Últimas unidades do lote')."
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking and responding
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setMessages(prev => [...prev, { role: 'assistant', text: randomResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '380px',
      backgroundColor: 'var(--bg-card)',
      boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--border-light)'
    }} className="animate-fade-in">
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--primary)' }}>
          <Target size={24} />
          <h3 style={{ margin: 0 }}>Análise & Estratégia</h3>
        </div>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '4px', borderRadius: '4px' }}>
          <X size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', backgroundColor: 'var(--bg-main)' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' 
          }}>
            <div style={{
              maxWidth: '85%',
              padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
              color: msg.role === 'user' ? 'white' : 'var(--text-main)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-light)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              borderBottomRightRadius: msg.role === 'user' ? '4px' : 'var(--radius-lg)',
              borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : 'var(--radius-lg)'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: 'var(--spacing-2) var(--spacing-3)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Digitando...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid var(--border-light)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Peça ideias ou insights..."
            className="input-field"
            style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
          />
          <button type="submit" disabled={isTyping} className="btn-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}

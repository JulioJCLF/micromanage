import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseMock } from '../services/api';
import { Package, Plus, Calculator, Trash2, Edit2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Catalog() {
  const { user, currentTenant } = useAuth();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [material, setMaterial] = useState('PLA');
  const [weight, setWeight] = useState('');
  const [printTime, setPrintTime] = useState('');
  const [spoolPrice, setSpoolPrice] = useState('120'); // Default 120 BRL per kg
  const [extraCosts, setExtraCosts] = useState('0'); // Accessories, packaging
  const [customMargin, setCustomMargin] = useState(''); // Specific margin for this part

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [globalConfig, setGlobalConfig] = useState({
    kwhPrice: 0.95,
    printerPower: 250,
    printerPrice: 2500,
    printerLifespan: 6000,
    profitMargin: 200,
    materials: {
      PLA: 120,
      ABS: 100,
      PETG: 100,
      TPU: 180,
      Resina: 200
    }
  });

  const loadData = async () => {
    if (!currentTenant) return;
    setLoading(true);
    const { data } = await supabaseMock.catalog.list(currentTenant.id);
    setParts(data);
    
    // Load config
    const savedConfig = localStorage.getItem('catalog_config');
    if (savedConfig) {
      setGlobalConfig(JSON.parse(savedConfig));
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentTenant]);

  const saveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('catalog_config', JSON.stringify(globalConfig));
    toast.success('Parâmetros de custo atualizados!');
    setIsSettingsOpen(false);
  };

  const [editingPart, setEditingPart] = useState(null);

  const calculateCost = (w, pTime, sPrice, eCost, cMargin) => {
    const wNum = parseFloat(w) || 0;
    const tNum = parseFloat(pTime) || 0;
    const sNum = parseFloat(sPrice) || 0;
    const extraNum = parseFloat(eCost) || 0;

    // 1. Material
    const materialCost = (wNum / 1000) * sNum;
    
    // 2. Energia ( kW * h * Preço kWh )
    const kw = globalConfig.printerPower / 1000;
    const energyCost = kw * tNum * globalConfig.kwhPrice;
    
    // 3. Amortização ( Preço / Vida Útil * Tempo )
    const amortization = (globalConfig.printerPrice / globalConfig.printerLifespan) * tNum;
    
    // 4. Outros custos
    const timeCost = energyCost + amortization;
    const totalCost = materialCost + timeCost + extraNum;
    
    // 5. Margem (Usa a customizada se existir, senão a global)
    const marginToUse = (cMargin !== '' && cMargin !== null) ? parseFloat(cMargin) : globalConfig.profitMargin;
    const suggestedPrice = totalCost * (1 + (marginToUse / 100));

    return { materialCost, energyCost, amortization, timeCost, totalCost, suggestedPrice, marginToUse, extraNum };
  };

  const openNewModal = () => {
    setEditingPart(null);
    setName('');
    setMaterial('PLA');
    setWeight('');
    setPrintTime('');
    setSpoolPrice(globalConfig.materials && globalConfig.materials['PLA'] ? globalConfig.materials['PLA'].toString() : '120');
    setExtraCosts('0');
    setCustomMargin('');
    setIsModalOpen(true);
  };

  const openEditModal = (part) => {
    setEditingPart(part);
    setName(part.name);
    setMaterial(part.material);
    setWeight(part.weight);
    setPrintTime(part.print_time);
    setSpoolPrice(part.spool_price);
    setExtraCosts(part.extra_costs || '0');
    setCustomMargin(part.custom_margin !== null && part.custom_margin !== undefined ? part.custom_margin : '');
    setIsModalOpen(true);
  };

  const handleMaterialChange = (e) => {
    const newMat = e.target.value;
    setMaterial(newMat);
    if (globalConfig.materials && globalConfig.materials[newMat]) {
      setSpoolPrice(globalConfig.materials[newMat].toString());
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentTenant) return;
    try {
      const partData = {
        name,
        material,
        weight: parseFloat(weight),
        print_time: parseFloat(printTime),
        spool_price: parseFloat(spoolPrice),
        extra_costs: parseFloat(extraCosts) || 0,
        custom_margin: customMargin !== '' ? parseFloat(customMargin) : null,
      };

      if (editingPart) {
        await supabaseMock.catalog.update(editingPart.id, partData);
        toast.success('Peça atualizada com sucesso!');
      } else {
        partData.tenant_id = currentTenant.id;
        await supabaseMock.catalog.create(partData);
        toast.success('Peça adicionada ao catálogo!');
      }
      
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Erro ao salvar peça.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover esta peça?')) {
      await supabaseMock.catalog.delete(id);
      toast.success('Peça removida.');
      loadData();
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (loading) return <div>Carregando catálogo...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-8)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <Package size={28} className="text-primary" />
            Catálogo 3D & Precificação
          </h1>
          <p>Gerencie suas peças impressas, biblioteca de STL e custos de produção.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <button className="btn btn-secondary" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={18} />
            Parâmetros
          </button>
          <button className="btn btn-primary" onClick={openNewModal}>
            <Plus size={18} />
            Cadastrar Peça
          </button>
        </div>
      </div>

      {parts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <Calculator size={48} style={{ color: 'var(--text-muted)', margin: '0 auto var(--spacing-4)' }} />
          <h3 style={{ marginBottom: 'var(--spacing-2)' }}>Nenhuma peça cadastrada</h3>
          <p style={{ marginBottom: 'var(--spacing-4)' }}>Cadastre sua primeira peça para calcular o custo de impressão e preço sugerido.</p>
          <button className="btn btn-secondary" onClick={openNewModal}>Adicionar ao Catálogo</button>
        </div>
      ) : (
        <div className="parts-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          {parts.map(part => {
            const costs = calculateCost(part.weight, part.print_time, part.spool_price, part.extra_costs, part.custom_margin);
            return (
              <div key={part.id} className="card" style={{ display: 'flex', flexDirection: 'column', flex: '1 1 300px', maxWidth: '100%', padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{part.name}</h3>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => openEditModal(part)} className="btn-ghost" style={{ padding: '4px', color: 'var(--text-muted)' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(part.id)} className="btn-ghost" style={{ padding: '4px', color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
                  <span style={{ backgroundColor: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500 }}>{part.material}</span>
                  <span style={{ backgroundColor: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500 }}>{part.weight}g</span>
                  <span style={{ backgroundColor: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500 }}>{part.print_time}h</span>
                </div>

                <div style={{ backgroundColor: 'var(--bg-hover)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Filamento:</span>
                    <span>{formatCurrency(costs.materialCost)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Energia:</span>
                    <span>{formatCurrency(costs.energyCost)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Amortização:</span>
                    <span>{formatCurrency(costs.amortization)}</span>
                  </div>
                  {costs.extraNum > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Outros (Acabamento):</span>
                      <span>{formatCurrency(costs.extraNum)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <span>Preço de Custo (Total):</span>
                    <span>{formatCurrency(costs.totalCost)}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', textAlign: 'center', padding: 'var(--spacing-3)', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Preço de Venda ({costs.marginToUse}% Lucro)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(costs.suggestedPrice)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-card)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>{editingPart ? "Editar Peça" : "Cadastrar Nova Peça"}</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 'var(--spacing-3)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Nome da Peça / Acessório</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Grip Angular V2"
                  required
                  autoFocus
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Material</label>
                  <select className="input-field" value={material} onChange={handleMaterialChange}>
                    <option value="PLA">PLA</option>
                    <option value="ABS">ABS</option>
                    <option value="PETG">PETG</option>
                    <option value="TPU">TPU (Flexível)</option>
                    <option value="Resina">Resina</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Peso (gramas)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="input-field" 
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="Ex: 45"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Tempo de Impressão (Horas)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="input-field" 
                  value={printTime}
                  onChange={e => setPrintTime(e.target.value)}
                  placeholder="Ex: 2.5 (para 2h30m)"
                  required
                />
              </div>

              <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-6)' }}>
                <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-3)' }}>Variáveis Específicas (Opcional)</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-1)' }}>Custo do Rolo 1kg (R$)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={spoolPrice}
                      onChange={e => setSpoolPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-1)' }}>Outros Custos (Embalagem/Acessórios)</label>
                    <input 
                      type="number"
                      step="0.01" 
                      className="input-field" 
                      value={extraCosts}
                      onChange={e => setExtraCosts(e.target.value)}
                      placeholder="Ex: 5.00"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-1)' }}>Margem Específica (%)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={customMargin}
                      onChange={e => setCustomMargin(e.target.value)}
                      placeholder={`Global: ${globalConfig.profitMargin}%`}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar no Catálogo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-card)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Parâmetros Globais de Custo</h2>
            <p style={{ marginBottom: 'var(--spacing-6)' }}>Configure as variáveis da sua fazenda de impressão.</p>
            <form onSubmit={saveConfig}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Preço Energia (R$/kWh)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input-field" 
                    value={globalConfig.kwhPrice}
                    onChange={e => setGlobalConfig({...globalConfig, kwhPrice: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Consumo da Impressora (Watts)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={globalConfig.printerPower}
                    onChange={e => setGlobalConfig({...globalConfig, printerPower: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Valor da Máquina (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input-field" 
                    value={globalConfig.printerPrice}
                    onChange={e => setGlobalConfig({...globalConfig, printerPrice: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Vida Útil Estimada (Horas)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={globalConfig.printerLifespan}
                    onChange={e => setGlobalConfig({...globalConfig, printerLifespan: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-4)', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--spacing-3)' }}>Tabela Base de Filamentos (R$/kg)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 'var(--spacing-3)' }}>
                  {Object.keys(globalConfig.materials || {}).map(mat => (
                    <div key={mat}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-1)' }}>{mat}</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="input-field" 
                        value={globalConfig.materials[mat]}
                        onChange={e => setGlobalConfig({
                          ...globalConfig, 
                          materials: { ...globalConfig.materials, [mat]: parseFloat(e.target.value) || 0 }
                        })}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>Margem de Lucro Global (%)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={globalConfig.profitMargin}
                  onChange={e => setGlobalConfig({...globalConfig, profitMargin: parseFloat(e.target.value)})}
                  required
                />
                <p style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-1)' }}>Uma margem de 200% significa que você cobra o custo + 200% de lucro.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsSettingsOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Parâmetros</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

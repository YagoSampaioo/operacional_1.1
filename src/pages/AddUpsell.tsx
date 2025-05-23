import React, { useState } from 'react';
import { Home, Activity, TrendingUp, MapPin, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AddUpsell() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    empresa: '',
    servico: '',
    data_de_upsell: '',
    gestor: '',
    valor_de_upsell: '',
    squad: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('upsell')
        .insert([{
          ...formData,
          valor_de_upsell: parseFloat(formData.valor_de_upsell)
        }]);

      if (error) throw error;
      navigate('/upsell');
    } catch (error) {
      console.error('Error adding upsell:', error);
      alert('Erro ao adicionar upsell. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex bg-[#0A0C10]">
      {/* Sidebar */}
      <div className="w-64 bg-[#0F1116] border-r border-yellow-400/20">
        <div className="p-4">
          <Link to="/" className="sidebar-link">
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          
          <nav className="mt-8 space-y-4">
            <Link to="/churns" className="sidebar-link">
              <Activity size={20} />
              <span>Churns</span>
            </Link>
            <div className="sidebar-link-active">
              <TrendingUp size={20} />
              <span className="font-semibold">Upsell</span>
            </div>
            <Link to="/map" className="sidebar-link">
              <MapPin size={20} />
              <span>Mapa</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Adicionar Upsell</h1>
            <Link
              to="/upsell"
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300"
            >
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </Link>
          </div>

          <div className="dashboard-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium text-yellow-400">
                    Empresa
                  </label>
                  <input
                    type="text"
                    id="empresa"
                    name="empresa"
                    required
                    value={formData.empresa}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label htmlFor="servico" className="block text-sm font-medium text-yellow-400">
                    Serviço
                  </label>
                  <input
                    type="text"
                    id="servico"
                    name="servico"
                    required
                    value={formData.servico}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label htmlFor="data_de_upsell" className="block text-sm font-medium text-yellow-400">
                    Data do Upsell
                  </label>
                  <input
                    type="date"
                    id="data_de_upsell"
                    name="data_de_upsell"
                    required
                    value={formData.data_de_upsell}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label htmlFor="gestor" className="block text-sm font-medium text-yellow-400">
                    Gestor
                  </label>
                  <input
                    type="text"
                    id="gestor"
                    name="gestor"
                    required
                    value={formData.gestor}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label htmlFor="valor_de_upsell" className="block text-sm font-medium text-yellow-400">
                    Valor do Upsell
                  </label>
                  <input
                    type="number"
                    id="valor_de_upsell"
                    name="valor_de_upsell"
                    required
                    step="0.01"
                    value={formData.valor_de_upsell}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label htmlFor="squad" className="block text-sm font-medium text-yellow-400">
                    Squad
                  </label>
                  <input
                    type="text"
                    id="squad"
                    name="squad"
                    required
                    value={formData.squad}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-[#0A0C10] disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
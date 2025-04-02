import React, { useEffect, useState } from 'react';
import { Home, Activity, TrendingUp, MapPin, Search, X, Plus, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Churn } from '../types';

export function Churns() {
  const [churns, setChurns] = useState<Churn[]>([]);
  const [filteredChurns, setFilteredChurns] = useState<Churn[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    empresa: '',
    motivo: '',
    gestor: '',
    squad: '',
    startDate: '',
    endDate: ''
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [editingChurn, setEditingChurn] = useState<Churn | null>(null);

  useEffect(() => {
    fetchChurns();
  }, []);

  async function fetchChurns() {
    try {
      const { data, error } = await supabase
        .from('churns')
        .select('*')
        .order('data_de_churn', { ascending: false });

      if (error) throw error;
      setChurns(data || []);
      setFilteredChurns(data || []);
    } catch (error) {
      console.error('Error fetching churns:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const filtered = churns.filter(churn => {
      const matchEmpresa = churn.empresa?.toLowerCase().includes(filters.empresa.toLowerCase()) ?? true;
      const matchMotivo = churn.motivo?.toLowerCase().includes(filters.motivo.toLowerCase()) ?? true;
      const matchGestor = churn.gestor?.toLowerCase().includes(filters.gestor.toLowerCase()) ?? true;
      const matchSquad = churn.squad?.toLowerCase().includes(filters.squad.toLowerCase()) ?? true;

      // Date filtering
      const churnDate = new Date(churn.data_de_churn);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      const matchStartDate = startDate ? churnDate >= startDate : true;
      const matchEndDate = endDate ? churnDate <= endDate : true;

      return matchEmpresa && matchMotivo && matchGestor && matchSquad && matchStartDate && matchEndDate;
    });

    setFilteredChurns(filtered);
  }, [filters, churns]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      empresa: '',
      motivo: '',
      gestor: '',
      squad: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleEdit = async (churn: Churn) => {
    setEditingChurn(churn);
  };

  const handleSave = async () => {
    if (!editingChurn) return;

    try {
      const { error } = await supabase
        .from('churns')
        .update(editingChurn)
        .eq('id', editingChurn.id);

      if (error) throw error;

      setEditingChurn(null);
      fetchChurns();
    } catch (error) {
      console.error('Error updating churn:', error);
      alert('Erro ao atualizar churn. Por favor, tente novamente.');
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingChurn) return;

    const { name, value } = e.target;
    setEditingChurn(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: name === 'LTV' || name === 'valor_perdido' ? parseFloat(value) : value
      };
    });
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0C10]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

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
            <div className="sidebar-link-active">
              <Activity size={20} />
              <span className="font-semibold">Churns</span>
            </div>
            <Link to="/upsell" className="sidebar-link">
              <TrendingUp size={20} />
              <span>Upsell</span>
            </Link>
            <Link to="/map" className="sidebar-link">
              <MapPin size={20} />
              <span>Mapa</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Churns</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="flex items-center gap-2 text-yellow-400/60 hover:text-yellow-400 transition-colors"
              >
                <Search size={20} />
                <span>Filtrar</span>
              </button>
              <Link
                to="/churns/add"
                className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-[#0A0C10]"
              >
                <Plus size={20} />
                <span>Adicionar Churn</span>
              </Link>
            </div>
          </div>

          {isFilterPanelOpen && (
            <div className="dashboard-card mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-semibold">Filtros</h3>
                <button
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="text-yellow-400/60 hover:text-yellow-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium text-yellow-400">
                    Empresa
                  </label>
                  <input
                    type="text"
                    id="empresa"
                    name="empresa"
                    value={filters.empresa}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label htmlFor="motivo" className="block text-sm font-medium text-yellow-400">
                    Motivo
                  </label>
                  <input
                    type="text"
                    id="motivo"
                    name="motivo"
                    value={filters.motivo}
                    onChange={handleFilterChange}
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
                    value={filters.gestor}
                    onChange={handleFilterChange}
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
                    value={filters.squad}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-yellow-400">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-yellow-400">
                    Data Final
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="mt-6 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-[#0A0C10]"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          <div className="dashboard-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-400/20">
                    <th className="text-left p-4 text-yellow-400">Empresa</th>
                    <th className="text-left p-4 text-yellow-400">Motivo</th>
                    <th className="text-left p-4 text-yellow-400">Data do Churn</th>
                    <th className="text-left p-4 text-yellow-400">LTV</th>
                    <th className="text-left p-4 text-yellow-400">Gestor</th>
                    <th className="text-left p-4 text-yellow-400">Valor Perdido</th>
                    <th className="text-left p-4 text-yellow-400">Squad</th>
                    <th className="text-left p-4 text-yellow-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChurns.map((churn) => (
                    <tr key={churn.id} className="border-b border-yellow-400/10 hover:bg-yellow-400/5">
                      {editingChurn?.id === churn.id ? (
                        <>
                          <td className="p-4">
                            <input
                              type="text"
                              name="empresa"
                              value={editingChurn.empresa}
                              onChange={handleEditChange}
                              className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-2 py-1 text-white"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              name="motivo"
                              value={editingChurn.motivo}
                              onChange={handleEditChange}
                              className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-2 py-1 text-white"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="date"
                              name="data_de_churn"
                              value={editingChurn.data_de_churn}
                              onChange={handleEditChange}
                              className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-2 py-1 text-white"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              name="LTV"
                              value={editingChurn.LTV}
                              onChange={handleEditChange}
                              className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-2 py-1 text-white"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              name="gestor"
                              value={editingChurn.gestor}
                              onChange={handleEditChange}
                              className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-2 py-1 text-white"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              name="valor_perdido"
                              value={editingChurn.valor_perdido}
                              onChange={handleEditChange}
                              className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-2 py-1 text-white"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              name="squad"
                              value={editingChurn.squad}
                              onChange={handleEditChange}
                              className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-2 py-1 text-white"
                            />
                          </td>
                          <td className="p-4">
                            <button
                              onClick={handleSave}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              Salvar
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 text-white">{churn.empresa}</td>
                          <td className="p-4 text-white">{churn.motivo}</td>
                          <td className="p-4 text-white">{formatDate(churn.data_de_churn)}</td>
                          <td className="p-4 text-white">{formatCurrency(churn.LTV)}</td>
                          <td className="p-4 text-white">{churn.gestor}</td>
                          <td className="p-4 text-red-400">{formatCurrency(churn.valor_perdido)}</td>
                          <td className="p-4 text-white">{churn.squad}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handleEdit(churn)}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              <Pencil size={16} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { MapPin, Activity, TrendingUp, Calendar, Pencil, X, MessageSquare, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  totalUpsell: number;
  upsellBySquad: { squad: string; total: number }[];
  upsellByService: { servico: string; total: number }[];
  totalChurns: number;
  churnsBySquad: { squad: string; total: number }[];
  churnsByReason: { motivo: string; total: number }[];
  monthlyData: {
    month: string;
    upsell: number;
    churn: number;
  }[];
}

interface SalesTarget {
  operacional_target: number;
}

export function Dashboard() {
  const { signOut, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [data, setData] = useState<DashboardData>({
    totalUpsell: 0,
    upsellBySquad: [],
    upsellByService: [],
    totalChurns: 0,
    churnsBySquad: [],
    churnsByReason: [],
    monthlyData: []
  });

  const getPeriodDates = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (selectedPeriod === 'current') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  async function fetchDashboardData() {
    try {
      const { data: targetData, error: targetError } = await supabase
        .from('sales_targets')
        .select('operacional_target')
        .eq('id', 'current')
        .single();

      if (targetError) throw targetError;
      setMonthlyGoal(targetData?.operacional_target || 0);

      const { start, end } = getPeriodDates();

      const { data: upsellData, error: upsellError } = await supabase
        .from('upsell')
        .select('valor_de_upsell, squad, servico, data_de_upsell')
        .gte('data_de_upsell', start)
        .lte('data_de_upsell', end);

      if (upsellError) throw upsellError;

      const { data: churnsData, error: churnsError } = await supabase
        .from('churns')
        .select('valor_perdido, squad, motivo, data_de_churn')
        .gte('data_de_churn', start)
        .lte('data_de_churn', end);

      if (churnsError) throw churnsError;

      const totalUpsell = upsellData?.reduce((acc, curr) => acc + (curr.valor_de_upsell || 0), 0) || 0;
      const totalChurns = churnsData?.reduce((acc, curr) => acc + (curr.valor_perdido || 0), 0) || 0;

      const monthlyData = processMonthlyData(upsellData || [], churnsData || []);

      const upsellBySquad = Object.entries(
        upsellData?.reduce((acc: { [key: string]: number }, curr) => {
          const squad = curr.squad || 'Não especificado';
          acc[squad] = (acc[squad] || 0) + (curr.valor_de_upsell || 0);
          return acc;
        }, {}) || {}
      ).map(([squad, total]) => ({ squad, total }));

      const upsellByService = Object.entries(
        upsellData?.reduce((acc: { [key: string]: number }, curr) => {
          const servico = curr.servico || 'Não especificado';
          acc[servico] = (acc[servico] || 0) + (curr.valor_de_upsell || 0);
          return acc;
        }, {}) || {}
      ).map(([servico, total]) => ({ servico, total }));

      const churnsBySquad = Object.entries(
        churnsData?.reduce((acc: { [key: string]: number }, curr) => {
          const squad = curr.squad || 'Não especificado';
          acc[squad] = (acc[squad] || 0) + (curr.valor_perdido || 0);
          return acc;
        }, {}) || {}
      ).map(([squad, total]) => ({ squad, total }));

      const churnsByReason = Object.entries(
        churnsData?.reduce((acc: { [key: string]: number }, curr) => {
          const motivo = curr.motivo || 'Não especificado';
          acc[motivo] = (acc[motivo] || 0) + (curr.valor_perdido || 0);
          return acc;
        }, {}) || {}
      ).map(([motivo, total]) => ({ motivo, total }));

      setData({
        totalUpsell,
        upsellBySquad,
        upsellByService,
        totalChurns,
        churnsBySquad,
        churnsByReason,
        monthlyData
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateTarget = async () => {
    if (!isAdmin) {
      alert('Acesso negado. Apenas administradores podem realizar esta ação.');
      return;
    }

    try {
      const { error } = await supabase
        .from('sales_targets')
        .update({ operacional_target: parseInt(newTarget) })
        .eq('id', 'current');

      if (error) throw error;

      setMonthlyGoal(parseInt(newTarget));
      setIsEditModalOpen(false);
      setNewTarget('');
    } catch (error) {
      console.error('Error updating target:', error);
      alert('Erro ao atualizar meta. Por favor, tente novamente.');
    }
  };

  const processMonthlyData = (upsellData: any[], churnsData: any[]) => {
    const monthlyMap = new Map();
    
    upsellData.forEach(item => {
      const date = new Date(item.data_de_upsell);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey) || { month: monthKey, upsell: 0, churn: 0 };
      existing.upsell += item.valor_de_upsell || 0;
      monthlyMap.set(monthKey, existing);
    });

    churnsData.forEach(item => {
      const date = new Date(item.data_de_churn);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey) || { month: monthKey, upsell: 0, churn: 0 };
      existing.churn += item.valor_perdido || 0;
      monthlyMap.set(monthKey, existing);
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalAtual = data.totalUpsell - data.totalChurns;
  const goalProgress = monthlyGoal > 0 ? (totalAtual / monthlyGoal) * 100 : 0;
  const formattedGoalProgress = totalAtual < 0 ? 
    `-${Math.min(Math.abs(goalProgress), 100).toFixed(1)}` : 
    Math.min(Math.abs(goalProgress), 100).toFixed(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0C10]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0A0C10]">
      <div className="w-64 bg-[#0F1116] border-r border-yellow-400/20">
        <div className="p-4">
          <div className="sidebar-link-active">
            <MapPin size={20} />
            <span className="font-semibold">Dashboard</span>
          </div>
          
          <nav className="mt-8 space-y-4">
            <Link to="/churns" className="sidebar-link">
              <Activity size={20} />
              <span>Churns</span>
            </Link>
            <Link to="/upsell" className="sidebar-link">
              <TrendingUp size={20} />
              <span>Upsell</span>
            </Link>
            <Link to="/map" className="sidebar-link">
              <MapPin size={20} />
              <span>Mapa</span>
            </Link>
            <Link to="/updates" className="sidebar-link">
              <MessageSquare size={20} />
              <span>Atualizações</span>
            </Link>
          </nav>

          <button
            onClick={signOut}
            className="mt-8 w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 transition-colors rounded-lg"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="dashboard-card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Dashboard Operacional</h1>
              <div className="flex items-center gap-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-[#0A0C10] text-white border border-yellow-400/20 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
                >
                  <option value="current">Este Mês</option>
                  <option value="last">Mês Anterior</option>
                </select>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-yellow-400 text-black hover:bg-yellow-300"
                  >
                    <Pencil size={20} />
                    <span>Editar Meta</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-white">Meta Diária</h2>
                  <p className="text-yellow-400/60">
                    {formatCurrency(totalAtual)} de {formatCurrency(monthlyGoal)}
                  </p>
                </div>
                <div className={`text-3xl font-bold ${totalAtual < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {formattedGoalProgress}%
                </div>
              </div>
              <div className="w-full h-4 bg-[#0A0C10] rounded-full overflow-hidden">
                <div
                  className={`h-full ${totalAtual < 0 ? 'bg-red-400' : 'bg-yellow-400'} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(Math.abs(goalProgress), 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="dashboard-card mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Progressão da Meta</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-yellow-400/60">Valor Inicial</span>
                <span className="text-white font-medium">R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400/60">Churns</span>
                <span className="text-red-400 font-medium">-{formatCurrency(data.totalChurns)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400/60">Upsell</span>
                <span className="text-green-400 font-medium">+{formatCurrency(data.totalUpsell)}</span>
              </div>
              <div className="pt-4 border-t border-yellow-400/20">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-400">Total Atual</span>
                  <span className={`font-bold text-xl ${totalAtual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(totalAtual)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-yellow-400/60">Progresso para Meta</span>
                  <span className={`font-medium ${totalAtual < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {formattedGoalProgress}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-semibold">Money Flow</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-yellow-400/60 text-sm">Upsell</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-yellow-400/60 text-sm">Churn</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyData}>
                  <defs>
                    <linearGradient id="upsellGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFAB00" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFAB00" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="churnGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF3D00" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF3D00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFAB00" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#FFAB00" opacity={0.5} />
                  <YAxis stroke="#FFAB00" opacity={0.5} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1116',
                      border: '1px solid rgba(255, 171, 0, 0.2)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#FFAB00' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upsell"
                    stroke="#FFAB00"
                    fillOpacity={1}
                    fill="url(#upsellGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="churn"
                    stroke="#FF3D00"
                    fillOpacity={1}
                    fill="url(#churnGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-semibold">Upsell por Squad</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.upsellBySquad}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFAB00" opacity={0.1} />
                    <XAxis dataKey="squad" stroke="#FFAB00" opacity={0.5} />
                    <YAxis stroke="#FFAB00" opacity={0.5} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1116',
                        border: '1px solid rgba(255, 171, 0, 0.2)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#FFAB00' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#FFAB00" 
                      strokeWidth={2}
                      dot={{ fill: '#FFAB00', r: 4 }}
                      activeDot={{ r: 6, fill: '#FFAB00' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-semibold">Churns por Squad</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.churnsBySquad}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFAB00" opacity={0.1} />
                    <XAxis dataKey="squad" stroke="#FFAB00" opacity={0.5} />
                    <YAxis stroke="#FFAB00" opacity={0.5} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1116',
                        border: '1px solid rgba(255, 171, 0, 0.2)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#FFAB00' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#FF3D00"
                      fill="#FF3D00"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#0F1116] rounded-lg p-6 w-96 border border-yellow-400/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Editar Meta</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-yellow-400/60 hover:text-yellow-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="newTarget" className="block text-sm font-medium text-yellow-400 mb-2">
                Nova Meta
              </label>
              <input
                type="number"
                id="newTarget"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                placeholder="Digite o valor da nova meta"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-yellow-400 hover:text-yellow-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateTarget}
                className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
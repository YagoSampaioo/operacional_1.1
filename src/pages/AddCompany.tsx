import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export function AddCompany() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    empresa: '',
    cidade: '',
    estado: '',
    pais: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('localizacao')
        .insert([formData]);

      if (error) throw error;

      navigate('/');
    } catch (error) {
      console.error('Error adding company:', error);
      alert('Erro ao adicionar empresa. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed-header border-b border-yellow-400/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://ohoizafvlnswtpyugnsz.supabase.co/storage/v1/object/public/logo//logomarca.png" 
              alt="Alpha Assessoria" 
              className="h-12 w-auto"
            />
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300"
          >
            <ArrowLeft size={20} />
            <span>Voltar ao Mapa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 header-offset">
        <div className="bg-black border border-yellow-400/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-8">Adicionar Nova Empresa</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="empresa" className="block text-sm font-medium text-yellow-400">
                Nome da Empresa
              </label>
              <input
                type="text"
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded border border-yellow-400/20 bg-black/50 text-white px-4 py-3 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-yellow-400">
                  Cidade
                </label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded border border-yellow-400/20 bg-black/50 text-white px-4 py-3 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-yellow-400">
                  Estado
                </label>
                <input
                  type="text"
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded border border-yellow-400/20 bg-black/50 text-white px-4 py-3 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pais" className="block text-sm font-medium text-yellow-400">
                País
              </label>
              <input
                type="text"
                id="pais"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded border border-yellow-400/20 bg-black/50 text-white px-4 py-3 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-yellow-400">
                  Latitude
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  pattern="-?\d+(\.\d+)?"
                  className="mt-1 block w-full rounded border border-yellow-400/20 bg-black/50 text-white px-4 py-3 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-yellow-400">
                  Longitude
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  pattern="-?\d+(\.\d+)?"
                  className="mt-1 block w-full rounded border border-yellow-400/20 bg-black/50 text-white px-4 py-3 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black font-semibold py-3 px-4 rounded hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adicionando...' : 'Adicionar Empresa'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
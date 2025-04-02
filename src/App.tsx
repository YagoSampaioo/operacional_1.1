import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Plus, Search, X } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Location } from './types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';

// Custom marker icon with yellow color
const icon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="marker-pin"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    empresa: '',
    cidade: '',
    estado: '',
    pais: ''
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data, error } = await supabase
          .from('localizacao')
          .select('*');

        if (error) throw error;
        setLocations(data || []);
        setFilteredLocations(data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  useEffect(() => {
    const filtered = locations.filter(location => {
      const matchEmpresa = location.empresa.toLowerCase().includes(filters.empresa.toLowerCase());
      const matchCidade = location.cidade.toLowerCase().includes(filters.cidade.toLowerCase());
      const matchEstado = location.estado.toLowerCase().includes(filters.estado.toLowerCase());
      const matchPais = location.pais.toLowerCase().includes(filters.pais.toLowerCase());

      return matchEmpresa && matchCidade && matchEstado && matchPais;
    });

    setFilteredLocations(filtered);
  }, [filters, locations]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      empresa: '',
      cidade: '',
      estado: '',
      pais: ''
    });
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
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Mapa de Empresas</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="flex items-center gap-2 text-yellow-400/60 hover:text-yellow-400 transition-colors"
              >
                <Search size={20} />
                <span>Filtrar</span>
              </button>
              <Link
                to="/add-company"
                className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-[#0A0C10]"
              >
                <Plus size={20} />
                <span>Adicionar Empresa</span>
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
                  <label htmlFor="cidade" className="block text-sm font-medium text-yellow-400">
                    Cidade
                  </label>
                  <input
                    type="text"
                    id="cidade"
                    name="cidade"
                    value={filters.cidade}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
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
                    value={filters.estado}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full rounded border border-yellow-400/20 bg-[#0A0C10] text-white px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label htmlFor="pais" className="block text-sm font-medium text-yellow-400">
                    País
                  </label>
                  <input
                    type="text"
                    id="pais"
                    name="pais"
                    value={filters.pais}
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
        </div>

        <MapContainer
          center={[-15.7801, -47.9292]}
          zoom={4}
          className="w-full h-[calc(100vh-180px)]"
          minZoom={3}
          maxZoom={18}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {filteredLocations.map((location) => (
            <Marker
              key={location.id}
              position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
              icon={icon}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-lg border-b border-yellow-400/20 pb-2 mb-2">{location.empresa}</h3>
                  <p className="text-sm text-yellow-400/60">
                    {location.cidade}, {location.estado}
                  </p>
                  <p className="text-sm text-yellow-400/60">{location.pais}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
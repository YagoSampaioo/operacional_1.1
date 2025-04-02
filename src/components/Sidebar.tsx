import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, TrendingUp, MapPin, MessageSquare } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath === path;
  };

  return (
    <div className="w-64 bg-[#0F1116] border-r border-yellow-400/20">
      <div className="p-4">
        <Link to="/" className={isActive('/') ? 'sidebar-link-active' : 'sidebar-link'}>
          <Home size={20} />
          <span className={isActive('/') ? 'font-semibold' : ''}>Dashboard</span>
        </Link>
        
        <nav className="mt-8 space-y-4">
          <Link to="/churns" className={isActive('/churns') ? 'sidebar-link-active' : 'sidebar-link'}>
            <Activity size={20} />
            <span className={isActive('/churns') ? 'font-semibold' : ''}>Churns</span>
          </Link>
          <Link to="/upsell" className={isActive('/upsell') ? 'sidebar-link-active' : 'sidebar-link'}>
            <TrendingUp size={20} />
            <span className={isActive('/upsell') ? 'font-semibold' : ''}>Upsell</span>
          </Link>
          <Link to="/map" className={isActive('/map') ? 'sidebar-link-active' : 'sidebar-link'}>
            <MapPin size={20} />
            <span className={isActive('/map') ? 'font-semibold' : ''}>Mapa</span>
          </Link>
          <Link to="/updates" className={isActive('/updates') ? 'sidebar-link-active' : 'sidebar-link'}>
            <MessageSquare size={20} />
            <span className={isActive('/updates') ? 'font-semibold' : ''}>Atualizações</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
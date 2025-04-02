import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { signInWithEmail } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

export function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const { user: authUser } = useAuth();

  React.useEffect(() => {
    if (authUser) {
      navigate('/dashboard');
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await signInWithEmail(formData.email, formData.password);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/dashboard';
    } catch (error: any) {
      setError('Credenciais inválidas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden">
      {/* Gradient Effects */}
      <div className="gradient-top opacity-30"></div>
      <div className="gradient-bottom opacity-30"></div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="energy-line absolute w-32"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full px-4 relative z-10">
        {/* Logo and Welcome Text */}
        <div className="text-center mb-8">
          <div className="floating chrome w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
            <div className="absolute inset-0 tech-gradient opacity-20"></div>
            <LogIn className="h-10 w-10 text-electric-blue glow" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-3 neon-text">Bem-vindo</h2>
          <p className="text-electric-blue/60">Entre com suas credenciais para acessar o sistema</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 tech-gradient opacity-5"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-magenta/10 border border-magenta/20 rounded-lg p-4 text-magenta text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-electric-blue glow-text">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-electric-blue/40" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="tech-input w-full pl-11"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-electric-blue glow-text">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-electric-blue/40" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="tech-input w-full pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tech-button w-full relative group"
            >
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="ml-2">Entrando...</span>
                  </div>
                ) : (
                  'Entrar'
                )}
              </span>
            </button>

            <div className="text-center">
              <p className="text-electric-blue/40 text-sm">
                Não tem uma conta?{' '}
                <button type="button" className="text-electric-blue hover:text-electric-blue/80 transition-colors glow-text">
                  Entre em contato
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
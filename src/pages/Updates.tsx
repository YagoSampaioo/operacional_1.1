import React, { useEffect, useState } from 'react';
import { Home, Activity, TrendingUp, MapPin, Search, Plus, X, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ClientNote } from '../types';

export function Updates() {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({ client_name: '', note: '' });
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddNote = async () => {
    try {
      const { error } = await supabase
        .from('client_notes')
        .insert([newNote]);

      if (error) throw error;

      setNewNote({ client_name: '', note: '' });
      setIsAddModalOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Erro ao adicionar nota. Por favor, tente novamente.');
    }
  };

  const handleEditNote = async () => {
    if (!editingNote) return;

    try {
      const { error } = await supabase
        .from('client_notes')
        .update({
          client_name: editingNote.client_name,
          note: editingNote.note
        })
        .eq('id', editingNote.id);

      if (error) throw error;

      setEditingNote(null);
      setIsEditModalOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Erro ao atualizar nota. Por favor, tente novamente.');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return;

    try {
      const { error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Erro ao excluir nota. Por favor, tente novamente.');
    }
  };

  const filteredNotes = notes.filter(note => 
    note.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            <Link to="/upsell" className="sidebar-link">
              <TrendingUp size={20} />
              <span>Upsell</span>
            </Link>
            <Link to="/map" className="sidebar-link">
              <MapPin size={20} />
              <span>Mapa</span>
            </Link>
            <div className="sidebar-link-active">
              <MessageSquare size={20} />
              <span>Atualizações</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Atualizações</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300"
            >
              <Plus size={20} />
              <span>Nova Nota</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="dashboard-card mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400/60" size={20} />
              <input
                type="text"
                placeholder="Pesquisar por cliente ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded pl-10 pr-4 py-2 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="dashboard-card hover:border-yellow-400/40 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400">{note.client_name}</h3>
                    <span className="text-yellow-400/60 text-sm">{formatDate(note.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingNote(note);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-yellow-400/60 hover:text-yellow-400 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 text-red-400/60 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-white/80 whitespace-pre-wrap">{note.note}</p>
              </div>
            ))}

            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-16 w-16 text-yellow-400/20" />
                <p className="mt-4 text-yellow-400/60">
                  {searchTerm ? 'Nenhuma nota encontrada para esta pesquisa' : 'Nenhuma nota cadastrada'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#0F1116] rounded-lg p-6 w-[600px] border border-yellow-400/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Nova Nota</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-yellow-400/60 hover:text-yellow-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="client_name" className="block text-sm font-medium text-yellow-400 mb-2">
                  Cliente
                </label>
                <input
                  type="text"
                  id="client_name"
                  value={newNote.client_name}
                  onChange={(e) => setNewNote(prev => ({ ...prev, client_name: e.target.value }))}
                  className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-yellow-400 mb-2">
                  Nota
                </label>
                <textarea
                  id="note"
                  value={newNote.note}
                  onChange={(e) => setNewNote(prev => ({ ...prev, note: e.target.value }))}
                  rows={6}
                  className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                  placeholder="Digite sua nota aqui..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-yellow-400 hover:text-yellow-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {isEditModalOpen && editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#0F1116] rounded-lg p-6 w-[600px] border border-yellow-400/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Editar Nota</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingNote(null);
                }}
                className="text-yellow-400/60 hover:text-yellow-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="edit_client_name" className="block text-sm font-medium text-yellow-400 mb-2">
                  Cliente
                </label>
                <input
                  type="text"
                  id="edit_client_name"
                  value={editingNote.client_name}
                  onChange={(e) => setEditingNote(prev => ({ ...prev!, client_name: e.target.value }))}
                  className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label htmlFor="edit_note" className="block text-sm font-medium text-yellow-400 mb-2">
                  Nota
                </label>
                <textarea
                  id="edit_note"
                  value={editingNote.note}
                  onChange={(e) => setEditingNote(prev => ({ ...prev!, note: e.target.value }))}
                  rows={6}
                  className="w-full bg-[#0A0C10] border border-yellow-400/20 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingNote(null);
                }}
                className="px-4 py-2 text-yellow-400 hover:text-yellow-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditNote}
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
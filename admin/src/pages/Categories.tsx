import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, FolderTree, CornerDownRight, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiJson } from '../api';
import { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTopName, setNewTopName] = useState('');
  const [subInputs, setSubInputs] = useState<Record<string, string>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const refresh = () => apiJson<Category[]>('/api/categories').then(setCategories).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const addCategory = async (name: string, parentId?: string) => {
    if (!name.trim()) return;
    try {
      await apiJson('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), parentId }),
      });
      await refresh();
      toast.success(parentId ? 'Sub-category added' : 'Category added');
    } catch (err: any) {
      toast.error(err?.message || 'Could not add the category');
    }
  };

  const startRename = (cat: Category) => {
    setRenamingId(cat.id);
    setRenameValue(cat.name);
  };

  const commitRename = async () => {
    if (!renamingId) return;
    const name = renameValue.trim();
    setRenamingId(null);
    if (!name) return;
    try {
      await apiJson(`/api/categories/${renamingId}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      });
      await refresh();
      toast.success('Category renamed');
    } catch (err: any) {
      toast.error(err?.message || 'Could not rename the category');
    }
  };

  const deleteCategory = async (cat: Category, isTop: boolean) => {
    const warning = isTop
      ? `Delete "${cat.name}" and ALL its sub-categories? Products keep their tag but won't show under this filter anymore.`
      : `Delete sub-category "${cat.name}"?`;
    if (!window.confirm(warning)) return;
    try {
      await apiJson(`/api/categories/${cat.id}`, { method: 'DELETE' });
      await refresh();
      toast.success('Category deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete the category');
    }
  };

  const renameInput = (
    <span className="inline-flex items-center gap-1.5">
      <input
        autoFocus
        type="text"
        value={renameValue}
        onChange={e => setRenameValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') commitRename();
          if (e.key === 'Escape') setRenamingId(null);
        }}
        className="bg-black/60 border border-[#C5A059] text-xs p-1.5 rounded-xs focus:outline-none w-44"
      />
      <button onClick={commitRename} className="p-1 text-emerald-400 hover:text-emerald-300"><Check className="w-3.5 h-3.5" /></button>
      <button onClick={() => setRenamingId(null)} className="p-1 text-[#A7A7A7] hover:text-white"><X className="w-3.5 h-3.5" /></button>
    </span>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-serif text-2xl text-gold-gradient uppercase flex items-center gap-3">
        <FolderTree className="w-6 h-6 text-[#C5A059]" />
        Categories
      </h1>

      {/* Add top-level category */}
      <form
        onSubmit={e => {
          e.preventDefault();
          addCategory(newTopName);
          setNewTopName('');
        }}
        className="flex gap-3"
      >
        <input
          type="text"
          value={newTopName}
          onChange={e => setNewTopName(e.target.value)}
          placeholder="New category name (e.g. Accessories)"
          className="flex-1 bg-black/60 border border-[#2A2A2a] text-xs p-3 rounded-xs focus:border-[#C5A059] focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-[#C5A059] text-black text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#FFD700] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </form>

      {/* Category tree */}
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-[#00140a] border border-[#2A2A2a] rounded-xs">
            <div className="p-4 flex items-center justify-between border-b border-[#2A2A2a]">
              <div>
                {renamingId === cat.id ? (
                  renameInput
                ) : (
                  <>
                    <span className="font-serif text-lg text-[#FFD700]">{cat.name}</span>
                    <span className="text-[10px] text-[#A7A7A7] font-mono ml-2">/{cat.id}</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startRename(cat)}
                  className="p-1.5 border border-[#2A2A2a] hover:border-[#C5A059] text-[#DFC27C] rounded-xs"
                  title="Rename"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteCategory(cat, true)}
                  className="p-1.5 border border-[#2A2A2a] hover:border-red-500 text-red-400 rounded-xs"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sub-categories */}
            <div className="p-4 space-y-2">
              {(cat.children ?? []).map(sub => (
                <div key={sub.id} className="flex items-center justify-between text-xs pl-2">
                  <div className="flex items-center gap-2 text-[#F5F2EE]">
                    <CornerDownRight className="w-3.5 h-3.5 text-[#C5A059]" />
                    {renamingId === sub.id ? (
                      renameInput
                    ) : (
                      <>
                        <span>{sub.name}</span>
                        <span className="text-[10px] text-[#A7A7A7] font-mono">/{sub.id}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startRename(sub)}
                      className="p-1 border border-[#2A2A2a] hover:border-[#C5A059] text-[#DFC27C] rounded-xs"
                      title="Rename"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteCategory(sub, false)}
                      className="p-1 border border-[#2A2A2a] hover:border-red-500 text-red-400 rounded-xs"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {(cat.children ?? []).length === 0 && (
                <p className="text-[10px] text-[#A7A7A7] pl-2">No sub-categories yet.</p>
              )}

              {/* Add sub-category */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  addCategory(subInputs[cat.id] ?? '', cat.id);
                  setSubInputs(s => ({ ...s, [cat.id]: '' }));
                }}
                className="flex gap-2 pt-2"
              >
                <input
                  type="text"
                  value={subInputs[cat.id] ?? ''}
                  onChange={e => setSubInputs(s => ({ ...s, [cat.id]: e.target.value }))}
                  placeholder={`Add sub-category under ${cat.name}...`}
                  className="flex-1 bg-black/60 border border-[#2A2A2a] text-xs p-2 rounded-xs focus:border-[#C5A059] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 border border-[#C5A059]/60 text-[#DFC27C] hover:text-[#FFD700] hover:border-[#FFD700] text-[10px] uppercase tracking-wider rounded-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="p-10 text-center text-xs text-[#A7A7A7] border border-[#2A2A2a] rounded-xs">
            No categories yet — add one above, or run the setup init to seed the defaults.
          </div>
        )}
      </div>
    </div>
  );
};

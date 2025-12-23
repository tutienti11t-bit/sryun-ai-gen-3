
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface MenuItem {
  id: AppView;
  icon: string;
  label: string;
}

const DEFAULT_MENU: MenuItem[] = [
  { id: 'home', icon: '🏠', label: 'Trang Chủ' },
  { id: 'units', icon: '🎯', label: 'Lộ Trình' },
  { id: 'syllabus-solver', icon: '⚡', label: 'Giải Đề Cương' },
  { id: 'lesson-plan', icon: '📁', label: 'Soạn Giáo Án' },
  { id: 'homework', icon: '📝', label: 'Bài Tập' },
  { id: 'ai-tutor', icon: '🤖', label: 'Sryun AI' },
  { id: 'games', icon: '🎮', label: 'Mini Game' },
  { id: 'profile', icon: '👤', label: 'Cá Nhân' },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, mobileOpen, setMobileOpen }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedOrder = localStorage.getItem('sryun_menu_order_v4');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder) as string[];
        const validOrderIds = new Set(DEFAULT_MENU.map(m => m.id));
        const filteredSavedOrder = parsedOrder.filter(id => validOrderIds.has(id as AppView));
        const savedIdSet = new Set(filteredSavedOrder);
        const newItems = DEFAULT_MENU.filter(m => !savedIdSet.has(m.id)).map(m => m.id);
        const finalOrderIds = [...filteredSavedOrder, ...newItems];

        const reordered = [...DEFAULT_MENU].sort((a, b) => {
           return finalOrderIds.indexOf(a.id) - finalOrderIds.indexOf(b.id);
        });
        
        const homeIdx = reordered.findIndex(i => i.id === 'home');
        if (homeIdx > 0) {
            const [homeItem] = reordered.splice(homeIdx, 1);
            reordered.unshift(homeItem);
        }

        setMenuItems(reordered);
      } catch (e) {
        console.error("Failed to load menu order", e);
      }
    }
  }, []);

  const saveOrder = (items: MenuItem[]) => {
    const orderIds = items.map(i => i.id);
    localStorage.setItem('sryun_menu_order_v4', JSON.stringify(orderIds));
  };

  const moveUp = (index: number) => {
    if (index <= 1) return;
    const newItems = [...menuItems];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    setMenuItems(newItems);
    saveOrder(newItems);
  };

  const moveDown = (index: number) => {
    if (index === 0 || index >= menuItems.length - 1) return;
    const newItems = [...menuItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setMenuItems(newItems);
    saveOrder(newItems);
  };

  const handleMenuClick = (id: AppView) => {
    if (!isEditing) {
      setView(id);
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm md:hidden animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 z-[70] h-full transition-transform duration-300 ease-out
        md:translate-x-0 md:static md:h-[calc(100vh-4rem)] md:m-6 md:rounded-[2rem] md:block
        ${mobileOpen ? 'translate-x-0 w-[80%] max-w-xs' : '-translate-x-full w-64'}
        glass flex flex-col p-5 shadow-2xl border border-white/10 md:bg-white/5 bg-[#050811]
      `}>
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg">
              S
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tighter">Sryun AI</h1>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400">Teacher Edition</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-8 h-8 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
          {menuItems.map((item, index) => (
            <div key={item.id} className="relative group flex items-center gap-1">
              <button
                onClick={() => handleMenuClick(item.id)}
                className={`flex-1 flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  currentView === item.id || (currentView === 'unit-hub' && item.id === 'units')
                    ? 'bg-white/10 text-white font-bold ring-1 ring-white/20 shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                } ${isEditing ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-sm font-bold">{item.label}</span>
              </button>
              
              {isEditing && item.id !== 'home' && (
                <div className="flex flex-col gap-1 pr-1">
                  <button onClick={() => moveUp(index)} disabled={index === 1} className="p-1 hover:text-indigo-400 transition-colors disabled:opacity-20 text-xs">▲</button>
                  <button onClick={() => moveDown(index)} disabled={index === menuItems.length - 1} className="p-1 hover:text-indigo-400 transition-colors disabled:opacity-20 text-xs">▼</button>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-4 pt-4 border-t border-white/10">
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
              isEditing ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/30'
            }`}
          >
            {isEditing ? '✨ Xong' : '↕️ Sắp xếp'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

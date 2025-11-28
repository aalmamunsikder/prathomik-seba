
import React, { useState, useEffect } from 'react';
import { User, Role, Notification } from '../types';
import { LogOut, LayoutDashboard, School, FileText, CheckCircle, ShieldCheck, CreditCard, Menu, X, Bell, UserPlus } from 'lucide-react';
import { MockService } from '../services/mockData';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    MockService.getNotifications(user.id).then(setNotifications);
  }, [user.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (n: Notification) => {
      await MockService.markAsRead(n.id);
      setNotifications(prev => prev.map(item => item.id === n.id ? {...item, read: true} : item));
  }

  const getMenuItems = () => {
    const common = [
      { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    ];

    if (user.role === Role.SUPER_ADMIN) {
      return [
        ...common,
        { id: 'approvals', label: 'অনুমোদন (Pending)', icon: CheckCircle },
        { id: 'logs', label: 'অডিট লগ', icon: ShieldCheck },
      ];
    }

    if (user.role === Role.SCHOOL_ADMIN) {
      return [
        ...common,
        { id: 'certificates', label: 'প্রত্যয়নপত্র', icon: FileText },
        { id: 'teachers', label: 'শিক্ষক ব্যবস্থাপনা', icon: UserPlus },
        { id: 'subscription', label: 'সাবস্ক্রিপশন', icon: CreditCard },
      ];
    }

    if (user.role === Role.TEACHER) {
        return [
          ...common,
          { id: 'certificates', label: 'প্রত্যয়নপত্র', icon: FileText },
        ];
    }

    return common;
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-900 print:bg-white print:h-auto print:overflow-visible">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity print:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on Print */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-teal-900 text-teal-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto
        print:hidden
      `}>
        {/* Brand */}
        <div className="p-6 border-b border-teal-800 bg-teal-950 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <School className="w-8 h-8 text-teal-400" /> প্রাথমিক সেবা
            </h1>
            <p className="text-xs text-teal-400 mt-1 tracking-wider">গভঃ পোর্টাল বাংলাদেশ</p>
          </div>
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-teal-800 bg-teal-900/50">
          <p className="text-sm font-bold text-white truncate">{user.name}</p>
          <p className="text-xs text-teal-300 capitalize">{user.role.replace('_', ' ')}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                currentPage === item.id 
                  ? 'bg-teal-700 text-white shadow-lg border-l-4 border-teal-400' 
                  : 'hover:bg-teal-800 text-teal-100 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentPage === item.id ? 'text-teal-300' : ''}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-teal-800 bg-teal-950">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-200 hover:bg-red-900/30 hover:text-white transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>লগ আউট</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        {/* Header - Mobile & Desktop */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-10 print:hidden sticky top-0">
           <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1 rounded hover:bg-gray-100 text-gray-700">
                    <Menu size={24} />
                </button>
                <h2 className="text-lg font-bold text-gray-700 hidden md:block capitalize">{currentPage.replace('-', ' ')}</h2>
           </div>

           {/* Notifications */}
           <div className="relative">
               <button 
                onClick={() => setShowNotif(!showNotif)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative"
               >
                   <Bell size={20} />
                   {unreadCount > 0 && (
                       <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                   )}
               </button>
               
               {showNotif && (
                   <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                       <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                           <h3 className="font-bold text-sm text-gray-700">নোটিফিকেশন</h3>
                           {unreadCount > 0 && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{unreadCount} নতুন</span>}
                       </div>
                       <div className="max-h-64 overflow-y-auto">
                           {notifications.length === 0 ? (
                               <div className="p-4 text-center text-gray-400 text-sm">কোন নোটিফিকেশন নেই</div>
                           ) : (
                               notifications.map(n => (
                                   <div 
                                    key={n.id} 
                                    onClick={() => handleNotificationClick(n)}
                                    className={`p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                                   >
                                       <h4 className={`text-sm ${!n.read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{n.title}</h4>
                                       <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                                       <p className="text-[10px] text-gray-400 mt-1">{new Date(n.date).toLocaleDateString('bn-BD')}</p>
                                   </div>
                               ))
                           )}
                       </div>
                   </div>
               )}
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth print:bg-white print:overflow-visible">
          <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

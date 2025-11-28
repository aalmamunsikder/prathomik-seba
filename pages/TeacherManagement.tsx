
import React, { useState, useEffect } from 'react';
import { School, Teacher } from '../types';
import { MockService } from '../services/mockData';
import { Plus, Trash2, User, Mail, Phone, BookOpen, Search } from 'lucide-react';

interface Props {
  userSchool: School;
}

export const TeacherManagement: React.FC<Props> = ({ userSchool }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', phone: '', subject: '', designation: 'Assistant Teacher' });
  const [loading, setLoading] = useState(false);

  const fetchTeachers = async () => {
    const list = await MockService.getTeachers(userSchool.id);
    setTeachers(list);
  };

  useEffect(() => {
    fetchTeachers();
  }, [userSchool]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await MockService.addTeacher({ ...newTeacher, schoolId: userSchool.id });
    setNewTeacher({ name: '', email: '', phone: '', subject: '', designation: 'Assistant Teacher' });
    setShowAddModal(false);
    setLoading(false);
    fetchTeachers();
  };

  const handleRemove = async (id: string) => {
    if(window.confirm('আপনি কি নিশ্চিতভাবে এই শিক্ষককে মুছে ফেলতে চান?')) {
        await MockService.removeTeacher(id);
        fetchTeachers();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                 <h2 className="text-2xl font-bold text-gray-800">শিক্ষক ব্যবস্থাপনা</h2>
                 <p className="text-gray-500 text-sm">বিদ্যালয়ের সকল শিক্ষকের তালিকা ও তথ্য</p>
            </div>
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
            >
                <Plus size={20} /> নতুন শিক্ষক যোগ করুন
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Search Filter (Visual only for now) */}
            <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                 <Search size={18} className="text-gray-400" />
                 <input type="text" placeholder="নাম বা বিষয় দিয়ে খুঁজুন..." className="bg-transparent outline-none text-sm text-gray-700 w-full" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-700 font-bold border-b">
                        <tr>
                            <th className="p-4">শিক্ষকের নাম</th>
                            <th className="p-4">পদবী</th>
                            <th className="p-4">বিষয়</th>
                            <th className="p-4">যোগাযোগ</th>
                            <th className="p-4 text-center">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {teachers.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">কোন শিক্ষক পাওয়া যায়নি।</td></tr>
                        ) : (
                            teachers.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{t.name}</p>
                                                <p className="text-xs text-gray-500">{t.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-700">{t.designation}</td>
                                    <td className="p-4">
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{t.subject || 'N/A'}</span>
                                    </td>
                                    <td className="p-4 text-gray-600 text-xs space-y-1">
                                        <div className="flex items-center gap-1"><Mail size={12} /> {t.email}</div>
                                        <div className="flex items-center gap-1"><Phone size={12} /> {t.phone}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleRemove(t.id)}
                                            className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            title="মুছে ফেলুন"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in shadow-2xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">নতুন শিক্ষক নিবন্ধন</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">নাম</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input required className="w-full pl-9 p-2.5 border rounded-lg bg-white text-gray-900" 
                                    value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} placeholder="পুরো নাম" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">পদবী</label>
                            <select className="w-full p-2.5 border rounded-lg bg-white text-gray-900"
                                value={newTeacher.designation} onChange={e => setNewTeacher({...newTeacher, designation: e.target.value})}>
                                <option value="Assistant Teacher">সহকারী শিক্ষক</option>
                                <option value="Senior Teacher">সিনিয়র শিক্ষক</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">বিষয়</label>
                            <div className="relative">
                                <BookOpen size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input required className="w-full pl-9 p-2.5 border rounded-lg bg-white text-gray-900" 
                                    value={newTeacher.subject} onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})} placeholder="যেমন: বাংলা" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ইমেইল</label>
                                <input required type="email" className="w-full p-2.5 border rounded-lg bg-white text-gray-900" 
                                    value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ফোন</label>
                                <input required className="w-full p-2.5 border rounded-lg bg-white text-gray-900" 
                                    value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium">বাতিল</button>
                            <button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium">
                                {loading ? 'যোগ করা হচ্ছে...' : 'নিশ্চিত করুন'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

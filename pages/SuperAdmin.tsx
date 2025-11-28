import React, { useEffect, useState } from 'react';
import { School, SchoolStatus, AuditLog } from '../types';
import { MockService } from '../services/mockData';
import { Check, X, Search, Filter } from 'lucide-react';

export const SuperAdmin: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'approvals' | 'logs'>('approvals');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    MockService.getSchools().then(setSchools);
    MockService.getAuditLogs().then(setLogs);
  }, [refresh]);

  const handleApprove = async (schoolId: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই স্কুলটি অনুমোদন করতে চান?")) {
      await MockService.approveSchool("admin", schoolId);
      setRefresh(prev => prev + 1);
    }
  };
  
  const handleReject = async (schoolId: string) => {
      if (window.confirm("আবেদনটি বাতিল করতে চান?")) {
          // Logic for reject (mock)
          alert("আবেদন বাতিল করা হয়েছে");
          setRefresh(prev => prev + 1);
      }
  }

  const pendingSchools = schools.filter(s => s.status === SchoolStatus.PENDING);

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'approvals' ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('approvals')}
        >
          অপেক্ষমান আবেদন <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{pendingSchools.length}</span>
        </button>
        <button
          className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'logs' ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('logs')}
        >
          অডিট লগ
        </button>
      </div>

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">স্কুল ভেরিফিকেশন তালিকা</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="EIIN দিয়ে খুঁজুন..." className="pl-9 pr-4 py-2 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
            </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b">
              <tr>
                <th className="p-4">EIIN</th>
                <th className="p-4">বিদ্যালয়ের নাম</th>
                <th className="p-4">অবস্থান</th>
                <th className="p-4">প্রধান শিক্ষক</th>
                <th className="p-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingSchools.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">কোনো অপেক্ষমান আবেদন নেই।</td></tr>
              ) : (
                pendingSchools.map(school => (
                  <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-teal-600 font-bold">{school.eiin}</td>
                    <td className="p-4 font-bold text-gray-900">{school.name}</td>
                    <td className="p-4 text-gray-600 font-medium">{school.upazila}, {school.district}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{school.headMasterName}</div>
                      <div className="text-xs text-gray-500 font-mono">{school.phone}</div>
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => handleApprove(school.id)}
                        className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors border border-green-200"
                        title="অনুমোদন করুন"
                      >
                        <Check size={18} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => handleReject(school.id)}
                        className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                        title="বাতিল করুন"
                      >
                        <X size={18} strokeWidth={3} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b">
              <tr>
                <th className="p-4">সময়</th>
                <th className="p-4">ইউজার আইডি</th>
                <th className="p-4">অ্যাকশন</th>
                <th className="p-4">বিবরণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500 whitespace-nowrap font-mono text-xs">{new Date(log.timestamp).toLocaleString('bn-BD')}</td>
                  <td className="p-4 font-mono text-xs text-gray-600">{log.userId}</td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">{log.action}</span>
                  </td>
                  <td className="p-4 text-gray-800 font-medium">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
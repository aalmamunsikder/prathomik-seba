
import React, { useEffect, useState, useRef } from 'react';
import { School, SchoolStatus, AuditLog } from '../types';
import { MockService } from '../services/mockData';
import { Check, X, Search, Filter, Database, FileText, QrCode, ScanLine, Camera } from 'lucide-react';

export const SuperAdmin: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'approvals' | 'schools' | 'logs'>('approvals');
  const [refresh, setRefresh] = useState(0);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SchoolStatus | 'ALL'>('ALL');

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    MockService.getSchools().then(setSchools);
    MockService.getAuditLogs().then(setLogs);
  }, [refresh]);

  useEffect(() => {
    if (showScanner) {
        // Initialize Scanner with a delay to ensure DOM is ready
        setTimeout(() => {
            if(!(window as any).Html5QrcodeScanner) {
                console.error("Scanner library not loaded.");
                return;
            }
            
            try {
                // Check if element exists before init
                if(!document.getElementById('reader')) return;

                const scanner = new (window as any).Html5QrcodeScanner(
                    "reader", 
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );
                
                scanner.render(onScanSuccess, onScanFailure);
                scannerRef.current = scanner;
            } catch (e) {
                console.error("Scanner Init Error", e);
            }
        }, 300);
    } else {
        if(scannerRef.current) {
            try {
                scannerRef.current.clear();
            } catch(e) {
                console.warn("Scanner Clear Error", e);
            }
            scannerRef.current = null;
        }
    }
  }, [showScanner]);

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
      // Stop scanning temporarily
      if(scannerRef.current) {
          try {
            await scannerRef.current.clear();
          } catch(e) {}
          scannerRef.current = null;
      }
      
      const verification = await MockService.verifyQrCode(decodedText);
      setScanResult(verification);
  };

  const onScanFailure = (error: any) => {
      // handle scan failure, usually better to ignore and keep scanning.
      // console.warn(`Code scan error = ${error}`);
  };

  const closeScanner = () => {
      setShowScanner(false);
      setScanResult(null);
  };

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

  // Filter Logic for All Schools
  const filteredSchools = schools.filter(school => {
    const matchesSearch = 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      school.eiin.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'ALL' || school.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 mb-6 pb-2">
          <div className="flex overflow-x-auto w-full">
            <button
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'approvals' ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('approvals')}
            >
            অপেক্ষমান আবেদন <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{pendingSchools.length}</span>
            </button>
            <button
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'schools' ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('schools')}
            >
            <Database size={16} /> সকল বিদ্যালয়
            </button>
            <button
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'logs' ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('logs')}
            >
            <FileText size={16} /> অডিট লগ
            </button>
        </div>
        
        {/* QR Scanner Trigger */}
        <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all whitespace-nowrap"
        >
            <ScanLine size={18} /> QR যাচাই
        </button>
      </div>

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">স্কুল ভেরিফিকেশন তালিকা</h3>
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

      {activeTab === 'schools' && (
        <div className="space-y-4 animate-fade-in">
             {/* Search and Filter Bar */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="EIIN বা নাম দিয়ে খুঁজুন..." 
                        className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={18} className="text-gray-500" />
                    <select 
                        className="p-2.5 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none min-w-[150px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as SchoolStatus | 'ALL')}
                    >
                        <option value="ALL">সকল স্ট্যাটাস</option>
                        <option value={SchoolStatus.APPROVED}>অনুমোদিত</option>
                        <option value={SchoolStatus.PENDING}>অপেক্ষমান</option>
                        <option value={SchoolStatus.REJECTED}>বাতিল</option>
                    </select>
                </div>
            </div>

            {/* School List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-700 font-bold border-b">
                    <tr>
                        <th className="p-4">EIIN</th>
                        <th className="p-4">বিদ্যালয়ের নাম</th>
                        <th className="p-4">অবস্থান</th>
                        <th className="p-4">সাবস্ক্রিপশন</th>
                        <th className="p-4 text-center">স্ট্যাটাস</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filteredSchools.length === 0 ? (
                        <tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">কোনো বিদ্যালয় পাওয়া যায়নি।</td></tr>
                    ) : (
                        filteredSchools.map(school => (
                        <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-teal-600 font-bold">{school.eiin}</td>
                            <td className="p-4 font-bold text-gray-900">
                                {school.name}
                                <div className="text-xs font-normal text-gray-500">{school.email}</div>
                            </td>
                            <td className="p-4 text-gray-600 font-medium">{school.upazila}, {school.district}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${school.subscriptionPlan === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {school.subscriptionPlan}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                    school.status === SchoolStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-200' :
                                    school.status === SchoolStatus.PENDING ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                    {school.status}
                                </span>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
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

      {/* QR Scanner Modal */}
      {showScanner && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
                  <button onClick={closeScanner} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24} /></button>
                  
                  {!scanResult ? (
                      <div className="text-center">
                          <h3 className="text-xl font-bold mb-4 flex justify-center items-center gap-2"><Camera className="text-teal-600" /> QR স্ক্যান করুন</h3>
                          <div className="overflow-hidden rounded-lg bg-black relative">
                               <div id="reader" className="w-full min-h-[300px] bg-black"></div>
                          </div>
                          <p className="text-sm text-gray-500 mt-4">সার্টিফিকেটের QR কোডটি ক্যামেরার সামনে ধরুন</p>
                      </div>
                  ) : (
                      <div className="animate-fade-in">
                          <div className={`text-center p-4 rounded-lg mb-4 ${scanResult.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                              {scanResult.valid ? <CheckCircleIcon size={48} className="mx-auto mb-2 text-green-600" /> : <XCircleIcon size={48} className="mx-auto mb-2 text-red-600" />}
                              <h3 className="text-xl font-bold">{scanResult.message}</h3>
                          </div>
                          
                          {scanResult.valid && scanResult.details && (
                              <div className="space-y-3 text-sm border-t pt-4">
                                  <div className="grid grid-cols-2 gap-2">
                                      <span className="text-gray-500">বিদ্যালয়:</span>
                                      <span className="font-bold text-gray-900">{scanResult.details.schoolName}</span>
                                      
                                      <span className="text-gray-500">শিক্ষার্থীর নাম:</span>
                                      <span className="font-bold text-gray-900">{scanResult.details.studentName}</span>
                                      
                                      <span className="text-gray-500">পিতার নাম:</span>
                                      <span className="font-bold text-gray-900">{scanResult.details.fatherName}</span>
                                      
                                      <span className="text-gray-500">রোল:</span>
                                      <span className="font-bold text-gray-900">{scanResult.details.roll}</span>
                                      
                                      <span className="text-gray-500">ইস্যু তারিখ:</span>
                                      <span className="font-bold text-gray-900">{new Date(scanResult.details.issueDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 italic">
                                      "{scanResult.details.remarks}"
                                  </div>
                              </div>
                          )}
                          
                          <button onClick={() => setScanResult(null)} className="w-full mt-6 bg-teal-600 text-white py-2 rounded-lg font-bold">পুনরায় স্ক্যান করুন</button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

const CheckCircleIcon = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const XCircleIcon = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);

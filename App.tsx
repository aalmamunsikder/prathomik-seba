
import React, { useState, useEffect } from 'react';
import { User, Role } from './types';
import { MockService } from './services/mockData';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SuperAdmin } from './pages/SuperAdmin';
import { Register } from './pages/Register';
import { CertificateGen } from './pages/CertificateGen';
import { Subscription } from './pages/Subscription';
import { TeacherManagement } from './pages/TeacherManagement';
import { Lock, School as SchoolIcon, AlertTriangle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('dashboard');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const u = await MockService.login(email);
      if (u) {
        setUser(u);
      }
    } catch (err: any) {
      setLoginError(err.message || 'User not found. Try admin@dpe.gov.bd');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPage('dashboard');
    setEmail('');
    setLoginError('');
  };

  // Helper to fetch school data for school admin
  const [schoolData, setSchoolData] = useState<any>(undefined);
  useEffect(() => {
    if (user?.schoolId) {
       MockService.getSchools().then(schools => {
           setSchoolData(schools.find(s => s.id === user.schoolId));
       });
    }
  }, [user, page]); // Re-fetch on page change in case of updates

  // Unauthenticated View
  if (!user) {
    if (isRegistering) {
      return <Register onSuccess={() => setIsRegistering(false)} onSwitchToLogin={() => setIsRegistering(false)} />;
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
             <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SchoolIcon className="w-8 h-8 text-teal-700" />
              </div>
            <h1 className="text-3xl font-bold text-teal-800 mb-2">প্রাথমিক সেবা</h1>
            <p className="text-gray-500">সরকারি প্রাথমিক বিদ্যালয় ওয়েবপোর্টাল</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
              <input 
                type="email" 
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900"
                placeholder="আপনার ইমেইল দিন"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-lg font-bold transition-all flex justify-center items-center gap-2"
            >
                {loading ? 'লগইন হচ্ছে...' : <><Lock size={18} /> লগইন করুন</>}
            </button>
          </form>

          <div className="mt-6 text-center border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">বিদ্যালয় নিবন্ধন করা নেই?</p>
            <button onClick={() => setIsRegistering(true)} className="text-teal-600 font-bold hover:underline">
              নতুন স্কুল নিবন্ধন করুন
            </button>
          </div>
          
           <div className="mt-8 bg-blue-50 p-3 rounded text-xs text-blue-800">
            <p className="font-bold">Demo Credentials:</p>
            <p>Admin: admin@dpe.gov.bd</p>
            <p>Headmaster: headmaster@model.com</p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Layout
  return (
    <Layout user={user} onLogout={handleLogout} onNavigate={setPage} currentPage={page}>
      {page === 'dashboard' && <Dashboard user={user} />}
      
      {page === 'approvals' && user.role === Role.SUPER_ADMIN && <SuperAdmin />}
      {page === 'logs' && user.role === Role.SUPER_ADMIN && <SuperAdmin />}
      
      {page === 'certificates' && (user.role === Role.SCHOOL_ADMIN || user.role === Role.TEACHER) && (
        <CertificateGen userSchool={schoolData} />
      )}
      
      {page === 'teachers' && user.role === Role.SCHOOL_ADMIN && schoolData && (
        <TeacherManagement userSchool={schoolData} />
      )}

      {page === 'subscription' && user.role === Role.SCHOOL_ADMIN && schoolData && (
        <Subscription school={schoolData} onUpdate={() => setPage('dashboard')} />
      )}
    </Layout>
  );
}

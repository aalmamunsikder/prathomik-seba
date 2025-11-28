import React, { useEffect, useState } from 'react';
import { Role, User, School, SchoolStatus } from '../types';
import { MockService } from '../services/mockData';
import { Users, FileCheck, AlertCircle, TrendingUp, School as SchoolIcon, CheckCircle } from 'lucide-react';
import { analyzeSchoolPerformance } from '../services/geminiService';

interface DashboardProps {
  user: User;
}

// StatCard defined outside to prevent re-creation on render
const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm text-gray-500 font-bold">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
    <div className={`p-4 rounded-full ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

// Simple CSS Bar Chart Component to avoid Recharts import issues
const SimpleBarChart = ({ data }: { data: { name: string; certs: number }[] }) => {
  const max = Math.max(...data.map(d => d.certs));
  
  return (
    <div className="h-64 flex items-end justify-between gap-2 px-2 pb-6 border-b border-l border-gray-200">
      {data.map((item, idx) => {
        const heightPercent = (item.certs / max) * 100;
        return (
          <div key={idx} className="flex flex-col items-center flex-1 group">
            <div className="relative w-full flex justify-center items-end h-full">
               <div 
                className="w-full max-w-[40px] bg-teal-500 rounded-t-md hover:bg-teal-600 transition-all relative group-hover:shadow-lg"
                style={{ height: `${heightPercent}%` }}
               >
                 {/* Tooltip */}
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.certs} certificates
                 </div>
               </div>
            </div>
            <span className="text-xs font-bold text-gray-500 mt-2">{item.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [stats, setStats] = useState({ totalSchools: 0, pending: 0, certificates: 0, revenue: 0 });
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const allSchools = await MockService.getSchools();
      
      if (user.role === Role.SUPER_ADMIN) {
        setSchools(allSchools);
        setStats({
          totalSchools: allSchools.length,
          pending: allSchools.filter(s => s.status === SchoolStatus.PENDING).length,
          certificates: 1250, // Mock aggregate
          revenue: allSchools.reduce((acc, curr) => acc + (curr.subscriptionPlan !== 'FREE' ? 500 : 0), 0) // Mock logic
        });
      } else if (user.schoolId) {
        // School Admin View
        const mySchool = allSchools.find(s => s.id === user.schoolId);
        if (mySchool) {
          setSchools([mySchool]);
           setStats({
            totalSchools: 1,
            pending: 0,
            certificates: 45, // Mock local
            revenue: 0
          });
          
          // Trigger AI Insight only for school admin
          setLoadingInsight(true);
          analyzeSchoolPerformance(mySchool.name, 450, 4.2).then(text => {
             setAiInsight(text);
             setLoadingInsight(false);
          });
        }
      }
    };
    fetchData();
  }, [user]);

  const chartData = [
    { name: 'Jan', certs: 40 },
    { name: 'Feb', certs: 30 },
    { name: 'Mar', certs: 20 },
    { name: 'Apr', certs: 27 },
    { name: 'May', certs: 18 },
    { name: 'Jun', certs: 23 },
    { name: 'Jul', certs: 34 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-gray-900">
            স্বাগতম, {user.name}
            </h2>
            <p className="text-gray-500 mt-1 font-medium">{user.role === Role.SUPER_ADMIN ? 'Central Admin Dashboard' : 'School Management Dashboard'}</p>
        </div>
        <span className="bg-teal-50 text-teal-700 text-sm font-bold px-4 py-2 rounded-lg border border-teal-200 shadow-sm">
          {new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={user.role === Role.SUPER_ADMIN ? "নিবন্ধিত বিদ্যালয়" : "মোট শিক্ষার্থী"} 
          value={stats.totalSchools} 
          icon={SchoolIcon} 
          color="bg-blue-500" 
        />
        <StatCard 
          title={user.role === Role.SUPER_ADMIN ? "অপেক্ষমান আবেদন" : "ইস্যুকৃত প্রত্যয়নপত্র"} 
          value={user.role === Role.SUPER_ADMIN ? stats.pending : stats.certificates} 
          icon={user.role === Role.SUPER_ADMIN ? stats.pending > 0 ? AlertCircle : CheckCircle : FileCheck} 
          color={user.role === Role.SUPER_ADMIN ? stats.pending > 0 ? "bg-orange-500" : "bg-green-500" : "bg-green-500"} 
        />
        <StatCard 
          title="সক্রিয় ব্যবহারকারী" 
          value="৮৫" 
          icon={Users} 
          color="bg-purple-500" 
        />
        <StatCard 
          title={user.role === Role.SUPER_ADMIN ? "মোট আয় (BDT)" : "ব্যালেন্স (BDT)"} 
          value={user.role === Role.SUPER_ADMIN ? stats.revenue.toLocaleString('bn-BD') : schools[0]?.balance || 0} 
          icon={TrendingUp} 
          color="bg-emerald-600" 
        />
      </div>

      {/* AI Insight for School Admin */}
      {user.role === Role.SCHOOL_ADMIN && (
         <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Gemini AI Analysis</div>
            <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
              ✨ পারফরম্যান্স ইনসাইট
            </h3>
            {loadingInsight ? (
              <p className="text-indigo-600 animate-pulse font-medium">আপনার স্কুলের তথ্য বিশ্লেষণ করা হচ্ছে...</p>
            ) : (
              <p className="text-gray-800 leading-relaxed font-medium">
                {aiInsight || "যথেষ্ট তথ্য পাওয়া যায়নি।"}
              </p>
            )}
         </div>
      )}

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">মাসিক প্রত্যয়নপত্র ইস্যুর চিত্র</h3>
        <div className="w-full">
            <SimpleBarChart data={chartData} />
        </div>
      </div>
    </div>
  );
};
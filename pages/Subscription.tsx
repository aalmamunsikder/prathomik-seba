import React, { useState } from 'react';
import { School, SubscriptionPlan } from '../types';
import { MockService } from '../services/mockData';
import { Check, Loader, Crown, Zap } from 'lucide-react';

interface Props {
  school: School;
  onUpdate: () => void;
}

export const Subscription: React.FC<Props> = ({ school, onUpdate }) => {
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showModal, setShowModal] = useState(false);

  const plans = [
    { 
        id: SubscriptionPlan.BASIC, 
        name: 'বেসিক প্ল্যান', 
        price: 1200, 
        icon: Zap,
        color: 'bg-blue-100 text-blue-600',
        features: ['১০০ প্রত্যয়নপত্র/বছর', 'ইমেইল সাপোর্ট', 'স্ট্যান্ডার্ড টেমপ্লেট'] 
    },
    { 
        id: SubscriptionPlan.PREMIUM, 
        name: 'প্রিমিয়াম প্ল্যান', 
        price: 2500, 
        icon: Crown,
        color: 'bg-amber-100 text-amber-600',
        features: ['আনলিমিটেড প্রত্যয়নপত্র', 'AI সাপোর্ট (Gemini)', 'এসএমএস নোটিফিকেশন', 'প্রাইওরিটি সাপোর্ট', 'সব টেমপ্লেট আনলকড'] 
    },
  ];

  const handlePayment = async (method: string) => {
    if (!selectedPlan) return;
    setProcessing(true);
    // Simulate API call
    const planDetails = plans.find(p => p.id === selectedPlan);
    if(planDetails) {
        await MockService.subscribe(school.id, selectedPlan, planDetails.price);
        onUpdate();
        setShowModal(false);
        setProcessing(false);
        alert('পেমেন্ট সফল হয়েছে! আপনার প্ল্যান আপডেট করা হয়েছে।');
    }
  };

  const getLimitText = () => {
    if (school.subscriptionPlan === SubscriptionPlan.PREMIUM) return 'আনলিমিটেড';
    if (school.subscriptionPlan === SubscriptionPlan.BASIC) return '১০০ টি';
    return '১০ টি (ফ্রি)';
  };

  const getUsagePercent = () => {
     // Mock calculation
     if (school.subscriptionPlan === SubscriptionPlan.PREMIUM) return 10;
     if (school.subscriptionPlan === SubscriptionPlan.BASIC) return 45; // e.g. 45/100
     return 90; 
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">সাবস্ক্রিপশন ও বিলিং</h2>

      {/* Current Status */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
                <p className="text-teal-200 text-sm font-medium mb-1">বর্তমান প্ল্যান</p>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    {school.subscriptionPlan}
                    {school.subscriptionPlan === SubscriptionPlan.PREMIUM && <Crown className="text-amber-400 fill-amber-400" />}
                </h2>
                <p className="opacity-90 text-sm">মেয়াদ উত্তীর্ণ: {new Date(school.subscriptionExpiry).toLocaleDateString('bn-BD')}</p>
            </div>
            
            <div className="flex gap-4">
                 <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 min-w-[140px]">
                    <span className="text-2xl font-bold block">{getLimitText()}</span>
                    <p className="text-xs text-teal-200">বাৎসরিক লিমিট</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 min-w-[140px]">
                    <span className="text-2xl font-bold block">৳ {school.balance}</span>
                    <p className="text-xs text-teal-200">ওয়ালেট ব্যালেন্স</p>
                </div>
            </div>
        </div>

        {/* Usage Bar */}
        <div className="mt-8">
            <div className="flex justify-between text-xs text-teal-200 mb-2 font-medium">
                <span>সার্টিফিকেট ব্যবহার</span>
                <span>{getUsagePercent()}%</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
                <div className="bg-teal-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${getUsagePercent()}%` }}></div>
            </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mt-10">প্ল্যান আপগ্রেড করুন</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {plans.map(plan => (
            <div key={plan.id} className={`bg-white rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all relative ${school.subscriptionPlan === plan.id ? 'border-teal-500 ring-1 ring-teal-500' : 'border-gray-200'}`}>
                {school.subscriptionPlan === plan.id && (
                    <div className="absolute top-4 right-4 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Check size={12} /> বর্তমান
                    </div>
                )}
                
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${plan.color}`}>
                    <plan.icon size={24} />
                </div>

                <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-gray-900">৳{plan.price}</span>
                    <span className="text-gray-500 font-medium"> / বছর</span>
                </div>
                
                <div className="h-px bg-gray-100 mb-6"></div>

                <ul className="space-y-4 mb-8">
                    {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                            <div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={14} strokeWidth={3} /></div> {f}
                        </li>
                    ))}
                </ul>
                
                <button 
                    onClick={() => { setSelectedPlan(plan.id); setShowModal(true); }}
                    disabled={school.subscriptionPlan === plan.id}
                    className={`w-full py-3.5 rounded-xl font-bold transition-colors ${
                        school.subscriptionPlan === plan.id 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20'
                    }`}
                >
                    {school.subscriptionPlan === plan.id ? 'সক্রিয় আছে' : 'প্ল্যান কিনুন'}
                </button>
            </div>
        ))}
      </div>

      {/* Fake Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-scale-in shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-gray-900">পেমেন্ট মেথড</h3>
                     <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><Zap size={20} className="rotate-45" /></button>
                </div>
                
                {processing ? (
                    <div className="flex flex-col items-center py-12">
                        <Loader className="animate-spin text-teal-600 w-12 h-12 mb-4" />
                        <p className="font-medium text-gray-600">পেমেন্ট প্রসেস হচ্ছে...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => handlePayment('bkash')}
                            className="flex flex-col items-center justify-center p-6 border-2 border-transparent bg-gray-50 rounded-xl hover:bg-pink-50 hover:border-pink-500 transition-all group"
                        >
                            <div className="w-16 h-16 bg-[#e2136e] rounded-xl mb-3 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">bKash</div>
                            <span className="font-bold text-gray-700">বিকাশ</span>
                        </button>
                        <button 
                             onClick={() => handlePayment('nagad')}
                            className="flex flex-col items-center justify-center p-6 border-2 border-transparent bg-gray-50 rounded-xl hover:bg-orange-50 hover:border-orange-500 transition-all group"
                        >
                             <div className="w-16 h-16 bg-[#ec1d24] rounded-xl mb-3 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">Nagad</div>
                            <span className="font-bold text-gray-700">নগদ</span>
                        </button>
                    </div>
                )}
                
                <p className="text-center text-xs text-gray-400 mt-6">Secure Payment Gateway • SSL Encrypted</p>
            </div>
        </div>
      )}
    </div>
  );
};
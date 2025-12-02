
import React, { useState } from 'react';
import { DIVISIONS, MOCK_DISTRICTS, School } from '../types';
import { MockService } from '../services/mockData';
import { School as SchoolIcon, ArrowRight, Loader, Mail, CheckCircle } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<Props> = ({ onSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', eiin: '', division: '', district: '', upazila: '', 
    email: '', phone: '', headMasterName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await MockService.registerSchool(formData);
      setEmailSent(true); // Move to email verification UI
    } catch (err) {
      alert('Error registering');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateVerification = async () => {
    setVerifying(true);
    await MockService.verifyEmail(formData.email);
    setVerifying(false);
    alert('ইমেইল ভেরিফিকেশন সফল হয়েছে! এখন লগইন করতে পারবেন।');
    onSuccess(); // Back to Login
  };

  const districts = formData.division ? MOCK_DISTRICTS[formData.division] || [] : [];

  if (emailSent) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-teal-100 text-center animate-scale-in">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">ইমেইল ভেরিফিকেশন প্রয়োজন</h2>
          <p className="text-gray-600 mb-6">
            আমরা <strong>{formData.email}</strong> ঠিকানায় একটি ভেরিফিকেশন লিংক পাঠিয়েছি। আপনার অ্যাকাউন্ট চালু করতে অনুগ্রহ করে লিংকে ক্লিক করুন।
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 text-sm text-yellow-800 text-left">
            <strong>Demo Mode:</strong> যেহেতু এটি একটি ডেমো অ্যাপ, আপনি নিচের বাটনে ক্লিক করে ইমেইল ভেরিফিকেশন সম্পন্ন করতে পারেন।
          </div>

          <button 
            onClick={handleSimulateVerification} 
            disabled={verifying}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
          >
            {verifying ? <Loader className="animate-spin" /> : <><CheckCircle size={18} /> ভেরিফাই করুন (Demo)</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-teal-100">
        <div className="text-center mb-8">
          <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <SchoolIcon className="w-8 h-8 text-teal-700" />
          </div>
          <h1 className="text-2xl font-bold text-teal-900">বিদ্যালয় নিবন্ধন</h1>
          <p className="text-gray-500 text-sm mt-1">প্রাথমিক সেবা পোর্টালে যোগ দিন</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিদ্যালয়ের নাম</label>
                <input required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="উদাহরন: মডেল সরকারি প্রাথমিক বিদ্যালয়" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EIIN নম্বর</label>
                <input required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900" 
                  value={formData.eiin} onChange={e => setFormData({...formData, eiin: e.target.value})} placeholder="6 digit code" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিভাগ</label>
                  <select required className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                    value={formData.division} onChange={e => setFormData({...formData, division: e.target.value, district: ''})}>
                    <option value="">নির্বাচন করুন</option>
                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">জেলা</label>
                  <select required className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                    disabled={!formData.division}
                    value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}>
                    <option value="">নির্বাচন করুন</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">উপজেলা/থানা</label>
                <input required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900" 
                  value={formData.upazila} onChange={e => setFormData({...formData, upazila: e.target.value})} />
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mt-4">
                পরবর্তী ধাপ <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">প্রধান শিক্ষকের নাম</label>
                  <input required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900" 
                    value={formData.headMasterName} onChange={e => setFormData({...formData, headMasterName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল নম্বর</label>
                  <input required type="tel" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="017..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                  <input required type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold">
                      পেছনে
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                      {loading ? <Loader className="animate-spin" /> : 'জমা দিন'}
                    </button>
                </div>
             </div>
          )}
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          ইতিমধ্যে নিবন্ধিত? <button onClick={onSwitchToLogin} className="text-teal-700 font-bold hover:underline">লগইন করুন</button>
        </p>
      </div>
    </div>
  );
};

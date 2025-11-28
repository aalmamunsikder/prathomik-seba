
import React, { useState, useRef, useEffect } from 'react';
import { School, Student, CertificateRequest } from '../types';
import { generateStudentRemarks } from '../services/geminiService';
import { MockService } from '../services/mockData';
import { Printer, Sparkles, Send, Palette, Upload, History, FilePlus, Download, QrCode } from 'lucide-react';

interface Props {
  userSchool: School | undefined;
}

type TemplateTheme = 'classic' | 'modern' | 'ornamental';
type ViewMode = 'create' | 'history';

export const CertificateGen: React.FC<Props> = ({ userSchool }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('create');
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '', fatherName: '', motherName: '', roll: '', class: '', address: '', dob: '', gpa: 0, attendance: 0
  });
  const [remarks, setRemarks] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [traits, setTraits] = useState('মেধাবী, নিয়মিত');
  const [theme, setTheme] = useState<TemplateTheme>('classic');
  const [history, setHistory] = useState<CertificateRequest[]>([]);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(userSchool) {
        MockService.getCertificates(userSchool.id).then(setHistory);
    }
  }, [userSchool, viewMode]);

  const handleAiGenerate = async () => {
    if (!formData.name) return alert('ছাত্র/ছাত্রীর নাম দিন');
    setLoadingAi(true);
    const result = await generateStudentRemarks(
      formData.name,
      formData.gpa || 0,
      formData.attendance || 0,
      traits
    );
    setRemarks(result);
    setLoadingAi(false);
  };

  const handleSave = async () => {
      if(!userSchool) return;
      const cert: CertificateRequest = {
          id: Date.now().toString(),
          schoolId: userSchool.id,
          studentId: formData.roll || '000',
          issueDate: new Date().toISOString(),
          status: 'APPROVED',
          content: JSON.stringify(formData),
          remarks: remarks
      };
      await MockService.createCertificate(cert);
      alert('প্রত্যয়নপত্র সংরক্ষিত হয়েছে!');
      setViewMode('history');
  };

  const handleBulkUpload = async () => {
      if(!bulkFile) return alert("ফাইল নির্বাচন করুন");
      // Simulate bulk processing
      alert(`৫টি প্রত্যয়নপত্র প্রসেস করা হয়েছে! (Demo: ${bulkFile.name})`);
      setBulkFile(null);
  }

  const handlePrint = () => {
    window.print();
  };

  if (!userSchool) return <div className="text-center p-10 text-red-500 font-bold">স্কুলের তথ্য পাওয়া যায়নি। অনুগ্রহ করে লগইন করুন।</div>;

  const getThemeClasses = () => {
    switch(theme) {
        case 'modern': return "border-l-8 border-teal-600";
        case 'ornamental': return "border-8 border-double border-teal-800";
        default: return "border-4 border-teal-800";
    }
  };

  // Generate QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFY-${userSchool.eiin}-${formData.roll || '000'}`;

  return (
    <div className="space-y-6">
        {/* Top Navigation for Module */}
        <div className="flex gap-4 border-b border-gray-200 pb-2 print:hidden">
            <button 
                onClick={() => setViewMode('create')}
                className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors border-b-2 ${viewMode === 'create' ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <FilePlus size={18} /> নতুন তৈরি
            </button>
            <button 
                onClick={() => setViewMode('history')}
                className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors border-b-2 ${viewMode === 'history' ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <History size={18} /> ইতিহাস
            </button>
        </div>

        {viewMode === 'history' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in print:hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-700 font-bold border-b">
                        <tr>
                            <th className="p-4">ইস্যু তারিখ</th>
                            <th className="p-4">আইডি</th>
                            <th className="p-4">ছাত্রের রোল</th>
                            <th className="p-4">স্ট্যাটাস</th>
                            <th className="p-4 text-center">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.length === 0 ? (
                             <tr><td colSpan={5} className="p-8 text-center text-gray-500">কোন প্রত্যয়নপত্র পাওয়া যায়নি।</td></tr>
                        ) : (
                            history.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-gray-600">{new Date(c.issueDate).toLocaleDateString('bn-BD')}</td>
                                    <td className="p-4 font-mono text-xs">{c.id}</td>
                                    <td className="p-4 font-bold">{c.studentId}</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{c.status}</span></td>
                                    <td className="p-4 text-center">
                                        <button className="text-teal-600 hover:underline">ডাউনলোড</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        )}

        {viewMode === 'create' && (
            <div className="grid lg:grid-cols-12 gap-8 print:block">
            {/* Input Form Section - Hidden on Print */}
            <div className="lg:col-span-5 space-y-6 print:hidden">
                {/* Manual Form */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit space-y-5">
                    <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-xl font-bold text-gray-800">শিক্ষার্থীর তথ্য পূরণ করুন</h3>
                    <div className="flex gap-2 text-sm text-gray-500 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setTheme('classic')} className={`p-1 px-2 rounded ${theme === 'classic' ? 'bg-white shadow text-teal-700' : ''}`}><Palette size={14}/></button>
                        <button onClick={() => setTheme('modern')} className={`p-1 px-2 rounded ${theme === 'modern' ? 'bg-white shadow text-teal-700' : ''}`}>Modern</button>
                        <button onClick={() => setTheme('ornamental')} className={`p-1 px-2 rounded ${theme === 'ornamental' ? 'bg-white shadow text-teal-700' : ''}`}>Royal</button>
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">শিক্ষার্থীর নাম</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900 font-medium"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="সম্পূর্ণ নাম"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">জন্ম তারিখ</label>
                            <input 
                                type="date" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900"
                                value={formData.dob}
                                onChange={e => setFormData({...formData, dob: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">রোল নং</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900"
                                value={formData.roll}
                                onChange={e => setFormData({...formData, roll: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">পিতার নাম</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900"
                                value={formData.fatherName}
                                onChange={e => setFormData({...formData, fatherName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">মাতার নাম</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900"
                                value={formData.motherName}
                                onChange={e => setFormData({...formData, motherName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">শ্রেণি</label>
                            <select 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900"
                                value={formData.class}
                                onChange={e => setFormData({...formData, class: e.target.value})}
                            >
                                <option value="">নির্বাচন করুন</option>
                                <option value="প্রথম">প্রথম</option>
                                <option value="দ্বিতীয়">দ্বিতীয়</option>
                                <option value="তৃতীয়">তৃতীয়</option>
                                <option value="চতুর্থ">চতুর্থ</option>
                                <option value="পঞ্চম">পঞ্চম</option>
                            </select>
                        </div>
                        
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">ঠিকানা (গ্রাম/মহল্লা)</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900"
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="text-indigo-600" size={18} />
                            <h4 className="font-bold text-sm text-indigo-900">AI মন্তব্য জেনারেটর</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <input 
                                type="number" placeholder="GPA" 
                                className="p-2 border rounded text-sm bg-white text-gray-900"
                                onChange={e => setFormData({...formData, gpa: parseFloat(e.target.value)})}
                            />
                            <input 
                                type="number" placeholder="উপস্থিতি %" 
                                className="p-2 border rounded text-sm bg-white text-gray-900"
                                onChange={e => setFormData({...formData, attendance: parseFloat(e.target.value)})}
                            />
                            <input 
                                type="text" placeholder="বৈশিষ্ট্য (যেমন: শান্ত)" 
                                className="p-2 border rounded text-sm bg-white text-gray-900"
                                value={traits}
                                onChange={e => setTraits(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleAiGenerate}
                            disabled={loadingAi}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium shadow-sm"
                        >
                            {loadingAi ? 'জেনারেট হচ্ছে...' : 'স্বয়ংক্রিয় মন্তব্য লিখুন'}
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">প্রধান শিক্ষকের মন্তব্য</label>
                        <textarea 
                            className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900"
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="ম্যানুয়ালি লিখুন অথবা AI ব্যবহার করুন..."
                        />
                    </div>
                </div>
                
                {/* Bulk Upload Widget */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-4 text-teal-800">
                        <Upload size={20} />
                        <h3 className="font-bold">বাল্ক আপলোড (Excel/CSV)</h3>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                        <input 
                            type="file" 
                            accept=".csv, .xlsx" 
                            className="hidden" 
                            id="bulk-upload"
                            onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
                        />
                        <label htmlFor="bulk-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-2">
                                <Download className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">{bulkFile ? bulkFile.name : 'ফাইল নির্বাচন করুন'}</span>
                            </div>
                        </label>
                    </div>
                    {bulkFile && (
                        <button 
                            onClick={handleBulkUpload}
                            className="w-full mt-3 bg-teal-600 text-white py-2 rounded-lg font-bold text-sm"
                        >
                            আপলোড করুন
                        </button>
                    )}
                </div>
            </div>

            {/* Preview & Actions */}
            <div className="lg:col-span-7 flex flex-col space-y-4 print:w-full print:block">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 print:hidden">
                    <h4 className="font-bold text-gray-700 ml-2">প্রিভিউ মোড</h4>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 font-medium">
                            <Send size={18} /> সেভ
                        </button>
                        <button onClick={handlePrint} className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 font-medium">
                            <Printer size={18} /> প্রিন্ট
                        </button>
                    </div>
                </div>

                {/* Certificate Paper Design */}
                <div className="bg-gray-200 p-8 overflow-auto rounded-xl shadow-inner flex justify-center min-h-[600px] items-center print:p-0 print:bg-white print:shadow-none print:min-h-0 print:block">
                    <div 
                        ref={componentRef}
                        className={`bg-white w-[210mm] min-h-[297mm] p-12 relative shadow-2xl mx-auto text-black print:shadow-none print:w-full print:mx-0 ${getThemeClasses()}`}
                    >
                        {/* Ornamental Corners for 'ornamental' theme */}
                        {theme === 'ornamental' && (
                            <>
                                <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-teal-800"></div>
                                <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-teal-800"></div>
                                <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-teal-800"></div>
                                <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-teal-800"></div>
                            </>
                        )}

                        {/* Header */}
                        <div className="text-center space-y-3 mt-8">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/1200px-Government_Seal_of_Bangladesh.svg.png" alt="Govt Logo" className="h-24 mx-auto opacity-90 drop-shadow-sm" />
                            <h1 className="text-3xl font-bold text-teal-900 tracking-wide">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h1>
                            <h2 className="text-2xl font-bold text-gray-800">{userSchool.name}</h2>
                            <p className="text-gray-600 font-medium">উপজেলা: {userSchool.upazila}, জেলা: {userSchool.district}</p>
                        </div>

                        {/* Title */}
                        <div className="mt-12 mb-10 text-center">
                            <span className={`${theme === 'modern' ? 'bg-teal-600 text-white' : 'border-2 border-teal-900 text-teal-900'} px-10 py-3 text-2xl font-bold rounded-full uppercase tracking-widest shadow-sm`}>
                                প্রত্যয়নপত্র
                            </span>
                        </div>

                        {/* Body */}
                        <div className="space-y-8 text-xl leading-loose px-10 text-justify font-medium text-gray-800">
                            <p>
                                এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,
                                <span className="font-bold border-b-2 border-dotted border-gray-400 px-3 mx-1 text-black">{formData.name || '...................'}</span>,
                                পিতা: <span className="font-bold border-b-2 border-dotted border-gray-400 px-3 mx-1 text-black">{formData.fatherName || '...................'}</span>,
                                মাতা: <span className="font-bold border-b-2 border-dotted border-gray-400 px-3 mx-1 text-black">{formData.motherName || '...................'}</span>,
                                সাং: <span className="font-bold border-b-2 border-dotted border-gray-400 px-3 mx-1 text-black">{formData.address || '...................'}</span>।
                            </p>
                            <p>
                                সে এই বিদ্যালয়ের 
                                <span className="font-bold border-b-2 border-dotted border-gray-400 px-3 mx-1 text-black">{formData.class || '.....'}</span> শ্রেণির একজন নিয়মিত ছাত্র/ছাত্রী।
                                তার শ্রেণি রোল নং <span className="font-bold border-b-2 border-dotted border-gray-400 px-3 mx-1 text-black">{formData.roll || '.....'}</span>।
                                জন্ম তারিখ: <span className="font-bold border-b-2 border-dotted border-gray-400 px-3 mx-1 text-black">{formData.dob || '.....'}</span>।
                            </p>
                            
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mt-6 print:border-gray-300">
                                <p className="italic text-gray-700">
                                    মন্তব্য: "{remarks || 'উজ্জ্বল ভবিষ্যৎ কামনা করছি।'}"
                                </p>
                            </div>

                            <p className="mt-6">
                            আমি তার সার্বিক উন্নতি ও মঙ্গল কামনা করছি।
                            </p>
                        </div>

                        {/* Signature Area */}
                        <div className="mt-24 flex justify-between px-10 items-end">
                            <div className="text-center">
                                <div className="w-48 border-t-2 border-gray-800 mb-2"></div>
                                <p className="font-bold text-lg">শ্রেণি শিক্ষক</p>
                            </div>

                            {/* QR Code Verification */}
                            <div className="flex flex-col items-center gap-1 opacity-80">
                                <img src={qrCodeUrl} alt="Verification QR" className="w-24 h-24 border border-gray-200" />
                                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Scan to Verify</span>
                            </div>

                            <div className="text-center">
                                <div className="w-48 border-t-2 border-gray-800 mb-2"></div>
                                <p className="font-bold text-lg">প্রধান শিক্ষক</p>
                                <p className="text-sm font-semibold text-gray-600">{userSchool.name}</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-10 left-0 right-0 text-center text-sm text-gray-400 font-medium">
                            ইস্যুর তারিখ: {new Date().toLocaleDateString('bn-BD')} | যাচাই কোড: {Math.random().toString(36).substring(7).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        )}
    </div>
  );
};

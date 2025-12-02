
import React, { useState, useRef, useEffect } from 'react';
import { School, Student, CertificateRequest } from '../types';
import { generateStudentRemarks } from '../services/geminiService';
import { MockService } from '../services/mockData';
import { Printer, Send, Upload, History, FilePlus, RefreshCw } from 'lucide-react';

interface Props {
  userSchool: School | undefined;
}

type ViewMode = 'create' | 'history';

export const CertificateGen: React.FC<Props> = ({ userSchool }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('create');
  const [formData, setFormData] = useState<Partial<Student> & { postOffice?: string; examYear?: string; serialNo?: string; dobWords?: string }>({
    name: '', fatherName: '', motherName: '', roll: '', class: '', address: '', dob: '', gpa: 0, attendance: 0,
    postOffice: '', examYear: new Date().getFullYear().toString(), serialNo: '', dobWords: ''
  });
  const [remarks, setRemarks] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [traits, setTraits] = useState('মেধাবী, নিয়মিত');
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

  const handlePrint = () => {
    window.print();
  };

  if (!userSchool) return <div className="text-center p-10 text-red-500 font-bold">স্কুলের তথ্য পাওয়া যায়নি। অনুগ্রহ করে লগইন করুন।</div>;

  // Bengali Number Converter
  const toBn = (en: any) => ("" + en).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

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
            <div className="lg:col-span-4 space-y-6 print:hidden">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="text-lg font-bold text-gray-800">তথ্য পূরণ করুন</h3>
                        <button onClick={() => setFormData({name: 'আব্দুর রহিম', fatherName: 'করিম উদ্দিন', motherName: 'রহিমা বেগম', roll: '১০১', class: '৫ম', address: 'রূপনগর', postOffice: 'মিরপুর', examYear: '২০২৪', dob: '2014-05-15', dobWords: 'পনেরই মে দুই হাজার চৌদ্দ', serialNo: '২০২৪/১০১'})} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                             <RefreshCw size={12} /> অটো ফিল (Demo)
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                         <input type="text" placeholder="ক্রমিক নং (যেমন: ২০২৪/০০১)" className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.serialNo} onChange={e => setFormData({...formData, serialNo: e.target.value})} />
                        
                        <input type="text" placeholder="শিক্ষার্থীর নাম" className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        
                        <div className="grid grid-cols-2 gap-2">
                             <input type="text" placeholder="পিতার নাম" className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                             <input type="text" placeholder="মাতার নাম" className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                             <input type="text" placeholder="গ্রাম" className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                             <input type="text" placeholder="ডাকঘর" className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.postOffice} onChange={e => setFormData({...formData, postOffice: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <input type="text" placeholder="রোল" className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.roll} onChange={e => setFormData({...formData, roll: e.target.value})} />
                            <select className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})}>
                                <option value="">শ্রেণি</option>
                                <option value="১ম">১ম</option>
                                <option value="২য়">২য়</option>
                                <option value="৩য়">৩য়</option>
                                <option value="৪র্থ">৪র্থ</option>
                                <option value="৫ম">৫ম</option>
                            </select>
                             <input type="text" placeholder="পরীক্ষার সাল" className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.examYear} onChange={e => setFormData({...formData, examYear: e.target.value})} />
                        </div>

                        <label className="block text-xs font-bold text-gray-500 mt-2">জন্ম তারিখ</label>
                        <div className="grid grid-cols-2 gap-2">
                             <input type="date" className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                             <input type="text" placeholder="কথায় (জন্ম তারিখ)" className="w-full p-2 border rounded bg-white text-gray-900"
                                value={formData.dobWords} onChange={e => setFormData({...formData, dobWords: e.target.value})} />
                        </div>

                        {/* AI Section */}
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-2">
                            <div className="flex gap-2 mb-2">
                                <input type="number" placeholder="GPA" className="w-1/2 p-1 text-sm border rounded bg-white text-gray-900" 
                                    onChange={e => setFormData({...formData, gpa: parseFloat(e.target.value)})} />
                                <input type="text" placeholder="বৈশিষ্ট্য (যেমন: শান্ত, ভদ্র)" className="w-1/2 p-1 text-sm border rounded bg-white text-gray-900" value={traits} onChange={e => setTraits(e.target.value)} />
                            </div>
                            <button onClick={handleAiGenerate} disabled={loadingAi} className="w-full bg-indigo-600 text-white text-xs py-2 rounded font-bold">
                                {loadingAi ? 'AI লিখছে...' : 'AI মন্তব্য লিখুন'}
                            </button>
                        </div>
                         <textarea className="w-full p-2 border rounded h-20 bg-white text-gray-900 text-sm" placeholder="মন্তব্য" value={remarks} onChange={e => setRemarks(e.target.value)} />
                    </div>
                </div>

                {/* Bulk Upload Widget */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-4 text-teal-800">
                        <Upload size={20} />
                        <h3 className="font-bold">বাল্ক আপলোড (Excel)</h3>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                        <span className="text-xs text-gray-500">ফাইল ড্রপ করুন</span>
                    </div>
                </div>
            </div>

            {/* Preview Section - The Certificate Paper */}
            <div className="lg:col-span-8 print:w-full print:col-span-12">
                <div className="flex justify-end gap-3 mb-4 print:hidden">
                    <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded shadow flex items-center gap-2 font-bold text-sm">
                        <Send size={16} /> সেভ
                    </button>
                    <button onClick={handlePrint} className="bg-teal-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 font-bold text-sm">
                        <Printer size={16} /> প্রিন্ট
                    </button>
                </div>

                <div className="bg-gray-300 p-4 md:p-8 overflow-auto rounded-xl shadow-inner flex justify-center min-h-[800px] items-start print:p-0 print:bg-white print:shadow-none print:items-start print:h-auto print:min-h-0">
                    <div 
                        ref={componentRef}
                        className="bg-white w-[297mm] h-[210mm] relative shadow-2xl mx-auto text-black print:shadow-none print:w-full print:h-[210mm] print:landscape print:mx-0 p-[10mm] box-border landscape-paper overflow-hidden print-exact"
                        style={{ fontFamily: "'Hind Siliguri', serif" }}
                    >
                         {/* Watermark */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none print-exact">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/1200px-Government_Seal_of_Bangladesh.svg.png" 
                                className="w-[400px] h-[400px]" alt="Watermark" />
                         </div>

                         {/* Border */}
                         <div className="absolute inset-2 border-[5px] border-double border-teal-900 pointer-events-none rounded-sm z-10 print-exact"></div>
                         <div className="absolute inset-[8px] border border-teal-600/30 pointer-events-none rounded-sm z-10 print-exact"></div>

                         {/* Content Container - Width adjusted to be wider with less padding */}
                         <div className="relative h-full px-8 py-8 z-20">
                            
                            {/* Header Layout Grid */}
                            <div className="grid grid-cols-12 mb-2">
                                {/* Left: Serial No */}
                                <div className="col-span-3 pt-6">
                                    <div className="text-sm font-bold text-gray-800">
                                        ক্রমিক নং: <span className="font-mono text-base">{formData.serialNo ? toBn(formData.serialNo) : '................'}</span>
                                    </div>
                                </div>

                                {/* Center: Govt Logo & Text */}
                                <div className="col-span-6 text-center">
                                    <div className="flex justify-center mb-1">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/1200px-Government_Seal_of_Bangladesh.svg.png" 
                                            alt="Govt Logo" className="h-16 w-16 print-exact" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-teal-900 leading-tight print-exact">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h3>
                                    <h4 className="text-base font-bold leading-tight mt-1 text-gray-800">প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়</h4>
                                    <h4 className="text-base font-bold leading-tight text-gray-800">প্রাথমিক শিক্ষা অধিদপ্তর</h4>
                                </div>

                                {/* Right: Grading Table */}
                                <div className="col-span-3 flex justify-end pt-2">
                                    <div className="border border-green-800 text-[10px] w-48 text-center bg-white print-exact">
                                        <div className="grid grid-cols-2 font-bold border-b border-green-800 bg-green-100 print-exact">
                                            <div className="border-r border-green-800 p-1">শতকরা নম্বর</div>
                                            <div className="p-1">শিখনের অর্জিত মাত্রা</div>
                                        </div>
                                        {[
                                            { range: '৮০%-১০০%', grade: 'অতি উত্তম' },
                                            { range: '৬৫%-৭৯%', grade: 'উত্তম' },
                                            { range: '৪০%-৬৪%', grade: 'সন্তোষজনক' },
                                            { range: '০%-৩৯%', grade: 'অগ্রগতি প্রয়োজন' }
                                        ].map((row, i) => (
                                            <div key={i} className="grid grid-cols-2 border-b border-green-800 last:border-b-0">
                                                <div className="border-r border-green-800 p-0.5 font-mono">{row.range}</div>
                                                <div className="p-0.5">{row.grade}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* School Name Section */}
                            <div className="text-center mt-2 border-b-2 border-double border-gray-300 pb-4 mx-8">
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-wide">{userSchool.name}</h1>
                                <p className="text-gray-700 font-medium text-lg">
                                    উপজেলাঃ {userSchool.upazila}, জেলাঃ {userSchool.district}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">স্থাপিতঃ ........... খ্রিঃ</p>
                            </div>

                            {/* Certificate Banner Title (Blue Arrow Shape) */}
                            <div className="flex justify-center -mt-5 mb-8">
                                <div className="bg-[#1e40af] text-white px-20 py-3 text-2xl font-bold shadow-lg relative flex items-center justify-center clip-arrow print-exact">
                                    প্রত্যয়নপত্র
                                </div>
                            </div>

                            {/* Body Text with dotted lines */}
                            <div className="text-[20px] leading-[2.6] text-justify font-medium text-gray-900 mt-4 px-2">
                                <p>
                                    এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,
                                    <span className="font-bold border-b border-dotted border-gray-800 px-4 mx-2 min-w-[220px] inline-block text-center">{formData.name}</span>
                                    পিতা: <span className="font-bold border-b border-dotted border-gray-800 px-4 mx-2 min-w-[220px] inline-block text-center">{formData.fatherName}</span>
                                    মাতা: <span className="font-bold border-b border-dotted border-gray-800 px-4 mx-2 min-w-[220px] inline-block text-center">{formData.motherName}</span>
                                    গ্রাম: <span className="font-bold border-b border-dotted border-gray-800 px-4 mx-2 min-w-[150px] inline-block text-center">{formData.address}</span>
                                    ডাকঘর: <span className="font-bold border-b border-dotted border-gray-800 px-4 mx-2 min-w-[150px] inline-block text-center">{formData.postOffice}</span>
                                    উপজেলা: <span className="font-bold border-b border-dotted border-gray-800 px-4 mx-2 min-w-[150px] inline-block text-center">{userSchool.upazila}</span>
                                    জেলা: <span className="font-bold border-b border-dotted border-gray-800 px-4 mx-2 min-w-[150px] inline-block text-center">{userSchool.district}</span> ।
                                </p>
                                <p className="mt-2">
                                    সে <span className="font-bold border-b border-dotted border-gray-800 px-2 mx-1 inline-block">{userSchool.name}</span>
                                    সরকারি প্রাথমিক বিদ্যালয়ের <span className="font-bold border-b border-dotted border-gray-800 px-2 mx-1 inline-block min-w-[60px] text-center">{toBn(formData.examYear)}</span>
                                    সনের বার্ষিক পরীক্ষায় <span className="font-bold border-b border-dotted border-gray-800 px-2 mx-1 inline-block min-w-[80px] text-center">{formData.class}</span> শ্রেণিতে 
                                    রোল নং <span className="font-bold border-b border-dotted border-gray-800 px-2 mx-1 inline-block min-w-[60px] text-center">{toBn(formData.roll)}</span>
                                    সহ অংশগ্রহণ করে কৃতিত্বের সাথে উত্তীর্ণ হয়েছে।
                                </p>
                                <p className="mt-2">
                                    জন্ম সনদ অনুযায়ী তাঁর জন্ম তারিখঃ <span className="font-bold border-b border-dotted border-gray-800 px-4 mx-2 inline-block min-w-[120px] text-center">{formData.dob ? toBn(formData.dob) : ''}</span>
                                    (কথায়: <span className="font-bold border-b border-dotted border-gray-800 px-2 mx-1 inline-block min-w-[300px]">{formData.dobWords}</span>) । 
                                </p>
                                <p className="mt-2">
                                    আমার জানা মতে সে উত্তম চরিত্রের অধিকারী। আমি তার জীবনের সার্বিক উন্নতি ও মঙ্গল কামনা করছি।
                                </p>
                            </div>

                            {/* Footer Signature */}
                            <div className="absolute bottom-20 left-16 right-16 flex justify-between items-end">
                                <div>
                                    <p className="mb-8">তারিখঃ <span className="inline-block border-b border-dotted border-black w-40 text-center font-mono">{toBn(new Date().toLocaleDateString('bn-BD'))}</span></p>
                                </div>
                                <div className="text-center">
                                    <div className="w-64 border-t border-dashed border-gray-800 mb-2"></div>
                                    <p className="font-bold text-lg">প্রধান শিক্ষক</p>
                                    <p className="text-base font-medium">{userSchool.name}</p>
                                    <p className="text-sm">{userSchool.upazila}, {userSchool.district}</p>
                                </div>
                            </div>

                         </div>
                    </div>
                </div>
                <style>{`
                    .clip-arrow {
                        clip-path: polygon(0% 0%, 100% 0%, 95% 50%, 100% 100%, 0% 100%, 5% 50%);
                        padding-left: 3rem;
                        padding-right: 3rem;
                    }
                    @media print {
                        @page { 
                            size: landscape;
                            margin: 0;
                        }
                        .print-exact {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .landscape-paper {
                            width: 100% !important;
                            height: 100vh !important;
                            box-shadow: none !important;
                            margin: 0 !important;
                            border: none !important;
                        }
                        .print-hidden {
                            display: none !important;
                        }
                    }
                `}</style>
            </div>
            </div>
        )}
    </div>
  );
};

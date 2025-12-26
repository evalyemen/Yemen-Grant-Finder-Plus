
import React, { useState, useCallback, useEffect } from 'react';
import SearchHeader from './components/SearchHeader';
import GrantReport from './components/GrantReport';
import { researchGrants } from './services/geminiService';
import { ResearchResult, Language } from './types';

// The 'AIStudio' type and 'window.aistudio' are assumed to be provided by the environment.
// Redundant declarations here caused conflicts with existing definitions.

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [results, setResults] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeyRequired, setIsKeyRequired] = useState(false);

  const isAr = lang === 'ar';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [loading, results, lang, isAr]);

  const handleOpenKeySelector = async () => {
    // @ts-ignore - aistudio is expected to be available globally in the execution context
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsKeyRequired(false);
      setError(null);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setIsKeyRequired(false);

    try {
      // @ts-ignore - aistudio is expected to be available globally in the execution context
      if (window.aistudio) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setIsKeyRequired(true);
          setLoading(false);
          return;
        }
      }

      const data = await researchGrants(query, lang);
      setResults(data);
    } catch (err: any) {
      const errorMessage = err.message || '';
      setError(errorMessage || (isAr ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.'));
      
      // If permission error or entity not found, encourage/reset key selection
      if (
        errorMessage.toLowerCase().includes('permission') || 
        errorMessage.includes('403') || 
        errorMessage.includes('Requested entity was not found')
      ) {
        setIsKeyRequired(true);
      }
    } finally {
      setLoading(false);
    }
  }, [lang, isAr]);

  if (results && !loading) {
    return <GrantReport results={results} onClose={() => setResults(null)} lang={lang} />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <SearchHeader onSearch={handleSearch} isLoading={loading} lang={lang} setLang={setLang} />

      <main className="flex-grow container mx-auto px-6 py-12 max-w-6xl">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-10 animate-in fade-in duration-700">
            <div className="relative">
              <div className="w-32 h-32 border-[8px] border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className={`w-14 h-14 text-blue-600 animate-pulse ${isAr ? 'rtl-flip' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                </svg>
              </div>
            </div>
            <div className="text-center max-w-2xl px-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
                {isAr ? 'جاري البحث في المصادر الحية' : 'Searching Live Sources'}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {isAr 
                  ? 'جاري مسح المانحين المختلفين بما في ذلك الوكالات الحكومية، والمنظمات الدولية، وتبرعات الشركات الخاصة والمؤسسات بحثاً عن أحدث الفرص المفتوحة.'
                  : 'Scanning various donors including government agencies, international organizations, and private foundations for the latest open opportunities.'}
              </p>
              <div className={`mt-10 flex items-center justify-center gap-3 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex gap-1.5 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></span>
                </div>
                <span className={`text-xs font-black uppercase tracking-widest text-slate-400 ${isAr ? 'mr-4' : 'ml-4'}`}>
                  {isAr ? 'التفكير العميق المتقدم نشط' : 'Advanced Deep Thinking Active'}
                </span>
              </div>
            </div>
          </div>
        )}

        {isKeyRequired && !loading && (
          <div className="max-w-2xl mx-auto bg-white border border-blue-100 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100/50 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">{isAr ? 'مفتاح API مطلوب للبحث' : 'API Key Required for Search'}</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              {isAr 
                ? 'استخدام أدوات البحث المتقدمة يتطلب اختيار مفتاح API صالح من مشروع مدفوع لتجنب قيود الصلاحيات.' 
                : 'Using advanced search tools requires selecting a valid API key from a paid project to avoid permission restrictions.'}
              <br />
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-600 underline font-bold mt-2 inline-block">
                {isAr ? 'عرض وثائق الفوترة' : 'View Billing Documentation'}
              </a>
            </p>
            <button 
              onClick={handleOpenKeySelector}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
            >
              {isAr ? 'اختيار مفتاح API' : 'Select API Key'}
            </button>
          </div>
        )}

        {error && !isKeyRequired && (
          <div className="max-w-2xl mx-auto bg-white border border-red-100 p-10 rounded-[2.5rem] shadow-2xl shadow-red-100/50 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">{isAr ? 'توقف محرك البحث' : 'Research Engine Stalled'}</h3>
            <p className="text-slate-600 mb-10 leading-relaxed">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              {isAr ? 'العودة للبحث' : 'Return to Search'}
            </button>
          </div>
        )}

        {!loading && !error && !isKeyRequired && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-2 group ${isAr ? 'text-right' : 'text-left'}`}>
              <div className={`w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${isAr ? 'mr-0 ml-auto' : 'ml-0 mr-auto'}`}>
                 <svg className={`w-8 h-8 ${isAr ? 'rtl-flip' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="font-black text-slate-900 text-xl mb-4 tracking-tight">{isAr ? 'ذكاء نشط' : 'Active Intelligence'}</h3>
              <p className="text-slate-500 leading-relaxed">
                {isAr ? 'بيانات مجمعة من أكثر من 50 بوابة مانحين رئيسية ووسائل التواصل الاجتماعي خصيصاً لليمن.' : 'Aggregated data from 50+ donor portals and social media specifically for Yemen.'}
              </p>
            </div>
            <div className={`bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-2 group ${isAr ? 'text-right' : 'text-left'}`}>
               <div className={`w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${isAr ? 'mr-0 ml-auto' : 'ml-0 mr-auto'}`}>
                 <svg className={`w-8 h-8 ${isAr ? 'rtl-flip' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-black text-slate-900 text-xl mb-4 tracking-tight">{isAr ? 'وصول مباشر' : 'Direct Access'}</h3>
              <p className="text-slate-500 leading-relaxed">
                {isAr ? 'يتضمن كل تقرير روابط موثقة مباشرة إلى دعوة تقديم المقترحات أو أنظمة التقديم.' : 'Every report includes verified links directly to the call for proposals or application systems.'}
              </p>
            </div>
            <div className={`bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-2 group ${isAr ? 'text-right' : 'text-left'}`}>
               <div className={`w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${isAr ? 'mr-0 ml-auto' : 'ml-0 mr-auto'}`}>
                 <svg className={`w-8 h-8 ${isAr ? 'rtl-flip' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-black text-slate-900 text-xl mb-4 tracking-tight">{isAr ? 'جاهز للاستخدام' : 'Ready to Use'}</h3>
              <p className="text-slate-500 leading-relaxed">
                {isAr ? 'مخرجات نظيفة ومنسقة مصممة لسهولة التوزيع بين الفرق التقنية.' : 'Clean, formatted outputs designed for easy distribution among technical teams.'}
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-16 px-6 mt-20 print:hidden">
        <div className="max-w-6xl mx-auto">
          <div className={`flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm ${isAr ? 'md:flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 mb-8 md:mb-0 ${isAr ? 'flex-row-reverse' : ''}`}>
               <div className="bg-slate-900 p-2.5 rounded-xl">
                 <svg className={`w-6 h-6 text-white ${isAr ? 'rtl-flip' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                </svg>
              </div>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <p className="font-black text-slate-900 text-lg tracking-tight">{isAr ? 'مستكشف المنح في اليمن' : 'Yemen Grant Finder'}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{isAr ? 'ذكاء العمل الإنساني' : 'Humanitarian Intelligence'}</p>
              </div>
            </div>
            <p className="max-w-xs text-center md:text-left font-medium leading-relaxed">
              {isAr ? 'دعم المجتمع الإنساني المحلي والدولي في اليمن ببيانات دقيقة للمانحين.' : 'Supporting the local and international humanitarian community in Yemen with high-accuracy donor data.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

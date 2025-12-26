
import React, { useState } from 'react';
import { Language } from '../types';

interface SearchHeaderProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  lang: Language;
  setLang: (l: Language) => void;
}

const translations = {
  en: {
    title: "Yemen Grant Finder",
    subtitle: "Organization Intelligence & Donor Research",
    heroTitle: "Discover Recent & Open Grants",
    heroDesc: "Identify verified funding opportunities from UN agencies, international donors, and private foundations active in Yemen.",
    quickSearch: "Quick Search: All Active Grants",
    placeholder: "Or search for a specific need...",
    tags: ['Emergency Relief', 'YHF Allocation', 'Health Funding', 'Local NGO Support'],
    defaultQuery: "All recent open grants"
  },
  ar: {
    title: "مستكشف المنح في اليمن",
    subtitle: "ذكاء المنظمات وبحوث المانحين",
    heroTitle: "اكتشف المنح الحديثة والمفتوحة",
    heroDesc: "حدد فرص التمويل الموثقة من وكالات الأمم المتحدة، والمانحين الدوليين، والمؤسسات الخاصة النشطة في اليمن.",
    quickSearch: "بحث سريع: جميع المنح النشطة",
    placeholder: "أو ابحث عن حاجة محددة...",
    tags: ['إغاثة طارئة', 'تخصيص صندوق اليمن الإنساني', 'تمويل الصحة', 'دعم المنظمات المحلية'],
    defaultQuery: "جميع المنح الحديثة والمفتوحة والمتاحة"
  }
};

const SearchHeader: React.FC<SearchHeaderProps> = ({ onSearch, isLoading, lang, setLang }) => {
  const [query, setQuery] = useState('');
  const t = translations[lang];
  const isAr = lang === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim() || t.defaultQuery);
  };

  return (
    <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-14 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 -mt-20 -ml-20 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-80 h-80 bg-indigo-400 rounded-full opacity-10 blur-3xl"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Language Switcher */}
        <div className={`flex justify-end mb-8 ${isAr ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20 inline-flex">
            <button 
              onClick={() => setLang('en')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/5'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLang('ar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === 'ar' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/5'}`}
            >
              العربية
            </button>
          </div>
        </div>

        <div className={`flex items-center gap-4 mb-8 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
             <svg className={`w-10 h-10 text-white ${isAr ? 'rtl-flip' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className={isAr ? 'text-right' : 'text-left'}>
            <h1 className="text-4xl font-extrabold tracking-tight">{t.title}</h1>
            <p className="text-blue-200 font-medium">{t.subtitle}</p>
          </div>
        </div>

        <div className={isAr ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-bold mb-4">{t.heroTitle}</h2>
          <p className="text-blue-100/80 text-lg leading-relaxed max-w-2xl mb-8">
            {t.heroDesc}
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
            <button
              onClick={() => onSearch(t.defaultQuery)}
              disabled={isLoading}
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className={`w-6 h-6 ${isAr ? 'rtl-flip' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {t.quickSearch}
            </button>
            
            <div className="flex-grow relative">
               <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  dir={isAr ? 'rtl' : 'ltr'}
                  className={`w-full bg-white/10 backdrop-blur-md text-white placeholder:text-blue-200/50 py-4 ${isAr ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} rounded-2xl border border-white/20 focus:ring-4 focus:ring-blue-500/30 outline-none transition-all text-lg`}
                  placeholder={t.placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isLoading}
                />
                <div className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-200/50`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className={`mt-8 flex flex-wrap gap-2 ${isAr ? 'justify-start flex-row-reverse' : 'justify-start'}`}>
          {t.tags.map(tag => (
            <button 
              key={tag}
              onClick={() => onSearch(tag)}
              className="text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-full transition-colors uppercase tracking-wider"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;

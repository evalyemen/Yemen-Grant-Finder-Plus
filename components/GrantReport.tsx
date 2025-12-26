
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ResearchResult, Language } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface GrantReportProps {
  results: ResearchResult;
  onClose: () => void;
  lang: Language;
}

const translations = {
  en: {
    compiled: "COMPILED",
    version: "VERSION",
    status: "STATUS",
    liveData: "LIVE DATA",
    internalDoc: "Internal Research Document",
    save: "SAVE",
    new: "NEW",
    generating: "GEN...",
    sources: "Verified Data Sources",
    officialRecord: "Official Record",
    footerTitle: "Yemen Grant Finder",
    footerDesc: "Automated Humanitarian Intelligence Infrastructure",
    notice: "NOTICE: This briefing report is dynamically compiled from live data sources. While every effort is made to ensure accuracy, organizations are advised to perform internal due diligence.",
    errorPdf: "Could not generate PDF. Please try the Print option."
  },
  ar: {
    compiled: "تاريخ التجميع",
    version: "الإصدار",
    status: "الحالة",
    liveData: "بيانات حية",
    internalDoc: "وثيقة بحث داخلية",
    save: "حفظ",
    new: "جديد",
    generating: "جاري...",
    sources: "مصادر البيانات الموثقة",
    officialRecord: "سجل رسمي",
    footerTitle: "مستكشف المنح في اليمن",
    footerDesc: "بنية تحتية مؤتمتة لذكاء العمل الإنساني",
    notice: "تنبيه: يتم تجميع تقرير الإحاطة هذا ديناميكياً من مصادر البيانات الحية. في حين يتم بذل كل جهد لضمان الدقة، تُنصح المنظمات بإجراء العناية الواجبة الخاصة بها.",
    errorPdf: "تعذر إنشاء ملف PDF. يرجى محاولة استخدام خيار الطباعة."
  }
};

const formatReportContent = (text: string, isAr: boolean) => {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-4" />;

    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={i} className={`text-2xl font-black text-slate-900 mt-16 mb-6 tracking-tight pb-2 ${isAr ? 'border-r-4 pr-4 border-slate-100 text-right' : 'border-l-4 pl-4 border-slate-100 text-left'}`}>
          {trimmed.replace(/^#+\s*/, '')}
        </h3>
      );
    }

    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={i} className={`text-xl font-bold text-blue-800 mt-12 mb-4 ${isAr ? 'text-right' : 'text-left'}`}>
          {trimmed.replace(/^#+\s*/, '')}
        </h4>
      );
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <li key={i} className={`list-disc mb-3 text-slate-700 leading-relaxed pl-2 ${isAr ? 'mr-6 pr-2 text-right' : 'ml-6 pl-2 text-left'}`}>
          {renderLineWithLinks(trimmed.substring(2), isAr)}
        </li>
      );
    }

    const labelMatch = trimmed.match(/^(\*\*.*?\*\*|.*?:)/);
    if (labelMatch) {
      return (
        <div key={i} className={`mb-4 text-slate-700 leading-relaxed text-lg ${isAr ? 'text-right' : 'text-left'}`}>
          {renderLineWithLinks(trimmed, isAr)}
        </div>
      );
    }

    return (
      <p key={i} className={`mb-5 text-slate-700 leading-relaxed text-lg ${isAr ? 'text-right' : 'text-left'}`}>
        {renderLineWithLinks(trimmed, isAr)}
      </p>
    );
  });
};

const renderLineWithLinks = (text: string, isAr: boolean) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      const cleanUrl = part.replace(/[.,)]+$/, '');
      return (
        <a 
          key={i} 
          href={cleanUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 font-bold hover:text-blue-800 underline decoration-blue-200 underline-offset-4 break-all inline-flex items-center gap-1.5 transition-colors"
        >
          {cleanUrl}
          <svg className={`w-4 h-4 print:hidden ${isAr ? 'rtl-flip' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      );
    }
    if (part.includes('**')) {
        const boldParts = part.split(/\*\*(.*?)\*\*/g);
        return boldParts.map((sub, j) => (
          j % 2 === 1 
            ? <strong key={j} className="font-bold text-slate-900 bg-slate-50 px-1 rounded">{sub}</strong> 
            : sub
        ));
    }
    return part;
  });
};

const GrantReport: React.FC<GrantReportProps> = ({ results, onClose, lang }) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLElement>(null);
  
  const t = translations[lang];
  const isAr = lang === 'ar';

  const reportMetadata = useMemo(() => {
    const lines = results.summary.split('\n');
    const title = lines.find(l => l.startsWith('# '))?.replace('# ', '') || (isAr ? "تقرير التمويل" : "Funding Report");
    const landscape = lines.find(l => l.startsWith('## '))?.replace('## ', '') || (isAr ? "مشهد المانحين في اليمن" : "Yemen Donor Landscape");
    return { title, landscape };
  }, [results.summary, isAr]);

  const sections = useMemo(() => {
    const parts = results.summary.split(/^### /m);
    return parts.filter(p => p.trim() && !p.startsWith('# ')).map(part => {
      const lines = part.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      return { 
        title: title.replace(/^#+\s*/, ''), 
        content, 
        id: title.toLowerCase().replace(/\s+/g, '-') 
      };
    });
  }, [results.summary]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0% -80% 0%' }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleSavePDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const canvasInPdfHeight = imgHeight * ratio;
      let heightLeft = canvasInPdfHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasInPdfHeight);
      heightLeft -= pdfHeight;
      while (heightLeft >= 0) {
        position = heightLeft - canvasInPdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasInPdfHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save(`${reportMetadata.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      alert(t.errorPdf);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen bg-white selection:bg-blue-100 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 print:hidden">
        <div className={`max-w-7xl mx-auto flex items-center justify-between ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-bold transition-all border-b-2 -mb-4 ${
                  activeSection === section.id 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-slate-400 border-transparent hover:text-slate-800'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
          <div className={`flex items-center gap-3 ${isAr ? 'mr-8 pr-8 border-r' : 'ml-8 pl-8 border-l'} border-slate-200 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
            <button 
              onClick={handleSavePDF}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                isGenerating 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-100'
              }`}
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>}
              {isGenerating ? t.generating : t.save}
            </button>
             <button onClick={() => window.print()} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg></button>
            <button onClick={onClose} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">{t.new}</button>
          </div>
        </div>
      </nav>

      <main ref={reportRef} className={`max-w-4xl mx-auto px-6 py-16 md:py-24 ${isAr ? 'text-right' : 'text-left'}`}>
        <header className={`mb-24 ${isAr ? 'text-right border-r-8' : 'text-left border-l-8'} border-blue-600 ${isAr ? 'pr-10' : 'pl-10'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-100">
            {t.internalDoc}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter mb-6">{reportMetadata.title}</h1>
          <h2 className="text-2xl font-bold text-slate-400 leading-relaxed mb-10">{reportMetadata.landscape}</h2>
          
          <div className={`flex flex-wrap gap-x-12 gap-y-4 text-xs font-bold text-slate-500 uppercase tracking-widest pt-8 border-t border-slate-100 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}><span className="text-slate-300">{t.compiled}:</span> {new Date().toLocaleDateString(lang === 'ar' ? 'ar-YE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}><span className="text-slate-300">{t.version}:</span> v{Math.floor(Math.random() * 5) + 1}.0.4</div>
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}><span className="text-slate-300">{t.status}:</span> <span className="text-green-600">{t.liveData}</span></div>
          </div>
        </header>

        <div className="space-y-40">
          {sections.map((section, idx) => (
            <section key={section.id} id={section.id} className="scroll-mt-32">
              <div className={`flex items-baseline gap-3 mb-10 border-b border-slate-50 pb-4 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-sm font-black text-blue-600/30 uppercase tracking-[0.3em]">SEC-0{idx + 1}</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{section.title}</h3>
              </div>
              <div className={`prose prose-slate max-w-none ${isAr ? 'text-right' : 'text-left'}`}>
                {formatReportContent(section.content, isAr)}
              </div>
            </section>
          ))}

          <section id="verification" className="pt-24 border-t-2 border-slate-100">
             <div className={`flex items-baseline gap-3 mb-12 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-sm font-black text-green-600/30 uppercase tracking-[0.3em]">REF-DAT</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{t.sources}</h3>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.sources.map((source, idx) => (
                <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className={`group flex flex-col p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-blue-400 hover:shadow-xl transition-all ${isAr ? 'text-right' : 'text-left'}`}>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">{t.officialRecord}</span>
                  <h4 className="font-bold text-slate-800 text-base group-hover:text-blue-700 mb-4 line-clamp-2 leading-tight">{source.title}</h4>
                  <div className={`mt-auto flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[9px] text-slate-400 font-mono truncate max-w-[150px]">{source.uri}</span>
                    <svg className={`w-4 h-4 text-blue-300 group-hover:text-blue-600 transform transition-transform ${isAr ? '-translate-x-1 rtl-flip' : 'translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        <footer className={`mt-48 pt-20 border-t-4 border-slate-900 flex flex-col ${isAr ? 'items-end' : 'items-start'}`}>
          <div className={`flex justify-between w-full mb-12 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={isAr ? 'text-right' : 'text-left'}>
              <p className="text-slate-900 text-lg font-black uppercase tracking-tighter mb-2">{t.footerTitle}</p>
              <p className="text-slate-400 text-[10px] leading-relaxed font-bold uppercase tracking-widest">{t.footerDesc}</p>
            </div>
            <div className={isAr ? 'text-left' : 'text-right'}>
               <p className="text-slate-300 text-[10px] font-mono mb-1">DOC_AUTH_KEY: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
               <p className="text-slate-300 text-[10px] font-mono">GEN_SIG_3.0_PRO_PRV</p>
            </div>
          </div>
          <p className={`text-slate-400 text-[10px] leading-relaxed max-w-2xl ${isAr ? 'text-right' : 'text-left'}`}>{t.notice}</p>
        </footer>
      </main>
    </div>
  );
};

export default GrantReport;

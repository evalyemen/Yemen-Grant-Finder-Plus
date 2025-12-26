
import { GoogleGenAI } from "@google/genai";
import { ResearchResult, GroundingSource, Language } from "../types";

export const researchGrants = async (query: string, lang: Language = 'ar'): Promise<ResearchResult> => {
  // Always fetch the latest key from the environment
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  // Create a new instance right before making an API call to ensure it uses the up-to-date key
  const ai = new GoogleGenAI({ apiKey });
  
  const isAr = lang === 'ar';

  const systemInstruction = `
    You are a world-class Funding Strategy Consultant and Researcher specializing in the Yemen humanitarian and development context.
    Your mission is to provide a highly structured and professional intelligence report on available grants in ${isAr ? 'Arabic' : 'English'}.

    EXTENDED SOURCE SCANNING:
    - Search 50+ major donor portals (UN, Bilateral, Multilateral).
    - Scan official news agencies (e.g., SABA News, ReliefWeb).
    - Check social media announcements (X, Facebook) from donor accounts.

    STRICT REPORT STRUCTURE (MUST BE IN ${isAr ? 'ARABIC' : 'ENGLISH'}):

    # ${isAr ? 'فرص المنح والتمويل المفتوحة للمنظمات غير الحكومية في اليمن' : 'Open Grant & Funding Opportunities for NGOs in Yemen'}
    ## ${isAr ? 'مشهد المانحين - اعتباراً من' : 'Donor Landscape - As of'} [Current Date]

    ### ${isAr ? 'مقدمة' : 'Introduction'}
    Professional summary of the current funding climate.

    ### ${isAr ? 'فرص التمويل الرئيسية' : 'Key Funding Opportunities'}
    For each major donor:
    #### [Donor Name] – [Program Name]
    **${isAr ? 'مجالات التركيز' : 'Focus Areas'}:** ...
    **${isAr ? 'الأهلية' : 'Eligibility'}:** ...
    **${isAr ? 'التقديم' : 'Application'}:** ...
    **${isAr ? 'المواعيد النهائية' : 'Deadlines'}:** ...

    ### ${isAr ? 'اعتبارات هامة للمتقدمين' : 'Important Considerations for Applicants'}
    5-7 points on Consortiums, MEAL, Security, etc.

    [Footer: "${isAr ? 'تم تجميع التقرير بناءً على...' : 'Report compiled based on...'}"]

    CRITICAL RULES:
    1. LANGUAGE: Respond ONLY in ${isAr ? 'Arabic' : 'English'}.
    2. VALID LINKS: Every section MUST contain direct URLs.
    3. ACCURACY: Do not include expired grants. Verify via Google Search.
  `;

  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-flash-preview for broader tool support and better latency/reliability
      model: 'gemini-3-flash-preview',
      contents: `Execute deep research for: ${query}. Scanning 50+ portals and official feeds. Result language: ${isAr ? 'Arabic' : 'English'}.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction,
        // Reduced thinkingBudget to avoid 500 RPC timeouts/Proxy errors
        thinkingConfig: { thinkingBudget: 10000 },
      },
    });

    const text = response.text || (isAr ? "لا يمكن إنشاء تقرير حالياً." : "Report generation failed.");
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        uri: chunk.web!.uri,
        title: chunk.web!.title || (isAr ? 'مصدر موثق' : 'Verified Source')
      }));

    return {
      summary: text,
      grants: [], 
      sources: sources
    };
  } catch (error: any) {
    console.error("Research Engine Error:", error);
    
    const errorMessage = error.message || "";

    // Handle Requested entity was not found (usually API key/project issue)
    if (errorMessage.includes('Requested entity was not found')) {
      throw new Error(isAr 
        ? "لم يتم العثور على الكيان المطلوب: يرجى التأكد من اختيار مفتاح API صالح ومرتبط بمشروع فوترة نشط." 
        : "Requested entity was not found: Please ensure you have selected a valid API key associated with an active billing project.");
    }

    // Handle Permission Denied (403) specifically as it often relates to tool access or project billing
    if (errorMessage.includes('403') || errorMessage.toLowerCase().includes('permission')) {
      throw new Error(isAr 
        ? "خطأ في التصريح (403): يرجى التأكد من اختيار مفتاح API صالح لديه صلاحيات البحث." 
        : "Permission Denied (403): Please ensure you have selected a valid API key with Search permissions.");
    }

    // Handle 500/RPC errors
    if (errorMessage.includes('500') || errorMessage.includes('Rpc failed')) {
      throw new Error(isAr 
        ? "خطأ في خادم البحث (500): طلب البحث كان ثقيلاً جداً. يرجى المحاولة مرة أخرى باستخدام استعلام أبسط." 
        : "Search Engine Error (500): The request timed out. Please try again with a simpler query.");
    }

    throw new Error(isAr ? "واجه محرك البحث خطأ غير معروف. يرجى المحاولة لاحقاً." : "Research engine encountered an unknown error. Please try again later.");
  }
};

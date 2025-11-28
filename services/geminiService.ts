import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateStudentRemarks = async (
  name: string,
  gpa: number,
  attendance: number,
  traits: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "AI Service Unavailable";

  try {
    const prompt = `
      Write a short, encouraging academic remark (2-3 sentences) in Bengali for a primary school student certificate.
      Student Name: ${name}
      GPA: ${gpa} (out of 5)
      Attendance: ${attendance}%
      Key Traits: ${traits}
      
      The tone should be formal yet inspiring, suitable for a headmaster.
      Output ONLY the Bengali text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "মন্তব্য তৈরি করা সম্ভব হয়নি।";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "স্বয়ংক্রিয় মন্তব্য জেনারেট করা যায়নি।";
  }
};

export const analyzeSchoolPerformance = async (schoolName: string, studentCount: number, avgGpa: number): Promise<string> => {
   const ai = getClient();
  if (!ai) return "AI Service Unavailable";

  try {
    const prompt = `
      Analyze the performance of ${schoolName}.
      Total Students: ${studentCount}
      Average GPA: ${avgGpa}
      
      Provide a brief 1-paragraph summary in Bengali recommending areas of improvement or praise.
    `;
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
}
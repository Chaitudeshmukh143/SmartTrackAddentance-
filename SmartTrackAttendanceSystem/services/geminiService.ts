
import { GoogleGenAI, Type } from "@google/genai";
import { AttendanceQuery, AttendanceRecord } from "../types";

// Fixed: Initialization must use process.env.API_KEY directly in the named parameter object
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeAttendanceQuery = async (query: AttendanceQuery, history: AttendanceRecord[]) => {
  try {
    const historyString = JSON.stringify(history.filter(h => h.studentId === query.studentId));
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze this student's attendance query.
        Student: ${query.studentName}
        Query Date: ${query.date}
        Student's Reason: ${query.reason}
        Recent History for this student: ${historyString}

        Please provide a professional, helpful analysis for the teacher. 
        Consider if the student's reasoning sounds plausible based on their history. 
        Keep it concise.
      `,
    });

    // Accessing .text property directly as per guidelines
    return response.text || "Unable to analyze at this time.";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "AI Analysis service unavailable.";
  }
};

export const generateAttendanceSummary = async (stats: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Generate a one-sentence encouraging summary for the classroom attendance:
        Stats: Total Students: ${stats.totalStudents}, Present Today: ${stats.todayAttendance}, Rate: ${stats.attendanceRate}%
      `,
    });
    // Accessing .text property directly as per guidelines
    return response.text;
  } catch (error) {
    return "Keep up the great work, everyone!";
  }
};

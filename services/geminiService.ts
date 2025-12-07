import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DashboardAnalysis, ChartConfig, ChatMessage, DataPoint } from '../types';
import { getSampleData } from '../utils/csvParser';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for the initial dashboard analysis
const chartSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['bar', 'line', 'area', 'scatter', 'pie'] },
    xAxisKey: { type: Type.STRING, description: "The key in the data to use for the X axis (or category for Pie)" },
    yAxisKey: { type: Type.STRING, description: "The key in the data to use for the Y axis (or value for Pie)" },
    color: { type: Type.STRING, description: "A hex color code for the chart" }
  },
  required: ['id', 'title', 'type', 'xAxisKey', 'yAxisKey']
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    datasetTitle: { type: Type.STRING, description: "A creative name for this dataset" },
    summary: { type: Type.STRING, description: "A brief executive summary of the data content" },
    charts: {
      type: Type.ARRAY,
      items: chartSchema,
      description: "A list of 4 recommended charts to visualize this data"
    }
  },
  required: ['datasetTitle', 'summary', 'charts']
};

// Define schema for Chat response (can include a new chart)
const chatResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    textResponse: { type: Type.STRING, description: "The conversational answer to the user" },
    newChart: { 
      type: Type.OBJECT, 
      properties: chartSchema.properties,
      description: "Optional. Only provide if the user explicitly asks for a visualization or if a chart would perfectly answer the question."
    }
  },
  required: ['textResponse']
};

export const analyzeDataset = async (data: DataPoint[]): Promise<DashboardAnalysis> => {
  const sample = getSampleData(data, 30);
  const columns = Object.keys(data[0] || {}).join(', ');

  const prompt = `
    You are an expert Data Analyst Agent. 
    I have a dataset with the following columns: ${columns}.
    Here is a sample of the data (first 30 rows in CSV format):
    
    ${sample}

    Please analyze this data structure.
    1. Give the dataset a title.
    2. Write a short summary of what this data likely represents.
    3. Create 4 distinct, insightful charts to visualize key trends or distributions.
       - Ensure xKey and yKey exist in the columns.
       - Choose appropriate chart types (bar for comparisons, line for trends, pie for distribution, scatter for correlation).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        systemInstruction: "You are a helpful data visualization assistant. You only output valid JSON."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DashboardAnalysis;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

export const chatWithData = async (
  history: ChatMessage[], 
  userMessage: string, 
  data: DataPoint[]
): Promise<{ text: string, chart?: ChartConfig }> => {
  
  const sample = getSampleData(data, 20);
  const columns = Object.keys(data[0] || {}).join(', ');

  // Construct chat history for context
  // We simplify history to save tokens, just keeping the last few turns if needed, 
  // but for this implementation, we'll just send the current context + user query to keep it stateless/simple for the API call structure
  // In a production app, we would pass the 'history' array mapped to Content objects.

  const prompt = `
    You are a Data Analyst Agent. 
    Context: Dataset with columns: ${columns}.
    Sample Data:
    ${sample}

    User Question: "${userMessage}"

    Answer the user's question based on the data structure (you cannot calculate exact aggregations on the full dataset, so explain *how* the data shows this or infer from the sample if obvious, or suggest a chart).
    
    If the user asks to "show", "visualize", "plot", or "graph" something, provide a 'newChart' configuration in the JSON response.
    Otherwise, just provide the 'textResponse'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: chatResponseSchema
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        text: parsed.textResponse,
        chart: parsed.newChart
      };
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Chat failed", error);
    return { text: "I'm sorry, I encountered an error analyzing your request." };
  }
};
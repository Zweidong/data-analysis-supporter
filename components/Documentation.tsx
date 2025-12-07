
import React from 'react';
import { Bot, BarChart3, MessageSquare, Code, Database, Layers } from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-fade-in">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 border-b border-slate-800 pb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Agent Documentation</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          A comprehensive guide to the DataMind Agent's capabilities, architecture, and the prompt engineering behind it.
        </p>
      </div>

      {/* Feature Breakdown */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Layers className="text-blue-500" /> Core Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" /> CSV Ingestion & Parsing
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              The agent automatically detects CSV headers and data types. It handles numeric conversion and null values, preparing raw text data for visualization libraries without manual mapping.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" /> Automated Dashboarding
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upon data load, the Gemini API analyzes the dataset structure to generate a relevant title, summary, and 4 initial charts (Bar, Line, Area, Scatter, or Pie) tailored to the specific columns found.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" /> Contextual Data Chat
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Users can converse with their data. The AI has access to a data sample and schema, allowing it to answer questions about trends, outliers, and implied meaning within the dataset.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-orange-500" /> Dynamic Chart Generation
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              During chat, if a user requests a visualization (e.g., "Show me sales vs marketing"), the Agent dynamically constructs a JSON configuration to render a new chart instantly in the chat interface.
            </p>
          </div>
        </div>
      </section>

      {/* Prompt Engineering Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot className="text-blue-500" /> System Prompts & Recreation
        </h2>
        <p className="text-slate-400">
          To replicate this agent's logic in another environment (e.g., Python script, generic chatbot), use the following prompt structures. 
          The key is ensuring the LLM outputs strictly formatted JSON that your frontend can render.
        </p>

        {/* Prompt 1: Initial Analysis */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-slate-200">1. Dashboard Generation Prompt</h3>
          <p className="text-sm text-slate-400">Used when the file is first uploaded to generate the initial dashboard.</p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 overflow-x-auto relative group">
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
{`You are an expert Data Analyst Agent. 
I have a dataset with the following columns: {{COLUMNS}}.
Here is a sample of the data (first 30 rows):

{{CSV_SAMPLE_DATA}}

Please analyze this data structure.
1. Give the dataset a title.
2. Write a short summary of what this data likely represents.
3. Create 4 distinct, insightful charts to visualize key trends.

RESPONSE FORMAT (JSON ONLY):
{
  "datasetTitle": "String",
  "summary": "String",
  "charts": [
    {
      "id": "unique_id",
      "title": "Chart Title",
      "type": "bar" | "line" | "area" | "scatter" | "pie",
      "xAxisKey": "Column Name for X",
      "yAxisKey": "Column Name for Y",
      "description": "Brief explanation"
    }
  ]
}`}
            </pre>
          </div>
        </div>

        {/* Prompt 2: Chat */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-slate-200">2. Chat & Visual Query Prompt</h3>
          <p className="text-sm text-slate-400">Used for the Q&A loop. It allows the AI to decide whether to reply with text or generate a new chart.</p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 overflow-x-auto">
             <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
{`You are a Data Analyst Agent. 
Context: Dataset with columns: {{COLUMNS}}.
Sample Data:
{{CSV_SAMPLE_DATA}}

User Question: "{{USER_MESSAGE}}"

Answer the user's question based on the data structure.
If the user asks to "show", "visualize", "plot", or "graph" something, provide a 'newChart' object.
Otherwise, just provide the 'textResponse'.

RESPONSE FORMAT (JSON ONLY):
{
  "textResponse": "Your conversational answer here...",
  "newChart": { 
     "title": "Chart Title",
     "type": "bar" | "line" | "pie"...,
     "xAxisKey": "Column Name",
     "yAxisKey": "Column Name"
  } // Optional, only include if visualization is requested
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="space-y-6">
         <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Code className="text-blue-500" /> Technical Implementation
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <ul className="space-y-3 text-slate-300 text-sm">
             <li className="flex items-start gap-3">
               <span className="font-bold text-white min-w-[100px]">LLM:</span>
               Google Gemini 2.5 Flash (via @google/genai SDK) for high-speed analysis and structured JSON output.
             </li>
             <li className="flex items-start gap-3">
               <span className="font-bold text-white min-w-[100px]">Frontend:</span>
               React 19 + TypeScript + Tailwind CSS.
             </li>
             <li className="flex items-start gap-3">
               <span className="font-bold text-white min-w-[100px]">Charts:</span>
               Recharts library for rendering the JSON configuration provided by the LLM.
             </li>
             <li className="flex items-start gap-3">
               <span className="font-bold text-white min-w-[100px]">State:</span>
               Local React state (no external store needed for this scope).
             </li>
           </ul>
        </div>
      </section>

    </div>
  );
};

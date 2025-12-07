
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, BarChart3, AlertCircle, PlayCircle, Plus, BookOpen } from 'lucide-react';
import { parseCSV } from './utils/csvParser';
import { analyzeDataset, chatWithData } from './services/geminiService';
import { DataPoint, AppState, DashboardAnalysis, ChatMessage, ChartConfig } from './types';
import { DynamicChart } from './components/DynamicChart';
import { ChatPanel } from './components/ChatPanel';
import { ChartBuilderModal } from './components/ChartBuilderModal';
import { Documentation } from './components/Documentation';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [data, setData] = useState<DataPoint[]>([]);
  const [analysis, setAnalysis] = useState<DashboardAnalysis | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', content: 'Hello! Upload a CSV file and I will analyze it for you.' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Chart Builder State
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  // Keep track of previous state to return from docs
  const [previousState, setPreviousState] = useState<AppState>(AppState.UPLOAD);

  // Reusable function to process CSV content string
  const processCSVContent = async (csvText: string) => {
    setAppState(AppState.ANALYZING);
    setIsProcessing(true);
    setError(null);

    try {
        const parsedData = parseCSV(csvText);
        
        if (parsedData.length === 0) {
            throw new Error("Could not parse data or empty file.");
        }

        setData(parsedData);
        
        // Initial Gemini Analysis
        const result = await analyzeDataset(parsedData);
        setAnalysis(result);
        setAppState(AppState.DASHBOARD);
        setMessages(prev => [
            ...prev,
            { id: 'analysis-done', role: 'model', content: `I've analyzed your data! Here is a dashboard summarizing "${result.datasetTitle}". You can ask me questions about specific trends.` }
        ]);

    } catch (err) {
        console.error(err);
        setError("Failed to process data. Please ensure it is valid.");
        setAppState(AppState.UPLOAD);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      await processCSVContent(text);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    // Generate random synthetic data for testing
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let csv = "Month,Revenue,Expenses,Profit,New_Customers,Customer_Satisfaction,Marketing_Spend\n";
    
    // Create a trend where revenue grows but fluctuates
    let baseRevenue = 20000;
    
    months.forEach((m, i) => {
        // Randomize values to create realistic variance
        const growthFactor = 1 + (i * 0.05); // 5% growth trend
        const randomVar = (Math.random() - 0.5) * 0.2; // +/- 10% variance
        
        const rev = Math.floor(baseRevenue * growthFactor * (1 + randomVar));
        const exp = Math.floor(rev * 0.65); // Expenses are roughly 65% of revenue
        const profit = rev - exp;
        const cust = Math.floor((rev / 200) + (Math.random() * 20));
        const sat = (7.5 + Math.random() * 2.0).toFixed(1); // Score between 7.5 and 9.5
        const mkt = Math.floor(rev * 0.15); // Marketing is 15% of revenue

        csv += `${m},${rev},${exp},${profit},${cust},${sat},${mkt}\n`;
    });

    processCSVContent(csv);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await chatWithData(messages, text, data);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        relatedChart: response.chart
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // If AI suggests a new chart, add it to the dashboard view temporarily or permanent
      if (response.chart && analysis) {
        setAnalysis({
            ...analysis,
            charts: [response.chart, ...analysis.charts]
        });
      }

    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: "Sorry, I had trouble connecting to the brain." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChartConfigUpdate = (index: number, newConfig: ChartConfig) => {
    if (!analysis) return;
    const newCharts = [...analysis.charts];
    newCharts[index] = newConfig;
    setAnalysis({ ...analysis, charts: newCharts });
  };

  const handleAddChart = (config: ChartConfig) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      charts: [...analysis.charts, config]
    });
    setIsChartModalOpen(false);
  };

  const toggleDocs = () => {
    if (appState === AppState.DOCS) {
      setAppState(previousState);
    } else {
      setPreviousState(appState);
      setAppState(AppState.DOCS);
    }
  };

  const goHome = () => {
    if (appState === AppState.DOCS) {
       setAppState(previousState === AppState.DOCS ? AppState.UPLOAD : previousState);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center px-6 bg-slate-900/80 backdrop-blur justify-between shrink-0">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={goHome}
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">DataMind Agent</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
               onClick={toggleDocs}
               className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                 appState === AppState.DOCS 
                   ? 'text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg' 
                   : 'text-slate-400 hover:text-white'
               }`}
            >
               <BookOpen className="w-4 h-4" />
               {appState === AppState.DOCS ? 'Close Docs' : 'Documentation'}
            </button>

            {appState === AppState.DASHBOARD && (
               <button 
                  onClick={() => {
                      setAppState(AppState.UPLOAD);
                      setData([]);
                      setAnalysis(null);
                      setMessages([{ id: 'welcome', role: 'model', content: 'Hello! Upload a CSV file and I will analyze it for you.' }]);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
               >
                  Upload New File
               </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-grow overflow-y-auto p-6 scroll-smooth">
          
          {appState === AppState.DOCS && (
             <Documentation />
          )}
          
          {appState === AppState.UPLOAD && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                        <Upload className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Upload Data</h2>
                    <p className="text-slate-400 mb-8">Upload a CSV file to generate an instant AI dashboard and chat with your data.</p>
                    
                    <label className="relative group cursor-pointer w-full mb-4">
                        <div className="w-full h-32 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500/5 transition-all">
                            <FileSpreadsheet className="w-8 h-8 text-slate-500 group-hover:text-blue-400 mb-2 transition-colors" />
                            <span className="text-sm text-slate-400 group-hover:text-blue-300">Click to browse or drop CSV</span>
                        </div>
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    </label>

                    <div className="w-full flex items-center gap-4 my-2">
                        <div className="h-px bg-slate-800 flex-grow"></div>
                        <span className="text-slate-600 text-xs uppercase font-medium">Or</span>
                        <div className="h-px bg-slate-800 flex-grow"></div>
                    </div>

                    <button 
                        onClick={handleLoadSample}
                        className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <PlayCircle className="w-4 h-4 text-emerald-500" />
                        Load Sample Data (Test Mode)
                    </button>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-2 rounded w-full justify-center">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                </div>
            </div>
          )}

          {appState === AppState.ANALYZING && (
              <div className="h-full flex flex-col items-center justify-center animate-pulse">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h2 className="text-xl font-medium text-white">Analyzing Data Structure...</h2>
                  <p className="text-slate-400 mt-2">Our agent is reviewing columns and generating charts.</p>
              </div>
          )}

          {appState === AppState.DASHBOARD && analysis && (
            <div className="space-y-8 animate-fade-in-up pb-20">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">{analysis.datasetTitle}</h2>
                    <p className="text-slate-400 max-w-3xl leading-relaxed">{analysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analysis.charts.map((chart, index) => (
                        <DynamicChart 
                            key={`${chart.id}-${index}`} 
                            config={chart} 
                            data={data}
                            onConfigChange={(newConfig) => handleChartConfigUpdate(index, newConfig)}
                        />
                    ))}
                    
                    {/* Add Chart Button */}
                    <button 
                        onClick={() => setIsChartModalOpen(true)}
                        className="flex flex-col items-center justify-center h-[450px] bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                            <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                        </div>
                        <span className="text-slate-400 font-medium group-hover:text-blue-300">Add New Chart</span>
                    </button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                    Generated by DataMind Agent &bull; Powered by Gemini 2.5 Flash
                </div>
            </div>
          )}
        </main>
      </div>

      {/* Chat Sidebar - Only visible in Dashboard Mode */}
      {appState === AppState.DASHBOARD && (
          <div className="w-full md:w-[400px] border-l border-slate-800 h-[50vh] md:h-screen shrink-0 relative z-20">
             <ChatPanel 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isProcessing={isProcessing} 
             />
          </div>
      )}

      {/* Chart Builder Modal */}
      <ChartBuilderModal 
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        onSave={handleAddChart}
        columns={data.length > 0 ? Object.keys(data[0]) : []}
      />

    </div>
  );
}

export default App;

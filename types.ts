
export interface DataPoint {
  [key: string]: string | number | null;
}

export type ChartType = 'bar' | 'line' | 'area' | 'scatter' | 'pie';

export interface ChartConfig {
  id: string;
  title: string;
  description: string;
  type: ChartType;
  xAxisKey: string;
  yAxisKey: string; // For pie charts, this is the value key
  seriesKey?: string; // For grouping/coloring
  color?: string;
}

export interface DashboardAnalysis {
  datasetTitle: string;
  summary: string;
  charts: ChartConfig[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  relatedChart?: ChartConfig; // If the model generates a chart in response
  isThinking?: boolean;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  DASHBOARD = 'DASHBOARD',
  DOCS = 'DOCS',
}

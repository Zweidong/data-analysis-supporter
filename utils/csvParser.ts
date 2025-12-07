import { DataPoint } from '../types';

export const parseCSV = (content: string): DataPoint[] => {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: DataPoint[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle simple CSV splitting, accounting for potential quotes would require regex but keeping it simple for stability
    // For a production app, use a library like papaparse.
    // This is a robust-enough simple splitter that handles basic commas.
    const currentLine = lines[i].split(','); 

    if (currentLine.length === headers.length) {
      const row: DataPoint = {};
      let hasValue = false;
      
      headers.forEach((header, index) => {
        let value: string | number | null = currentLine[index]?.trim().replace(/^"|"$/g, '');
        
        // Attempt to convert to number if possible
        if (value !== undefined && value !== '' && !isNaN(Number(value))) {
          value = Number(value);
        }
        
        if (value === '') value = null;
        if (value !== null) hasValue = true;

        row[header] = value;
      });

      if (hasValue) {
        data.push(row);
      }
    }
  }

  return data;
};

export const getSampleData = (data: DataPoint[], limit: number = 20): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.slice(0, limit).map(row => headers.map(h => row[h]).join(','));
  
  return [headers.join(','), ...rows].join('\n');
};
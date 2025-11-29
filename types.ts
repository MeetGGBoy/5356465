export interface FileNode {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: number;
  description?: string;
  tags?: string[];
  isAnalyzing?: boolean;
}

export enum ViewMode {
  GRID = 'GRID',
  LIST = 'LIST'
}

export interface AnalysisResult {
  description: string;
  tags: string[];
}

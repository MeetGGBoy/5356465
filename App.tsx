import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileNode, ViewMode } from './types.ts';
import FileCard from './components/FileCard.tsx';
import { analyzeFileMetadata } from './services/geminiService.ts';
import { 
  LayoutGrid, 
  List, 
  Search, 
  UploadCloud, 
  Server, 
  Wifi, 
  Plus,
  X,
  FolderOpen
} from 'lucide-react';

// Mock Initial Data
const INITIAL_FILES: FileNode[] = [
  {
    id: '1',
    name: '项目需求说明书_v2.pdf',
    size: 2450000,
    type: 'application/pdf',
    uploadDate: Date.now() - 10000000,
    description: '2025年Q1核心项目业务需求详述，包含UI规范。',
    tags: ['需求', '文档', 'Q1']
  },
  {
    id: '2',
    name: '首页设计稿_Final.png',
    size: 5600000,
    type: 'image/png',
    uploadDate: Date.now() - 5000000,
  },
  {
    id: '3',
    name: 'demo_video_preview.mp4',
    size: 45000000,
    type: 'video/mp4',
    uploadDate: Date.now() - 2000000,
  },
  {
    id: '4',
    name: 'utils.js',
    size: 1200,
    type: 'application/javascript',
    uploadDate: Date.now() - 3600000 * 24,
  }
];

const App: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter files based on search
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const newFiles: FileNode[] = Array.from(uploadedFiles).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadDate: Date.now(),
      }));
      setFiles(prev => [...newFiles, ...prev]);
      
      // Auto-analyze after upload (optional, but requested feature is manual button, let's trigger it automatically for fun? No, manual is better for quota saving).
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个文件吗？')) {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleRenameClick = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      setEditingFileId(id);
      setNewFileName(file.name);
      setIsRenameModalOpen(true);
    }
  };

  const confirmRename = () => {
    if (editingFileId && newFileName.trim()) {
      setFiles(prev => prev.map(f => 
        f.id === editingFileId ? { ...f, name: newFileName.trim() } : f
      ));
      setIsRenameModalOpen(false);
      setEditingFileId(null);
    }
  };

  const handleAnalyze = async (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    // Set Loading State
    setFiles(prev => prev.map(f => f.id === id ? { ...f, isAnalyzing: true } : f));

    // Call API
    const result = await analyzeFileMetadata(file.name, file.type, (file.size / 1024).toFixed(2) + 'KB');

    // Update with Result
    setFiles(prev => prev.map(f => 
      f.id === id ? { 
        ...f, 
        isAnalyzing: false, 
        description: result.description, 
        tags: result.tags 
      } : f
    ));
  };

  const handleDownload = (file: FileNode) => {
    alert(`正在开始下载: ${file.name}\n(演示模式)`);
  };

  // Drag and Drop (Simple visual effect)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // In a real app, handle dropped files here similar to file input
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles: FileNode[] = Array.from(e.dataTransfer.files).map((file: File) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            uploadDate: Date.now(),
        }));
        setFiles(prev => [...droppedFiles, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans"
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-200">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">LAN Share AI</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">局域网已连接</span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-lg mx-6 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="搜索文件、AI描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-2">
              <button 
                onClick={() => setViewMode(ViewMode.GRID)}
                className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.GRID ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.LIST)}
                className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.LIST ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>上传文件</span>
            </button>
            <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile Search */}
        <div className="md:hidden mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm"
          />
        </div>

        {/* Stats / Breadcrumbish */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
             <span className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer transition-colors"><FolderOpen className="w-4 h-4" /> 公共共享</span>
             <span>/</span>
             <span className="text-slate-900 font-medium">所有文件</span>
             <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-2">{filteredFiles.length}</span>
          </div>
        </div>

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
               <UploadCloud className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">没有找到文件</h3>
            <p className="text-slate-500 text-sm mb-6">上传新文件或尝试不同的搜索词</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 font-medium hover:text-indigo-700 text-sm"
            >
              点击上传
            </button>
          </div>
        )}

        {/* Grid / List */}
        <div className={
          viewMode === ViewMode.GRID 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        }>
          {filteredFiles.map(file => (
            <FileCard 
              key={file.id} 
              file={file} 
              viewMode={viewMode}
              onRename={handleRenameClick}
              onDelete={handleDelete}
              onAnalyze={handleAnalyze}
              onDownload={handleDownload}
            />
          ))}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center active:scale-90 transition-transform z-30"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-indigo-500/10 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-indigo-500 border-dashed m-4 rounded-3xl pointer-events-none">
           <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce">
              <UploadCloud className="w-16 h-16 text-indigo-600 mb-4" />
              <h2 className="text-xl font-bold text-slate-800">释放以上传</h2>
              <p className="text-slate-500">文件将添加到列表</p>
           </div>
        </div>
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">重命名文件</h3>
              <button onClick={() => setIsRenameModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-6 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setIsRenameModalOpen(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmRename}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-lg shadow-indigo-200"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
import React from 'react';
import { FileNode, ViewMode } from '../types.ts';
import { 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Code, 
  Archive, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Sparkles,
  Download,
  Loader2
} from 'lucide-react';

interface FileCardProps {
  file: FileNode;
  viewMode: ViewMode;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onAnalyze: (id: string) => void;
  onDownload: (file: FileNode) => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-purple-500" />;
  if (type.startsWith('video/')) return <Film className="w-8 h-8 text-red-500" />;
  if (type.startsWith('audio/')) return <Music className="w-8 h-8 text-pink-500" />;
  if (type.includes('zip') || type.includes('compressed')) return <Archive className="w-8 h-8 text-yellow-500" />;
  if (type.includes('javascript') || type.includes('html') || type.includes('css')) return <Code className="w-8 h-8 text-blue-500" />;
  return <FileText className="w-8 h-8 text-gray-500" />;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (ms: number) => {
  return new Date(ms).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const FileCard: React.FC<FileCardProps> = ({ file, viewMode, onRename, onDelete, onAnalyze, onDownload }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (viewMode === ViewMode.LIST) {
    return (
      <div className="group flex items-center p-4 bg-white hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
        <div className="mr-4 p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
          {getFileIcon(file.type)}
        </div>
        
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="text-sm font-medium text-slate-900 truncate" title={file.name}>
            {file.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{formatSize(file.size)}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-400">{formatDate(file.uploadDate)}</span>
          </div>
          {file.description && (
             <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1">
               <Sparkles className="w-3 h-3" /> {file.description}
             </p>
          )}
        </div>

        <div className="flex items-center gap-2">
           {!file.description && !file.isAnalyzing && (
             <button 
                onClick={() => onAnalyze(file.id)}
                className="hidden group-hover:flex items-center gap-1 text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
             >
               <Sparkles className="w-3 h-3" /> 分析
             </button>
           )}
           {file.isAnalyzing && (
             <span className="text-xs text-indigo-400 flex items-center gap-1 animate-pulse">
               <Loader2 className="w-3 h-3 animate-spin" /> 分析中...
             </span>
           )}

          <button 
            onClick={() => onDownload(file)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block"
            title="下载文件"
          >
            <Download className="w-4 h-4" />
          </button>
        
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-10 py-1 overflow-hidden">
                <button 
                  onClick={() => { onDownload(file); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 sm:hidden"
                >
                  <Download className="w-3 h-3" /> 下载
                </button>
                <button 
                  onClick={() => { onRename(file.id); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
                >
                  <Pencil className="w-3 h-3" /> 重命名
                </button>
                <button 
                  onClick={() => { onDelete(file.id); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> 删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 flex flex-col p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-105 transition-transform duration-200">
           {getFileIcon(file.type)}
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-10 py-1 overflow-hidden">
              <button 
                onClick={() => { onDownload(file); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
              >
                <Download className="w-3 h-3" /> 下载
              </button>
              <button 
                onClick={() => { onRename(file.id); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
              >
                <Pencil className="w-3 h-3" /> 重命名
              </button>
              <button 
                onClick={() => { onDelete(file.id); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" /> 删除
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-2">
        <h3 className="text-sm font-semibold text-slate-800 truncate mb-1" title={file.name}>
          {file.name}
        </h3>
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>{formatSize(file.size)}</span>
          <span>{formatDate(file.uploadDate)}</span>
        </div>
      </div>

      {/* AI Section */}
      <div className="mt-auto pt-3 border-t border-slate-100 min-h-[50px]">
        {file.description ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-md">
              <span className="text-indigo-500 font-medium mr-1">AI:</span>
              {file.description}
            </p>
            {file.tags && (
              <div className="flex flex-wrap gap-1">
                {file.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
             <button 
                onClick={() => onAnalyze(file.id)}
                disabled={file.isAnalyzing}
                className={`w-full text-xs py-1.5 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all
                  ${file.isAnalyzing 
                    ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'
                  }`}
             >
                {file.isAnalyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>分析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>AI 智能分析</span>
                  </>
                )}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileCard;
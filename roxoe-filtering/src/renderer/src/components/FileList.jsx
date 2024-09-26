import { FileText, X, HardDrive, Calendar } from 'lucide-react';
import { formatFileSize, formatDate } from '../services/fileUploadService';

const FileList = ({ files, onRemove }) => (
  <div className="mt-6 space-y-4">
    <h3 className="text-lg font-semibold text-gray-800">Seçilen Dosyalar</h3>
    <ul className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
      {files.map((fileObj, index) => {
        const file = fileObj.file || fileObj;
        return (
          <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-10 w-10 text-orange-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name || 'İsimsiz dosya'}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <HardDrive className="mr-1.5 h-4 w-4" />
                    <span>{formatFileSize(file.size)}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="mr-1.5 h-4 w-4" />
                    <span>{formatDate(file.lastModified)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="ml-4 bg-white rounded-full p-1 text-gray-400 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

export default React.memo(FileList);

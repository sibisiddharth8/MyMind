import { useState, useRef, DragEvent, useEffect } from 'react';
import { FiUploadCloud, FiFile, FiX, FiRefreshCcw } from 'react-icons/fi';

interface FileUploadProps {
  existingFileUrl?: string | null;
  onFileChange: (file: File | null | 'remove') => void; // Can now signal 'remove'
  label: string;
  accept: string;
  fileType: 'image' | 'pdf';
}

export default function FileUpload({ existingFileUrl, onFileChange, label, accept, fileType }: FileUploadProps) {
  const [newlySelectedFile, setNewlySelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isMarkedForRemoval, setIsMarkedForRemoval] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When the component loads, if there's an existing file, we're not in a removal state
  useEffect(() => {
    setIsMarkedForRemoval(false);
  }, [existingFileUrl]);


  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setNewlySelectedFile(selectedFile);
      onFileChange(selectedFile);
      setIsMarkedForRemoval(false); // A new file overrides the removal state
      if (selectedFile.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>, over: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(over);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files?.[0] || null);
  };

  // When "Remove" is clicked on a NEWLY selected file preview
  const handleClearNewFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNewlySelectedFile(null);
    setPreview(null);
    onFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  // When "Remove" is clicked on an EXISTING file
  const handleMarkForRemoval = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsMarkedForRemoval(true);
      onFileChange('remove');
  };

  // When "Undo" is clicked on a file marked for removal
  const handleUndoRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsMarkedForRemoval(false);
      onFileChange(null); // Reset form state
  };

  const hasExistingFile = !!existingFileUrl;
  const hasNewFile = !!newlySelectedFile;

  // Determine what content to show inside the dropzone
  const renderContent = () => {
    if (hasNewFile) { // A new file has been selected
      return (
        <div className="text-center p-4">
          {preview ? <img src={preview} alt="Preview" className="h-24 mx-auto rounded-md object-contain"/> : <FiFile className="mx-auto h-12 w-12 text-slate-400" />}
          <p className="text-sm text-slate-700 mt-2 truncate font-medium">{newlySelectedFile!.name}</p>
          <button onClick={handleClearNewFile} className="text-xs text-red-500 hover:underline mt-1">Clear selection</button>
        </div>
      );
    }
    if (isMarkedForRemoval) { // An existing file is marked for removal
        return (
            <div className="text-center p-4 text-slate-500">
                <p className="font-semibold">File will be removed on save.</p>
                <button onClick={handleUndoRemove} className="text-sm text-blue-600 hover:underline mt-2 flex items-center mx-auto">
                    <FiRefreshCcw className="mr-1"/> Undo
                </button>
            </div>
        );
    }
    if (hasExistingFile) { // An existing file is present
        return (
            <div className="text-center p-4 relative group">
                {fileType === 'image' ? <img src={existingFileUrl!} alt="Existing" className="h-24 mx-auto rounded-md object-contain"/> : <FiFile className="mx-auto h-12 w-12 text-slate-400" />}
                <p className="text-sm text-slate-500 mt-2">A file is already uploaded.</p>
                <button onClick={handleMarkForRemoval} className="absolute top-2 right-2 text-xs bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
            </div>
        );
    }
    // Default empty state
    return (
      <div className="text-center text-slate-500 cursor-pointer">
        <FiUploadCloud className="mx-auto h-10 w-10" />
        <p className="mt-2 text-sm"><span className="font-semibold text-blue-600">Click to upload</span> or drag & drop</p>
        <p className="text-xs mt-1">{accept === "image/*" ? "SVG, PNG, JPG or GIF" : "PDF up to 10MB"}</p>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-600">{label}</label>
      <div
        className={`flex items-center justify-center w-full h-52 border-2 border-dashed rounded-xl transition-all duration-300 ${isMarkedForRemoval ? 'bg-red-50 border-red-300' : isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDrop={handleDrop}
        onClick={() => !hasNewFile && !isMarkedForRemoval && fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files?.[0] || null)} accept={accept} className="hidden"/>
        {renderContent()}
      </div>
    </div>
  );
}
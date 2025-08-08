import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResumeUploadProps {
  onResumeContent: (content: string, filename?: string) => void;
}

export const ResumeUpload = ({ onResumeContent }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadToStorage = async (file: File) => {
    // Create a unique filename with timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${fileName}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Save metadata to database
    const { error: dbError } = await supabase
      .from('resumes')
      .insert({
        filename: file.name,
        file_path: filePath,
        file_size: file.size,
        content_preview: null // Will be updated after text extraction
      });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return filePath;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      let content = '';
      
      if (file.type === 'application/pdf') {
        // For PDF files
        const arrayBuffer = await file.arrayBuffer();
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
        GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        
        const pdf = await getDocument(arrayBuffer).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }
        content = fullText;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For DOCX files
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      } else if (file.type === 'text/plain') {
        // For TXT files
        content = await file.text();
      } else {
        throw new Error('Unsupported file format. Please use PDF, DOCX, or TXT files.');
      }

      // Upload file to storage
      const filePath = await uploadToStorage(file);

      // Update database record with content preview
      await supabase
        .from('resumes')
        .update({ 
          content_preview: content.substring(0, 1000) // Store first 1000 chars
        })
        .eq('file_path', filePath);

      setUploadedFile(file);
      onResumeContent(content, file.name);
      toast({
        title: "Success",
        description: `Resume "${file.name}" uploaded and saved successfully!`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleTextSubmit = () => {
    if (pastedText.trim()) {
      onResumeContent(pastedText, 'Pasted Resume');
      setUploadedFile(null);
      toast({
        title: "Success",
        description: "Resume text submitted successfully!",
      });
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPastedText('');
    onResumeContent('');
  };

  return (
    <Card className="p-6 bg-gradient-card border border-border shadow-card">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Upload Your Resume</h2>
          <p className="text-muted-foreground">
            Upload a file or paste your resume text to get started
          </p>
        </div>

        {/* File Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-smooth
            ${isDragging ? 'border-primary bg-gradient-hero' : 'border-border hover:border-primary/50'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isProcessing ? 'Processing...' : 'Drop your resume here'}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOCX, and TXT files
            </p>
            <div className="pt-4">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
              />
              <label htmlFor="file-upload">
                <Button variant="default" className="cursor-pointer" disabled={isProcessing}>
                  <FileText className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Choose File'}
                </Button>
              </label>
            </div>
          </div>
        </div>

        {/* Or Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">or</span>
          </div>
        </div>

        {/* Text Input Area */}
        <div className="space-y-4">
          <Textarea
            placeholder="Paste your resume text here..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            className="min-h-[200px] resize-none"
            disabled={!!uploadedFile}
          />
          <Button
            onClick={handleTextSubmit}
            disabled={!pastedText.trim() || !!uploadedFile}
            className="w-full"
          >
            Analyze Pasted Text
          </Button>
        </div>

        {/* Uploaded File Display */}
        {uploadedFile && (
          <div className="flex items-center justify-between p-4 bg-gradient-hero rounded-lg border border-primary/20">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearUpload}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
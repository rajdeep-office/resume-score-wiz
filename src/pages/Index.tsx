import { useState } from 'react';
import { ResumeUpload } from '@/components/ResumeUpload';
import { ResumeScoring } from '@/components/ResumeScoring';
import { Button } from '@/components/ui/button';
import { FileText, Star, TrendingUp, Zap } from 'lucide-react';
import heroImage from '@/assets/hero-resume.jpg';

const Index = () => {
  const [resumeContent, setResumeContent] = useState('');
  const [filename, setFilename] = useState<string>();

  const handleResumeContent = (content: string, file?: string) => {
    setResumeContent(content);
    setFilename(file);
  };

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Resume Analysis Dashboard"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
                <FileText className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Resume Scoring App
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Get instant feedback on your resume with our AI-powered analysis tool. 
              Improve formatting, keywords, grammar, and readability to land your dream job.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={scrollToUpload}
                className="text-lg px-8 py-6"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Analysis
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={scrollToUpload}
                className="text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center p-6 rounded-lg bg-gradient-card border border-border/50">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Scoring</h3>
                <p className="text-muted-foreground">
                  Advanced algorithms analyze formatting, keywords, and structure
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-gradient-card border border-border/50">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Feedback</h3>
                <p className="text-muted-foreground">
                  Get detailed suggestions and improvements in real-time
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-gradient-card border border-border/50">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multiple Formats</h3>
                <p className="text-muted-foreground">
                  Support for PDF, DOCX, and plain text uploads
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="upload-section" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="order-2 lg:order-1">
                <ResumeUpload onResumeContent={handleResumeContent} />
              </div>

              {/* Scoring Section */}
              <div className="order-1 lg:order-2">
                <ResumeScoring 
                  resumeContent={resumeContent} 
                  filename={filename}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-card">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2025 Resume Scoring App. Built with React and modern web technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

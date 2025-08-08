import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Target, 
  FileText, 
  Zap,
  TrendingUp
} from 'lucide-react';

interface ScoreBreakdown {
  formatting: number;
  keywords: number;
  grammar: number;
  readability: number;
}

interface ResumeAnalysis {
  overall: number;
  breakdown: ScoreBreakdown;
  suggestions: string[];
  matchedKeywords: string[];
  grammarIssues: string[];
  readabilityMetrics: {
    sentences: number;
    avgWordsPerSentence: number;
    complexWords: number;
  };
}

interface ResumeScoringProps {
  resumeContent: string;
  filename?: string;
}

export const ResumeScoring = ({ resumeContent, filename }: ResumeScoringProps) => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Common job keywords for tech/business roles
  const jobKeywords = [
    'react', 'javascript', 'typescript', 'python', 'node.js', 'aws', 'docker',
    'leadership', 'management', 'team', 'project', 'agile', 'scrum',
    'communication', 'problem-solving', 'analytical', 'strategic',
    'experience', 'skills', 'education', 'certification', 'achievement',
    'development', 'design', 'implementation', 'optimization', 'collaboration'
  ];

  const analyzeResume = (content: string): ResumeAnalysis => {
    const text = content.toLowerCase();
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    // Keyword Analysis
    const matchedKeywords = jobKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    const keywordScore = Math.min((matchedKeywords.length / jobKeywords.length) * 100, 100);

    // Grammar Analysis (basic)
    const grammarIssues: string[] = [];
    if (text.includes(' i ')) grammarIssues.push('Use of lowercase "i" instead of "I"');
    if (!/[.!?]$/.test(content.trim())) grammarIssues.push('Missing punctuation at the end');
    if (content.includes('  ')) grammarIssues.push('Multiple consecutive spaces found');
    const grammarScore = Math.max(100 - (grammarIssues.length * 15), 0);

    // Readability Analysis
    const avgWordsPerSentence = words.length / sentences.length;
    const complexWords = words.filter(word => word.length > 7).length;
    const readabilityScore = Math.min(
      100 - Math.abs(avgWordsPerSentence - 15) * 2 - (complexWords / words.length) * 50,
      100
    );

    // Formatting Analysis (basic checks)
    let formattingScore = 100;
    if (content.length < 200) formattingScore -= 30;
    if (content.length > 5000) formattingScore -= 20;
    if (!content.includes('@')) formattingScore -= 10; // Email check
    if (!/\b\d{4}\b/.test(content)) formattingScore -= 10; // Year check
    formattingScore = Math.max(formattingScore, 0);

    const breakdown: ScoreBreakdown = {
      formatting: Math.round(formattingScore),
      keywords: Math.round(keywordScore),
      grammar: Math.round(grammarScore),
      readability: Math.round(readabilityScore)
    };

    const overall = Math.round(
      (breakdown.formatting + breakdown.keywords + breakdown.grammar + breakdown.readability) / 4
    );

    // Generate suggestions
    const suggestions: string[] = [];
    if (breakdown.keywords < 60) {
      suggestions.push('Include more relevant industry keywords and technical skills');
    }
    if (breakdown.grammar < 80) {
      suggestions.push('Review grammar and punctuation throughout the document');
    }
    if (breakdown.readability < 70) {
      suggestions.push('Simplify sentence structure and reduce complex terminology');
    }
    if (breakdown.formatting < 80) {
      suggestions.push('Ensure proper formatting with consistent structure and contact information');
    }
    if (matchedKeywords.length < 5) {
      suggestions.push('Add more specific technical skills and industry-relevant terms');
    }

    return {
      overall,
      breakdown,
      suggestions,
      matchedKeywords,
      grammarIssues,
      readabilityMetrics: {
        sentences: sentences.length,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        complexWords
      }
    };
  };

  useEffect(() => {
    if (resumeContent.trim()) {
      setIsAnalyzing(true);
      // Simulate processing delay for better UX
      const timer = setTimeout(() => {
        const result = analyzeResume(resumeContent);
        setAnalysis(result);
        setIsAnalyzing(false);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
    }
  }, [resumeContent]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertCircle;
    return XCircle;
  };

  if (!resumeContent.trim()) {
    return (
      <Card className="p-6 bg-gradient-card border border-border shadow-card">
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">Ready to Score Your Resume</h3>
          <p className="text-muted-foreground">
            Upload or paste your resume to get detailed analysis and suggestions
          </p>
        </div>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className="p-6 bg-gradient-card border border-border shadow-card">
        <div className="text-center py-8">
          <div className="animate-pulse-glow mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Analyzing Your Resume</h3>
          <p className="text-muted-foreground mb-4">
            Evaluating formatting, keywords, grammar, and readability...
          </p>
          <Progress value={75} className="w-64 mx-auto" />
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Overall Score */}
      <Card className="p-6 bg-gradient-card border border-border shadow-card">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary mb-4 shadow-glow">
            <span className="text-3xl font-bold text-primary-foreground">
              {analysis.overall}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Resume Score</h2>
          <p className="text-muted-foreground">
            {filename && `Analysis for "${filename}"`}
          </p>
          <Badge 
            variant={analysis.overall >= 80 ? 'default' : analysis.overall >= 60 ? 'secondary' : 'destructive'}
            className="mt-2"
          >
            {analysis.overall >= 80 ? 'Excellent' : analysis.overall >= 60 ? 'Good' : 'Needs Improvement'}
          </Badge>
        </div>
      </Card>

      {/* Score Breakdown */}
      <Card className="p-6 bg-gradient-card border border-border shadow-card">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Score Breakdown
        </h3>
        <div className="space-y-4">
          {Object.entries(analysis.breakdown).map(([category, score]) => {
            const Icon = getScoreIcon(score);
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 text-${getScoreColor(score)}`} />
                    <span className="font-medium capitalize">{category}</span>
                  </div>
                  <span className="font-bold">{score}%</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Matched Keywords */}
      {analysis.matchedKeywords.length > 0 && (
        <Card className="p-6 bg-gradient-card border border-border shadow-card">
          <h3 className="text-lg font-semibold mb-4">Matched Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.matchedKeywords.map((keyword) => (
              <Badge key={keyword} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <Card className="p-6 bg-gradient-card border border-border shadow-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Improvement Suggestions
          </h3>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-warning flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Readability Metrics */}
      <Card className="p-6 bg-gradient-card border border-border shadow-card">
        <h3 className="text-lg font-semibold mb-4">Readability Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {analysis.readabilityMetrics.sentences}
            </div>
            <div className="text-sm text-muted-foreground">Sentences</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {analysis.readabilityMetrics.avgWordsPerSentence}
            </div>
            <div className="text-sm text-muted-foreground">Avg Words/Sentence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {analysis.readabilityMetrics.complexWords}
            </div>
            <div className="text-sm text-muted-foreground">Complex Words</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
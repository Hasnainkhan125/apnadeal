import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaUpload, 
  FaFilePdf, 
  FaFileWord, 
  FaFileAlt,
  FaSpinner,
  FaCheckCircle,
  FaCopy,
  FaDownload,
  FaPrint,
  FaTrash,
  FaEdit,
  FaSave,
  FaRobot,
  FaMagic,
  FaFile,
  FaCheckDouble,
  FaSlidersH,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SummarizePage = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [summaryLength, setSummaryLength] = useState("medium");
  const [summaryStyle, setSummaryStyle] = useState("concise");
  const [language, setLanguage] = useState("english");
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const fileInputRef = useRef(null);

  // Sample summary data (mock)
  const sampleSummary = `This document discusses the fundamentals of machine learning, covering supervised, unsupervised, and reinforcement learning approaches. It highlights key algorithms including linear regression, decision trees, neural networks, and support vector machines. The text emphasizes the importance of data quality, feature engineering, and model evaluation metrics. Practical applications across healthcare, finance, and autonomous systems are explored, along with ethical considerations and future directions in AI research. The paper concludes with recommendations for implementing ML solutions in real-world scenarios, addressing challenges such as bias, interpretability, and scalability.`;

  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setText("This is sample text extracted from your uploaded document. In a real implementation, the AI would process the actual file content and generate a comprehensive summary based on the selected length and style preferences.");
    }
  };

  // Handle drop
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setText("This is sample text extracted from your dropped document.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle text input
  const handleTextChange = (event) => {
    setText(event.target.value);
    if (isGenerated) {
      setIsGenerated(false);
      setSummary("");
    }
  };

  // Generate summary
  const handleGenerateSummary = () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      let generatedSummary = sampleSummary;
      
      if (summaryLength === "short") {
        generatedSummary = sampleSummary.split('.').slice(0, 3).join('.') + '.';
      } else if (summaryLength === "long") {
        generatedSummary = sampleSummary + ' Additional details and expanded explanations are provided for comprehensive understanding.';
      }
      
      if (summaryStyle === "bullet") {
        generatedSummary = '• Key points from the document:\n• Machine learning fundamentals covered\n• Key algorithms discussed\n• Practical applications explored\n• Ethical considerations addressed';
      } else if (summaryStyle === "academic") {
        generatedSummary = 'This academic summary provides a comprehensive overview of the subject matter. The document presents a systematic analysis of key concepts, supported by empirical evidence and theoretical frameworks. The findings contribute to the existing body of knowledge and offer insights for future research directions.';
      }
      
      setSummary(generatedSummary);
      setEditedSummary(generatedSummary);
      setIsGenerated(true);
      setIsLoading(false);
    }, 2000);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedSummary || summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download summary
  const handleDownload = () => {
    const element = document.createElement('a');
    const fileContent = editedSummary || summary;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    element.href = url;
    element.download = `summary-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  // Print summary
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = editedSummary || summary;
    printWindow.document.write(`
      <html>
        <head><title>Summary</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto;">
          <h1>Summary</h1>
          <p style="line-height: 1.8; font-size: 16px;">${content.replace(/\n/g, '<br>')}</p>
          <p style="margin-top: 40px; color: #999; font-size: 14px;">Generated by AI Study Assistant</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Reset everything
  const handleReset = () => {
    setFile(null);
    setText("");
    setSummary("");
    setIsGenerated(false);
    setIsEditing(false);
    setEditedSummary("");
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get file icon
  const getFileIcon = () => {
    if (!file) return FaFileAlt;
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) return FaFilePdf;
    if (name.endsWith('.docx') || name.endsWith('.doc')) return FaFileWord;
    return FaFileAlt;
  };

  const FileIcon = getFileIcon();

  // Get summary stats
  const getSummaryStats = () => {
    const content = editedSummary || summary;
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const charCount = content.length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    return { wordCount, charCount, sentences };
  };

  const stats = getSummaryStats();

  // Get text stats
  const getTextStats = () => {
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const charCount = text.length;
    return { wordCount, charCount };
  };

  const textStats = getTextStats();

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-stone-950 dark:via-amber-950/10 dark:to-stone-950">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <FaArrowLeft className="text-[10px] sm:text-xs" />
              Back to Home
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 dark:text-white mt-1 flex items-center gap-2 sm:gap-3">
              <FaFile className="text-amber-500 text-xl sm:text-2xl" />
              AI Summarizer
            </h1>
          </div>
          
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-medium text-xs sm:text-sm hover:border-red-500 hover:text-red-500 transition-all"
          >
            <FaTrash className="text-[10px] sm:text-xs" />
            <span className="hidden xs:inline">Clear</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Input */}
          <div className="space-y-3 sm:space-y-4">
            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 ${
                file 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                  : 'border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-700'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <FileIcon className="text-3xl sm:text-4xl lg:text-5xl text-amber-500" />
                  <p className="font-semibold text-stone-900 dark:text-white text-sm sm:text-base truncate max-w-full px-2">
                    {file.name}
                  </p>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-600 text-xs sm:text-sm font-medium"
                  >
                    <FaTrash className="inline mr-1" /> Remove File
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 text-stone-400 dark:text-stone-600">
                    <FaUpload />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-stone-900 dark:text-white mb-1 sm:mb-2">
                    Drop your file here
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mb-3 sm:mb-4">
                    Supports PDF, DOCX, TXT (Max 10MB)
                  </p>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-xs sm:text-sm hover:shadow-amber-500/50 transition-all"
                  >
                    <FaUpload className="text-[10px] sm:text-xs" /> Browse Files
                  </button>
                </div>
              )}
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
              <span className="text-stone-400 dark:text-stone-500 text-[10px] sm:text-xs font-medium">OR</span>
              <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
            </div>

            {/* Text Input */}
            <div>
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 mb-1 sm:mb-2">
                <label className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
                  Paste Your Text
                </label>
                <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
                  {textStats.wordCount} words • {textStats.charCount} chars
                </span>
              </div>
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your text here to summarize..."
                rows="5"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none text-sm"
              />
            </div>

            {/* Settings */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <FaSlidersH className="text-[10px] sm:text-xs" /> {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-stone-50 dark:bg-stone-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4 border border-stone-200 dark:border-stone-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          Summary Length
                        </label>
                        <select
                          value={summaryLength}
                          onChange={(e) => setSummaryLength(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm"
                        >
                          <option value="short">Short</option>
                          <option value="medium">Medium</option>
                          <option value="long">Long</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          Summary Style
                        </label>
                        <select
                          value={summaryStyle}
                          onChange={(e) => setSummaryStyle(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm"
                        >
                          <option value="concise">Concise</option>
                          <option value="detailed">Detailed</option>
                          <option value="bullet">Bullet Points</option>
                          <option value="academic">Academic</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          Language
                        </label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm"
                        >
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                          <option value="chinese">Chinese</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={handleGenerateSummary}
                          disabled={!text.trim() || isLoading}
                          className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <FaSpinner className="animate-spin text-[10px] sm:text-xs" /> Processing...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <FaMagic className="text-[10px] sm:text-xs" /> Generate
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Button (if not showing advanced) */}
            {!showAdvanced && (
              <button
                onClick={handleGenerateSummary}
                disabled={!text.trim() || isLoading}
                className="w-full py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <FaSpinner className="animate-spin text-sm sm:text-base" />
                    Generating Summary...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <FaMagic className="text-sm sm:text-base" /> Generate Summary
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <FaCheckDouble className="text-amber-500 text-sm sm:text-base" />
                Summary
              </h2>
              {isGenerated && (
                <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
                  {stats.wordCount} words • {stats.sentences} sentences
                </span>
              )}
            </div>

            <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/80 p-4 sm:p-6 lg:p-8 min-h-[250px] sm:min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 sm:h-48">
                  <FaSpinner className="text-3xl sm:text-4xl text-amber-500 animate-spin mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400">AI is analyzing your text...</p>
                </div>
              ) : isGenerated ? (
                <div>
                  {isEditing ? (
                    <textarea
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      rows="6"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none text-sm"
                    />
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-sm sm:text-base text-stone-700 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                        {editedSummary || summary}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-stone-200 dark:border-stone-800">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-[10px] sm:text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                    >
                      {copied ? <FaCheckCircle className="text-emerald-500 text-[10px] sm:text-xs" /> : <FaCopy className="text-[10px] sm:text-xs" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-[10px] sm:text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                    >
                      <FaDownload className="text-[10px] sm:text-xs" /> Download
                    </button>

                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-[10px] sm:text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                    >
                      <FaPrint className="text-[10px] sm:text-xs" /> Print
                    </button>

                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-[10px] sm:text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                    >
                      {isEditing ? <FaSave className="text-[10px] sm:text-xs" /> : <FaEdit className="text-[10px] sm:text-xs" />}
                      {isEditing ? 'Save' : 'Edit'}
                    </button>

                    <button
                      onClick={() => {
                        setSummary("");
                        setIsGenerated(false);
                        setEditedSummary("");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-[10px] sm:text-xs hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-all"
                    >
                      <FaTrash className="text-[10px] sm:text-xs" /> Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-36 sm:h-48 text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 text-stone-300 dark:text-stone-700">
                    <FaFile />
                  </div>
                  <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400">
                    Your summary will appear here
                  </p>
                  <p className="text-[10px] sm:text-xs text-stone-400 dark:text-stone-500 mt-1">
                    Upload a file or paste text to get started
                  </p>
                </div>
              )}
            </div>

            {/* AI Tips */}
            {isGenerated && (
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800/30">
                <div className="flex items-start gap-2 sm:gap-3">
                  <FaRobot className="text-amber-500 mt-0.5 text-sm sm:text-base" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">
                      AI Tip
                    </p>
                    <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400">
                      This summary captures the key points. You can edit, copy, or download it. 
                      Try adjusting length or style for different outputs.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarizePage;
import React, { useState, useEffect, useRef } from 'react';
import { GameOver } from './components/GameOver';
import { GameConfig, GameState, GameMode, GameContent, ScoreStats } from './types';
import { generateGameContent } from './services/geminiService';
import { MemoryGame } from './components/MemoryGame';
import { QuizGame } from './components/QuizGame';
import { TrueFalseGame } from './components/TrueFalseGame';
import { SorterGame } from './components/SorterGame';
import { OrderGame } from './components/OrderGame';
import { 
  Brain, Upload, FileText, CheckCircle, 
  Grid3X3, HelpCircle, CheckSquare, GitCompare, ListOrdered, Home 
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [config, setConfig] = useState<GameConfig>({
    sourceType: 'pdf',
    subject: '',
    difficulty: 'Standard',
    pairCount: 8,
    gameMode: 'MEMORY'
  });
  
  const [gameContent, setGameContent] = useState<GameContent | null>(null);
  const [finalStats, setFinalStats] = useState<ScoreStats | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("Initializing neural link...");
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set worker source for PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
  }, []);

  const handleModeSelect = async (mode: GameMode) => {
    if (!config.pdfContent) {
      alert("Please upload a PDF first!");
      return;
    }
    
    // Update config with selected mode immediately
    const newConfig = { ...config, gameMode: mode };
    setConfig(newConfig);

    setGameState(GameState.LOADING);
    setLoadingMsg(`Generating ${mode.replace('_', ' ').toLowerCase()} challenge...`);

    try {
      const content = await generateGameContent(newConfig);
      setGameContent(content);
      setGameState(GameState.PLAYING);
    } catch (err) {
      console.error(err);
      setGameState(GameState.ERROR);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Please upload a valid PDF file.");
      return;
    }

    setIsProcessingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + " ";
      }

      setConfig(prev => ({
        ...prev,
        sourceType: 'pdf',
        pdfContent: fullText,
        pdfName: file.name
      }));
    } catch (error) {
      console.error("Error parsing PDF:", error);
      alert("Failed to extract text from PDF.");
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleGameOver = (stats: ScoreStats) => {
    setFinalStats(stats);
    setGameState(GameState.GAME_OVER);
  };

  const renderGameComponent = () => {
    if (!gameContent) return null;

    switch (config.gameMode) {
      case 'MEMORY':
        return <MemoryGame data={gameContent as any} onGameOver={handleGameOver} />;
      case 'QUIZ':
        return <QuizGame data={gameContent as any} onGameOver={handleGameOver} />;
      case 'TRUE_FALSE':
        return <TrueFalseGame data={gameContent as any} onGameOver={handleGameOver} />;
      case 'SORTER':
        return <SorterGame data={gameContent as any} onGameOver={handleGameOver} />;
      case 'ORDER':
        return <OrderGame data={gameContent as any} onGameOver={handleGameOver} />;
      default:
        return <div>Unknown Mode</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setGameState(GameState.MENU)}>
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Aaradhya Brain Storm
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {gameState === GameState.PLAYING && (
              <>
                <div className="hidden md:block text-sm font-medium text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                  Playing: <span className="text-indigo-300">{config.gameMode.replace('_', ' ')}</span>
                </div>
                <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 rounded-lg transition-all text-slate-300 hover:text-white text-sm font-medium"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        
        {/* MENU STATE */}
        {gameState === GameState.MENU && (
          <div className="max-w-5xl w-full flex flex-col items-center gap-12 animate-fade-in">
            <div className="text-center space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                Transform Study Material <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  Into Games
                </span>
              </h1>
              <p className="text-lg text-slate-400">
                Upload your notes (PDF) and play generated mini-games to master the content.
              </p>
            </div>
            
            <div className="w-full max-w-xl">
               {/* Upload Section */}
               <div 
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group mb-8 ${
                    config.pdfName 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-slate-700 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-900'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                  />
                  
                  {isProcessingPdf ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  ) : config.pdfName ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div className="text-left">
                        <p className="font-semibold text-green-300">{config.pdfName}</p>
                        <p className="text-xs text-green-400/60">Ready to play</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Upload className="w-6 h-6 text-indigo-400" />
                      <div className="text-left">
                         <p className="font-semibold text-slate-300">Upload PDF Guide</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Game Modes Grid */}
                <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 transition-opacity duration-500 ${!config.pdfContent ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                   
                   <button onClick={() => handleModeSelect('MEMORY')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-indigo-500 transition-all text-left group">
                      <div className="bg-indigo-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-400">
                        <Grid3X3 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-200">Mind Match</h3>
                      <p className="text-xs text-slate-500 mt-1">Connect terms & definitions</p>
                   </button>

                   <button onClick={() => handleModeSelect('QUIZ')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-pink-500 transition-all text-left group">
                      <div className="bg-pink-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-pink-500 group-hover:text-white transition-colors text-pink-400">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-200">Speed Quiz</h3>
                      <p className="text-xs text-slate-500 mt-1">Multiple choice challenge</p>
                   </button>

                   <button onClick={() => handleModeSelect('TRUE_FALSE')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-green-500 transition-all text-left group">
                      <div className="bg-green-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-500 group-hover:text-white transition-colors text-green-400">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-200">Fact or Fiction</h3>
                      <p className="text-xs text-slate-500 mt-1">Rapid fire verification</p>
                   </button>

                   <button onClick={() => handleModeSelect('SORTER')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-orange-500 transition-all text-left group">
                      <div className="bg-orange-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-500 group-hover:text-white transition-colors text-orange-400">
                        <GitCompare className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-200">Concept Sort</h3>
                      <p className="text-xs text-slate-500 mt-1">Categorize items</p>
                   </button>

                   <button onClick={() => handleModeSelect('ORDER')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-cyan-500 transition-all text-left group md:col-span-1 col-span-2">
                      <div className="bg-cyan-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-cyan-500 group-hover:text-white transition-colors text-cyan-400">
                        <ListOrdered className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-200">Chrono Order</h3>
                      <p className="text-xs text-slate-500 mt-1">Arrangement logic</p>
                   </button>

                </div>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {gameState === GameState.LOADING && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
              <Brain className="absolute inset-0 m-auto w-10 h-10 text-indigo-400 animate-pulse" />
            </div>
            <p className="text-xl text-indigo-300 font-light animate-pulse text-center max-w-md">
              {loadingMsg}
            </p>
          </div>
        )}

        {/* PLAYING STATE */}
        {gameState === GameState.PLAYING && renderGameComponent()}

        {/* GAME OVER STATE */}
        {gameState === GameState.GAME_OVER && finalStats && (
          <GameOver 
            stats={finalStats} 
            onRestart={() => handleModeSelect(config.gameMode)} 
            onHome={() => setGameState(GameState.MENU)} 
          />
        )}

        {/* ERROR STATE */}
        {gameState === GameState.ERROR && (
          <div className="text-center space-y-4">
             <div className="text-red-400 text-6xl">⚠️</div>
             <h2 className="text-2xl font-bold text-slate-200">System Failure</h2>
             <p className="text-slate-400">Could not generate game content. Ensure the PDF has readable text.</p>
             <button 
                onClick={() => setGameState(GameState.MENU)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"
             >
               Return to Menu
             </button>
          </div>
        )}

      </main>
      
    </div>
  );
}
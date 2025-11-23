import React, { useState } from 'react';
import { TrueFalseQuestion, ScoreStats } from '../types';
import { Check, X } from 'lucide-react';

interface TrueFalseGameProps {
  data: TrueFalseQuestion[];
  onGameOver: (stats: ScoreStats) => void;
}

export const TrueFalseGame: React.FC<TrueFalseGameProps> = ({ data, onGameOver }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [showResult, setShowResult] = useState<'CORRECT' | 'WRONG' | null>(null);

  const currentItem = data[currentIndex];

  const handleGuess = (guessTrue: boolean) => {
    if (showResult) return;

    const isCorrect = guessTrue === currentItem.isTrue;
    if (isCorrect) setScore(s => s + 1);
    
    setShowResult(isCorrect ? 'CORRECT' : 'WRONG');

    setTimeout(() => {
      if (currentIndex < data.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowResult(null);
      } else {
        const endTime = Date.now();
        onGameOver({
          moves: data.length,
          timeElapsed: Math.floor((endTime - startTime) / 1000),
          accuracy: Math.round(((score + (isCorrect ? 1 : 0)) / data.length) * 100),
          timestamp: endTime
        });
      }
    }, 1000);
  };

  return (
    <div className="max-w-xl w-full mx-auto flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-full text-center mb-8">
        <div className="inline-block bg-indigo-500/20 text-indigo-300 px-4 py-1 rounded-full text-sm font-mono mb-4">
          Statement {currentIndex + 1} / {data.length}
        </div>
        
        <div className="relative perspective-1000 min-h-[200px]">
           <div className={`
             bg-slate-800 border-2 rounded-3xl p-8 shadow-2xl transition-all duration-300 transform
             ${showResult === 'CORRECT' ? 'border-green-500 bg-green-900/20' : ''}
             ${showResult === 'WRONG' ? 'border-red-500 bg-red-900/20' : 'border-slate-600'}
           `}>
              <p className="text-2xl md:text-3xl font-medium text-center leading-relaxed">
                {currentItem.statement}
              </p>
           </div>
        </div>
      </div>

      <div className="flex gap-6 w-full max-w-sm">
        <button 
          onClick={() => handleGuess(true)}
          disabled={!!showResult}
          className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white p-6 rounded-2xl flex flex-col items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-900/50"
        >
          <Check className="w-8 h-8" />
          <span className="font-bold text-lg">TRUE</span>
        </button>

        <button 
          onClick={() => handleGuess(false)}
          disabled={!!showResult}
          className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white p-6 rounded-2xl flex flex-col items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-red-900/50"
        >
          <X className="w-8 h-8" />
          <span className="font-bold text-lg">FALSE</span>
        </button>
      </div>
    </div>
  );
};

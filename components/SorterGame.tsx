import React, { useState } from 'react';
import { SorterData, ScoreStats } from '../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SorterGameProps {
  data: SorterData;
  onGameOver: (stats: ScoreStats) => void;
}

export const SorterGame: React.FC<SorterGameProps> = ({ data, onGameOver }) => {
  const [items] = useState(data.items); // Already shuffled or random order from API
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [animDir, setAnimDir] = useState<'LEFT' | 'RIGHT' | null>(null);

  const currentItem = items[currentIndex];

  const handleSort = (direction: 'A' | 'B') => {
    if (animDir) return;

    setAnimDir(direction === 'A' ? 'LEFT' : 'RIGHT');
    const isCorrect = direction === currentItem.category;
    
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      setAnimDir(null);
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        const endTime = Date.now();
        onGameOver({
          moves: items.length,
          timeElapsed: Math.floor((endTime - startTime) / 1000),
          accuracy: Math.round(((score + (isCorrect ? 1 : 0)) / items.length) * 100),
          timestamp: endTime
        });
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="flex justify-between w-full mb-12 px-4 md:px-12">
        <div className="flex flex-col items-center">
          <div className="text-sm text-slate-500 mb-2">Category A (Left)</div>
          <div className="bg-indigo-900/50 border-2 border-indigo-500/50 p-4 rounded-xl min-w-[150px] text-center font-bold text-indigo-200">
            {data.categoryA}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-sm text-slate-500 mb-2">Category B (Right)</div>
          <div className="bg-pink-900/50 border-2 border-pink-500/50 p-4 rounded-xl min-w-[150px] text-center font-bold text-pink-200">
            {data.categoryB}
          </div>
        </div>
      </div>

      <div className="relative h-64 w-full flex justify-center items-center">
        {currentItem && (
          <div 
            className={`
              absolute w-64 h-64 bg-slate-800 border-2 border-slate-600 rounded-3xl 
              flex items-center justify-center p-6 text-center shadow-2xl
              transition-all duration-300
              ${animDir === 'LEFT' ? '-translate-x-48 opacity-0 rotate-[-15deg]' : ''}
              ${animDir === 'RIGHT' ? 'translate-x-48 opacity-0 rotate-[15deg]' : ''}
            `}
          >
            <span className="text-xl font-semibold text-slate-100">{currentItem.text}</span>
          </div>
        )}
      </div>

      <div className="flex gap-12 mt-12">
         <button 
           onClick={() => handleSort('A')}
           className="p-6 bg-slate-800 rounded-full border border-slate-700 hover:bg-indigo-600 hover:border-indigo-400 transition-all group"
         >
           <ArrowLeft className="w-8 h-8 text-slate-400 group-hover:text-white" />
         </button>
         <div className="text-slate-500 pt-4 font-mono text-sm">
           {currentIndex} / {items.length} Sorted
         </div>
         <button 
           onClick={() => handleSort('B')}
           className="p-6 bg-slate-800 rounded-full border border-slate-700 hover:bg-pink-600 hover:border-pink-400 transition-all group"
         >
           <ArrowRight className="w-8 h-8 text-slate-400 group-hover:text-white" />
         </button>
      </div>

      <div className="text-slate-500 text-xs mt-8">
        Keyboard: Use Left / Right Arrows
      </div>
    </div>
  );
};

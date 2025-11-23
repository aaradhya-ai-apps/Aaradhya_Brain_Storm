import React, { useState } from 'react';
import { QuizQuestion, ScoreStats } from '../types';

interface QuizGameProps {
  data: QuizQuestion[];
  onGameOver: (stats: ScoreStats) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ data, onGameOver }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = data[currentIndex];

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < data.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        const endTime = Date.now();
        onGameOver({
          moves: data.length, // Total questions
          timeElapsed: Math.floor((endTime - startTime) / 1000),
          accuracy: Math.round(( (correctCount + (option === currentQuestion.correctAnswer ? 1 : 0)) / data.length) * 100),
          timestamp: endTime
        });
      }
    }, 1500);
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-4">
      <div className="mb-6 flex justify-between text-slate-400">
         <span>Question {currentIndex + 1} of {data.length}</span>
         <span>Score: {correctCount}</span>
      </div>

      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 shadow-xl mb-6">
        <h2 className="text-2xl font-semibold text-slate-100 mb-6">{currentQuestion.question}</h2>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let btnClass = "w-full p-4 rounded-xl text-left transition-all border-2 ";
            
            if (isAnswered) {
              if (option === currentQuestion.correctAnswer) {
                btnClass += "bg-green-500/20 border-green-500 text-green-200";
              } else if (option === selectedOption) {
                btnClass += "bg-red-500/20 border-red-500 text-red-200";
              } else {
                btnClass += "bg-slate-800 border-slate-700 opacity-50";
              }
            } else {
              btnClass += "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-indigo-500";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className={btnClass}
                disabled={isAnswered}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${isAnswered && option === currentQuestion.correctAnswer ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  {option}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

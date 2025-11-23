import React from 'react';
import { CardData } from '../types';

interface CardProps {
  card: CardData;
  onClick: (card: CardData) => void;
  disabled: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onClick(card);
    }
  };

  return (
    <div 
      className={`relative h-28 w-full cursor-pointer perspective-1000 group`} 
      onClick={handleClick}
    >
      <div
        className={`w-full h-full duration-500 transform-style-3d transition-transform ${
          card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of Card (Face Down) */}
        <div className="absolute w-full h-full backface-hidden rounded-xl shadow-lg
          bg-gradient-to-br from-indigo-600 to-violet-700 border-2 border-indigo-400/30
          flex items-center justify-center transform group-hover:scale-[1.02] transition-transform">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-white/20" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>

        {/* Back of Card (Face Up - Content) */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-xl
          bg-slate-800 border-2 border-indigo-500 flex items-center justify-center p-2 text-center overflow-hidden">
          <div className="flex flex-col items-center justify-center h-full">
            <span className={`text-sm md:text-base font-medium select-none text-slate-100
              ${card.content.length > 20 ? 'text-xs' : ''}`}>
              {card.content}
            </span>
            {card.isMatched && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                 <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
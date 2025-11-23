import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { CardData, GeneratedPair, ScoreStats } from '../types';

interface MemoryGameProps {
  data: GeneratedPair[];
  onGameOver: (stats: ScoreStats) => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ data, onGameOver }) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardData[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    // Initialize Cards
    const deck: CardData[] = [];
    data.forEach((pair, index) => {
      deck.push({
        id: `card-${index}-a`,
        pairId: `pair-${index}`,
        content: pair.term,
        type: 'term',
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: `card-${index}-b`,
        pairId: `pair-${index}`,
        content: pair.match,
        type: 'definition',
        isFlipped: false,
        isMatched: false,
      });
    });
    setCards(deck.sort(() => Math.random() - 0.5));
  }, [data]);

  const handleCardClick = (clickedCard: CardData) => {
    if (flippedCards.length >= 2 || flippedCards.some(c => c.id === clickedCard.id)) return;

    // Flip Card
    setCards(prev => prev.map(c => c.id === clickedCard.id ? { ...c, isFlipped: true } : c));
    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (first.pairId === second.pairId) {
        // Match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first.id || c.id === second.id 
              ? { ...c, isMatched: true, isFlipped: true } 
              : c
          ));
          setFlippedCards([]);
          setMatchedCount(prev => {
            const newCount = prev + 1;
            if (newCount === data.length) {
              const endTime = Date.now();
              onGameOver({
                moves: moves + 1,
                timeElapsed: Math.floor((endTime - startTime) / 1000),
                accuracy: Math.round((data.length / (moves + 1)) * 100),
                timestamp: endTime
              });
            }
            return newCount;
          });
        }, 500);
      } else {
        // No Match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 1200);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl animate-fade-in">
       <div className="flex justify-between mb-4 text-slate-400 font-mono text-sm px-4">
         <span>Matches: {matchedCount} / {data.length}</span>
         <span>Moves: {moves}</span>
       </div>
       <div className="grid grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {cards.map(card => (
            <Card 
              key={card.id} 
              card={card} 
              onClick={handleCardClick} 
              disabled={flippedCards.length >= 2 || card.isMatched} 
            />
          ))}
       </div>
    </div>
  );
};

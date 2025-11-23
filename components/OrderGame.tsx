import React, { useState, useEffect } from 'react';
import { OrderItem, ScoreStats } from '../types';
import { ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';

interface OrderGameProps {
  data: OrderItem[]; // Passed in correct order initially
  onGameOver: (stats: ScoreStats) => void;
}

export const OrderGame: React.FC<OrderGameProps> = ({ data, onGameOver }) => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Shuffle on mount
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, [data]);

  const moveItem = (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === items.length - 1) return;

    const newItems = [...items];
    const swapIndex = direction === 'UP' ? index - 1 : index + 1;
    
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    setItems(newItems);
  };

  const checkOrder = () => {
    setAttempts(a => a + 1);
    let isCorrect = true;
    for (let i = 0; i < items.length; i++) {
      if (items[i].correctIndex !== i) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      const endTime = Date.now();
      onGameOver({
        moves: attempts + 1,
        timeElapsed: Math.floor((endTime - startTime) / 1000),
        accuracy: Math.max(0, 100 - (attempts * 10)), // Simple penalty for attempts
        timestamp: endTime
      });
    } else {
        // Visual shake or error feedback could go here
        alert("Not quite right yet. Keep adjusting!");
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl text-slate-300">Arrange in Chronological/Logical Order</h2>
        <p className="text-sm text-slate-500">First (Top) to Last (Bottom)</p>
      </div>

      <div className="space-y-3 mb-8">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-2 items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => moveItem(index, 'UP')}
                disabled={index === 0}
                className="p-1 hover:bg-slate-700 rounded disabled:opacity-20 text-slate-400"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => moveItem(index, 'DOWN')}
                disabled={index === items.length - 1}
                className="p-1 hover:bg-slate-700 rounded disabled:opacity-20 text-slate-400"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 text-slate-200 text-sm md:text-base pl-2">
              {item.content}
            </div>
            <div className="w-8 text-center text-slate-600 font-mono text-xs">
                {index + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={checkOrder}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/50 transition-all hover:scale-105"
        >
          <CheckCircle className="w-5 h-5" />
          Verify Order
        </button>
      </div>
    </div>
  );
};

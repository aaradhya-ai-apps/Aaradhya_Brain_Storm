import React from 'react';
import { ScoreStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GameOverProps {
  stats: ScoreStats;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ stats, onRestart, onHome }) => {
  const data = [
    { name: 'Accuracy', value: stats.accuracy, fill: '#8b5cf6' },
    { name: 'Time (s)', value: stats.timeElapsed, fill: '#06b6d4' },
    { name: 'Moves', value: stats.moves, fill: '#ec4899' },
  ];

  return (
    <div className="max-w-2xl w-full mx-auto p-6 animate-fade-in">
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-3xl border border-slate-700 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
            Mission Complete
          </h2>
          <p className="text-slate-400">Excellent work, student.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Time</div>
            <div className="text-2xl font-bold text-cyan-400">{stats.timeElapsed}s</div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Moves</div>
            <div className="text-2xl font-bold text-pink-400">{stats.moves}</div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-violet-400">{stats.accuracy}%</div>
          </div>
        </div>

        <div className="h-64 w-full mb-8">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
              <Tooltip 
                cursor={{fill: '#1e293b'}}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onHome}
            className="px-6 py-3 rounded-lg border border-slate-600 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            Choose Game
          </button>
          <button
            onClick={onRestart}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
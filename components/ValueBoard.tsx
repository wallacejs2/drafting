import React from 'react';
import type { Player } from '../types';

interface ValueBoardProps {
    availablePlayers: Player[];
}

const ValueBoard: React.FC<ValueBoardProps> = ({ availablePlayers }) => {
    const playersToAnalyze = availablePlayers
        .slice(0, 10)
        .map(p => ({
            ...p,
            valueScore: (p.adp ?? 200) - (p.projectionRank ?? 200),
        }))
        .filter(p => p.position !== 'K' && p.position !== 'DST')
        .sort((a, b) => b.valueScore - a.valueScore)
        .slice(0, 5);

    if (playersToAnalyze.length === 0) {
        return null;
    }

    const maxValue = Math.max(...playersToAnalyze.map(p => p.valueScore), 0) * 1.2;

    const getValueColor = (value: number) => {
        if (value > 15) return 'bg-emerald-500';
        if (value > 5) return 'bg-sky-500';
        return 'bg-amber-500';
    };

    return (
        <div>
            <h3 className="text-sm font-bold text-brand-text uppercase mb-2">Best Value on the Board</h3>
            <div className="space-y-2 bg-brand-primary rounded-lg p-3">
                {playersToAnalyze.map(player => (
                    <div key={player.id} className="flex items-center text-sm">
                        <div className="w-2/5 truncate text-brand-text font-semibold" title={player.name}>
                            {player.name} <span className="text-brand-subtle text-xs">({player.position})</span>
                        </div>
                        <div className="w-3/5">
                            <div className="w-full bg-brand-secondary rounded-full h-5">
                                <div
                                    className={`h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-500 ease-out ${getValueColor(player.valueScore)}`}
                                    style={{ width: `${maxValue > 0 ? (player.valueScore / maxValue) * 100 : 0}%` }}
                                >
                                    <span className="text-xs font-bold text-white mix-blend-difference">
                                        +{player.valueScore} vs Rank
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ValueBoard;
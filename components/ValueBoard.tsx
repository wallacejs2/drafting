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
        .filter(p => p.position !== 'K' && p.position !== 'DST' && p.valueScore > 0)
        .sort((a, b) => b.valueScore - a.valueScore)
        .slice(0, 5);

    if (playersToAnalyze.length === 0) {
        return null;
    }

    const maxValue = Math.max(...playersToAnalyze.map(p => p.valueScore), 0) * 1.2;

    const getValueColor = (value: number) => {
        if (value > 15) return 'bg-accent-positive';
        if (value > 5) return 'bg-accent-primary';
        return 'bg-accent-warning';
    };

    return (
        <div>
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Best Value on the Board</h3>
            <div className="space-y-2 bg-bg-primary rounded-lg p-3">
                {playersToAnalyze.map(player => (
                    <div key={player.id} className="flex items-center text-sm">
                        <div className="w-2/5 truncate text-text-primary font-semibold" title={player.name}>
                            {player.name} <span className="text-text-secondary text-xs">({player.position})</span>
                        </div>
                        <div className="w-3/5">
                            <div className="w-full bg-bg-secondary rounded-full h-5">
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
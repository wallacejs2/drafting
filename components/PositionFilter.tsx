

import React from 'react';
import { Position } from '../types';

interface PositionFilterProps {
    selectedPosition: Position | 'ALL' | 'FLEX';
    onSelectPosition: (position: Position | 'ALL' | 'FLEX') => void;
}

const POSITIONS_WITH_ALL: (Position | 'ALL' | 'FLEX')[] = ['ALL', 'FLEX', Position.QB, Position.RB, Position.WR, Position.TE, Position.K, Position.DST];

const PositionFilter: React.FC<PositionFilterProps> = ({ selectedPosition, onSelectPosition }) => {
    return (
        <div className="mb-4 bg-bg-secondary p-1.5 rounded-xl flex items-center justify-center flex-wrap gap-1">
            {POSITIONS_WITH_ALL.map(position => (
                <button
                    key={position}
                    onClick={() => onSelectPosition(position)}
                    aria-pressed={selectedPosition === position}
                    className={`flex-grow px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 transform
                        ${
                            selectedPosition === position
                                ? 'bg-accent-primary text-white shadow-md scale-105'
                                : 'bg-transparent text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                        }`
                    }
                >
                    {position}
                </button>
            ))}
        </div>
    );
};

export default PositionFilter;
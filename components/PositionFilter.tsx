import React from 'react';
import { Position } from '../types';

interface PositionFilterProps {
    selectedPosition: Position | 'ALL';
    onSelectPosition: (position: Position | 'ALL') => void;
}

const POSITIONS_WITH_ALL: (Position | 'ALL')[] = ['ALL', Position.QB, Position.RB, Position.WR, Position.TE, Position.K, Position.DST];

const PositionFilter: React.FC<PositionFilterProps> = ({ selectedPosition, onSelectPosition }) => {
    return (
        <div className="mb-4 bg-brand-secondary p-1.5 rounded-xl flex items-center justify-center flex-wrap">
            {POSITIONS_WITH_ALL.map(position => (
                <button
                    key={position}
                    onClick={() => onSelectPosition(position)}
                    className={`flex-grow px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 transform
                        ${
                            selectedPosition === position
                                ? 'bg-brand-accent text-white shadow-md scale-105'
                                : 'bg-transparent text-brand-subtle hover:bg-brand-primary hover:text-brand-text'
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
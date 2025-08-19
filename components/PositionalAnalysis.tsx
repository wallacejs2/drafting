import React from 'react';

interface PositionalAnalysisProps {
    analysis: Record<string, number> | undefined;
}

const Circle: React.FC<{ percentage: number; label: string }> = ({ percentage, label }) => {
    const positionColors: Record<string, string> = {
        QB: 'from-sky-400 to-blue-500',
        RB: 'from-emerald-400 to-green-500',
        WR: 'from-amber-400 to-orange-500',
        TE: 'from-rose-400 to-red-500',
    };
    
    const colorClass = positionColors[label] || 'from-gray-400 to-gray-500';

    return (
        <div className="flex flex-col items-center justify-center gap-2 animate-fade-in">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        className="text-brand-border"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                    />
                    {/* Foreground circle */}
                    <circle
                        className="text-brand-accent"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={2 * Math.PI * 45 * (1 - percentage / 100)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg sm:text-xl font-bold text-brand-text">{percentage}<span className="text-xs">%</span></span>
                </div>
            </div>
            <span className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full bg-gradient-to-br ${colorClass} text-white shadow-md`}>{label}</span>
        </div>
    );
};


const PositionalAnalysis: React.FC<PositionalAnalysisProps> = ({ analysis }) => {
    if (!analysis || Object.keys(analysis).length === 0) {
        // Render skeletons
        return (
            <div>
                 <h3 className="text-sm font-bold text-brand-text uppercase mb-3">AI Position Recommendations</h3>
                <div className="grid grid-cols-4 gap-2 sm:gap-4 p-2 bg-brand-primary rounded-lg">
                    {['QB', 'RB', 'WR', 'TE'].map(pos => (
                         <div key={pos} className="flex flex-col items-center justify-center gap-2 animate-pulse">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-secondary rounded-full"></div>
                             <div className="h-5 w-10 bg-brand-secondary rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    // Sort by percentage, descending
    const sortedPositions = Object.entries(analysis).sort(([, a], [, b]) => b - a);

    return (
        <div>
            <h3 className="text-sm font-bold text-brand-text uppercase mb-3">AI Position Recommendations</h3>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 p-2 bg-brand-primary rounded-lg">
                {sortedPositions.map(([position, percentage]) => (
                    <Circle key={position} label={position} percentage={percentage} />
                ))}
            </div>
        </div>
    );
};

export default PositionalAnalysis;
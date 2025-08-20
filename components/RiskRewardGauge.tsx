import React from 'react';

interface RiskRewardGaugeProps {
    score: number; // 1 to 10
}

const RiskRewardGauge: React.FC<RiskRewardGaugeProps> = ({ score }) => {
    const normalizedScore = Math.max(1, Math.min(10, score));
    const rotation = -90 + ((normalizedScore - 1) / 9) * 180;

    const getScoreColor = () => {
        if (normalizedScore <= 3) return 'text-green-400';
        if (normalizedScore <= 7) return 'text-yellow-400';
        return 'text-red-500';
    };

    return (
        <div className="bg-brand-secondary border border-brand-border rounded-lg p-4 flex flex-col items-center">
            <h3 className="text-lg font-bold text-brand-text mb-2">Risk / Reward Profile</h3>
            <div className="w-48 h-24 relative">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4ade80" /> {/* Green */}
                            <stop offset="50%" stopColor="#facc15" /> {/* Yellow */}
                            <stop offset="100%" stopColor="#ef4444" /> {/* Red */}
                        </linearGradient>
                    </defs>
                    <path
                        d="M 10 40 A 40 40 0 0 1 90 40"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
                {/* Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-0.5 h-[90%] bg-brand-text origin-bottom transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                >
                     <div className="w-3 h-3 bg-brand-text rounded-full absolute -top-1.5 -left-1"></div>
                </div>
                <div className="absolute w-6 h-6 bg-brand-secondary border-2 border-brand-text rounded-full bottom-[-12px] left-1/2 -translate-x-1/2"></div>
            </div>
            <div className="flex justify-between w-full px-2 mt-1 text-xs text-brand-subtle font-semibold">
                <span>SAFE</span>
                <span>BOOM/BUST</span>
            </div>
             <p className={`mt-2 text-2xl font-bold ${getScoreColor()}`}>{normalizedScore.toFixed(1)} / 10</p>
        </div>
    );
};

export default RiskRewardGauge;

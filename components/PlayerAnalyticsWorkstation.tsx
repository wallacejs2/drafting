import React, { useState, useEffect } from 'react';
import type { Player, PlayerOutlook } from '../types';
import RiskRewardGauge from './RiskRewardGauge';
import StatComparisonChart from './StatComparisonChart';

interface PlayerAnalyticsWorkstationProps {
    player: Player | null;
    outlook: PlayerOutlook | null;
    onClose: () => void;
}

const InjuryRiskBadge: React.FC<{ risk: Player['injuryRisk'] }> = ({ risk }) => {
    const riskStyles = {
        Low: 'border-green-500 text-green-400',
        Medium: 'border-yellow-500 text-yellow-400',
        High: 'border-red-500 text-red-500',
    };
    return (
        <span className={`text-xs font-bold px-2 py-0.5 border rounded-full ${riskStyles[risk]}`}>
            {risk.toUpperCase()} RISK
        </span>
    );
};

const OutlookCard: React.FC<{ title: string; content: string; icon: React.ReactNode }> = ({ title, content, icon }) => (
    <div className="bg-brand-primary/50 border border-brand-border/50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <h3 className="text-lg font-bold text-brand-text">{title}</h3>
        </div>
        <p className="text-brand-subtle text-sm">{content}</p>
    </div>
);

const PlayerAnalyticsWorkstation: React.FC<PlayerAnalyticsWorkstationProps> = ({ player, outlook, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay to allow the component to mount before starting the transition
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to finish before calling parent's close handler
    };

    if (!player) {
        return null;
    }

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
                aria-hidden="true"
            ></div>

            {/* Side Panel */}
            <div
                className={`absolute top-0 right-0 h-full w-full max-w-lg bg-brand-secondary border-l border-brand-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-brand-border">
                    <h2 className="text-xl font-bold text-brand-text">Player Analysis</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close player analysis"
                        className="text-brand-subtle p-1 rounded-full hover:bg-brand-primary hover:text-brand-text transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto p-4 md:p-6">
                    {/* Player Header */}
                    <div className="bg-brand-primary/50 border border-brand-border/50 rounded-lg p-4 mb-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-brand-text">{player.name}</h2>
                                <div className="flex items-center gap-4 mt-2 flex-wrap">
                                    <p className="text-lg font-semibold text-brand-accent">{player.position} - {player.team}</p>
                                    <InjuryRiskBadge risk={player.injuryRisk} />
                                    {player.adp && <p className="text-sm font-mono bg-brand-primary px-2 py-1 rounded text-brand-subtle">ADP {player.adp}</p>}
                                </div>
                            </div>
                            <div className="text-center md:text-right">
                                <p className="text-xs text-brand-subtle">2025 PROJ. PPG</p>
                                <p className="text-4xl font-bold text-green-400">{player.fantasyPointsPerGame2025Projected?.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {!outlook ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-md text-brand-text font-semibold">Analyzing {player.name}...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="bg-brand-primary/50 border border-brand-border/50 rounded-lg p-4">
                                <h2 className="text-xl font-bold text-brand-text mb-3">Season Outlook</h2>
                                <p className="text-brand-subtle leading-relaxed mb-4 text-sm">{outlook.summary}</p>
                                <div className="border-t border-brand-border pt-4">
                                     <div className="flex items-center gap-3 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <h3 className="text-lg font-bold text-brand-text">Final Verdict</h3>
                                    </div>
                                    <p className="text-brand-subtle text-sm font-medium">{outlook.verdict}</p>
                                </div>
                            </div>
                            
                            <RiskRewardGauge score={outlook.riskRewardScore} />
                            
                            <div className="space-y-4">
                                <OutlookCard title="Upside" content={outlook.upside} icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                } />
                                <OutlookCard title="Downside" content={outlook.downside} icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                } />
                            </div>

                            <StatComparisonChart
                                stats2024={player.stats2024}
                                stats2025={player.stats2025Projected}
                                position={player.position}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PlayerAnalyticsWorkstation;
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

const KeyFactors: React.FC<{ modifiers: Player['projectionModifiers'] }> = ({ modifiers }) => {
    if (!modifiers || (modifiers.catalysts.length === 0 && modifiers.concerns.length === 0)) {
        return null;
    }

    return (
        <div className="bg-brand-primary/50 border border-brand-border/50 rounded-lg p-4">
            <h2 className="text-xl font-bold text-brand-text mb-3">Key Factors & Modifiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-green-400 flex items-center gap-2 mb-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        Catalysts
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-brand-subtle">
                         {modifiers.catalysts.length > 0 ? modifiers.catalysts.map((c, i) => <li key={i}>{c}</li>) : <li>None</li>}
                    </ul>
                </div>
                 <div>
                    <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.707-11.707a1 1 0 00-1.414 0L9 7.586V11a1 1 0 102 0V7.586l1.293 1.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
                        </svg>
                        Concerns
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-brand-subtle">
                        {modifiers.concerns.length > 0 ? modifiers.concerns.map((c, i) => <li key={i}>{c}</li>) : <li>None</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const PlayerAnalyticsWorkstation: React.FC<PlayerAnalyticsWorkstationProps> = ({ player, outlook, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    if (!player) {
        return null;
    }

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
                aria-hidden="true"
            ></div>

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
                    <div className="bg-brand-primary/50 border border-brand-border/50 rounded-lg p-4 mb-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-brand-text">{player.name}</h2>
                                <div className="flex items-center gap-4 mt-2 flex-wrap">
                                    <p className="text-lg font-semibold text-brand-accent">{player.position} - {player.team}</p>
                                    <p className="text-sm font-bold bg-gray-600 px-2 py-1 rounded text-gray-200">TIER {player.tier}</p>
                                    <p className="text-sm font-bold bg-brand-primary px-2 py-1 rounded text-brand-subtle">BYE {player.byeWeek}</p>
                                </div>
                                <p className="text-sm font-semibold text-sky-300 mt-2 bg-sky-900/50 px-2 py-1 rounded-md inline-block" title={player.archetype}>{player.archetype}</p>
                            </div>
                            <div className="text-center md:text-right">
                                <p className="text-xs text-brand-subtle">2024 PROJ. PPG</p>
                                <p className="text-4xl font-bold text-green-400">{player.fantasyPointsPerGame2024Projected?.toFixed(2)}</p>
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

                            <KeyFactors modifiers={player.projectionModifiers} />
                            
                            <div className="bg-brand-primary/50 border border-brand-border/50 rounded-lg p-4">
                                <h3 className="text-lg font-bold text-brand-text mb-2 flex items-center gap-2">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 2a6 6 0 00-6 6c0 1.887 1.12 3.526 2.735 4.316C6.54 13.376 8.18 14 10 14c1.82 0 3.46-.624 4.265-1.684C15.88 11.526 17 9.887 17 8a7 7 0 00-7-7h-1z" clipRule="evenodd" />
                                        <path d="M10 2a6 6 0 00-6 6c0 1.887 1.12 3.526 2.735 4.316C6.54 13.376 8.18 14 10 14c1.82 0 3.46-.624 4.265-1.684C15.88 11.526 17 9.887 17 8a7 7 0 00-7-7h-1z" opacity=".5" />
                                        <path d="M10 15c-1.887 0-3.526-1.12-4.316-2.735C4.624 11.46 4 9.82 4 8a6 6 0 016-6v1z" fill="#FBBF24" />
                                        <path d="M10 15c-1.887 0-3.526-1.12-4.316-2.735C4.624 11.46 4 9.82 4 8a6 6 0 016-6v1z" opacity=".5" />
                                    </svg>
                                    Expert Consensus
                                </h3>
                                <p className="text-brand-subtle text-sm">{outlook.expertConsensus}</p>
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
                                stats2023={player.stats2023}
                                stats2024Projected={player.stats2024Projected}
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
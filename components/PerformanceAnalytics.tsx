import React from 'react';
import type { AnalyticsData, PositionalAdvantage } from '../types';

interface PerformanceAnalyticsProps {
    analyticsData: AnalyticsData | null;
    onBackToDraft: () => void;
}

const ProgressBar: React.FC<{ yourValue: number, leagueValue: number }> = ({ yourValue, leagueValue }) => {
    const max = Math.max(yourValue, leagueValue) * 1.2;
    const yourWidth = max > 0 ? (yourValue / max) * 100 : 0;
    const leagueWidth = max > 0 ? (leagueValue / max) * 100 : 0;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-brand-text">Your Team</span>
                <span className="text-sm font-bold text-brand-accent">{yourValue.toFixed(1)}</span>
            </div>
            <div className="w-full bg-brand-primary rounded-full h-2.5">
                <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${yourWidth}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-semibold text-brand-text">League Avg</span>
                <span className="text-sm font-bold text-brand-subtle">{leagueValue.toFixed(1)}</span>
            </div>
            <div className="w-full bg-brand-primary rounded-full h-2.5">
                <div className="bg-brand-subtle h-2.5 rounded-full" style={{ width: `${leagueWidth}%` }}></div>
            </div>
        </div>
    );
};


const PositionalCard: React.FC<{ advantage: PositionalAdvantage }> = ({ advantage }) => {
    return (
        <div className="bg-brand-secondary border border-brand-border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-brand-text">{advantage.position}</h3>
                <span className="font-semibold bg-brand-primary px-3 py-1 rounded-full text-brand-subtle">Rank: <span className="text-brand-text font-bold">{advantage.rank}</span></span>
            </div>
            <ProgressBar yourValue={advantage.yourPPG} leagueValue={advantage.leagueAveragePPG} />
        </div>
    );
};

const RosterCompositionCard: React.FC<{ archetypes: Record<string, number> }> = ({ archetypes }) => {
    const sortedArchetypes = Object.entries(archetypes).sort(([, a], [, b]) => b - a);

    if (sortedArchetypes.length === 0) {
        return null;
    }

    return (
         <div className="bg-brand-secondary border border-brand-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-brand-text mb-4">Roster Composition</h2>
            <div className="space-y-3">
                {sortedArchetypes.map(([archetype, count]) => (
                    <div key={archetype} className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-brand-text">{archetype}</span>
                        <span className="font-bold bg-brand-primary px-2 py-0.5 rounded-md text-brand-accent">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ analyticsData, onBackToDraft }) => {

    if (!analyticsData) {
        return (
             <div className="min-h-screen bg-brand-primary flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const { teamAnalysis, positionalAdvantages } = analyticsData;

    return (
        <div className="min-h-screen bg-brand-primary text-brand-text animate-fade-in">
            <header className="bg-brand-secondary border-b border-brand-border shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                     <h1 className="text-xl md:text-2xl font-bold text-brand-text">Performance Analytics Suite</h1>
                     <button
                        type="button"
                        onClick={onBackToDraft}
                        className="bg-brand-accent text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
                    >
                        &larr; Back to Draft
                    </button>
                </div>
            </header>
            <main className="container mx-auto p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Grade & Insights */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-brand-secondary border border-brand-border rounded-lg p-6 text-center">
                            <p className="text-8xl font-bold text-brand-accent">{teamAnalysis.grade}</p>
                            <p className="text-2xl font-semibold text-brand-text mt-2">{teamAnalysis.title}</p>
                            <p className="text-brand-subtle mt-4 text-left">{teamAnalysis.summary}</p>
                        </div>
                        <div className="bg-brand-secondary border border-brand-border rounded-lg p-6">
                            <h2 className="text-xl font-bold text-brand-text mb-4">AI-Generated Team Insights</h2>
                            <ul className="space-y-3 list-disc list-inside text-brand-subtle">
                                {teamAnalysis.insights.map((insight, index) => (
                                    <li key={index}><span className="text-brand-text">{insight}</span></li>
                                ))}
                            </ul>
                        </div>
                         <RosterCompositionCard archetypes={teamAnalysis.archetypeCounts} />
                    </div>

                    {/* Right Column: Positional Breakdown */}
                    <div className="lg:col-span-2">
                         <div className="bg-brand-secondary border border-brand-border rounded-lg p-6">
                            <h2 className="text-xl font-bold text-brand-text mb-4">Positional Breakdown</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {positionalAdvantages.map(advantage => (
                                    <PositionalCard key={advantage.position} advantage={advantage} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PerformanceAnalytics;
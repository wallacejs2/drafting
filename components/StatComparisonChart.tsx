import React from 'react';
import type { Stats } from '../types';
import { Position } from '../types';

interface StatComparisonChartProps {
    stats2024: Stats;
    stats2025: Stats | undefined;
    position: Position;
}

const Bar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
    const width = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-brand-subtle w-8">{label}</span>
            <div className="flex-grow bg-brand-primary rounded-full h-4">
                <div
                    className={`h-4 rounded-full ${color} flex items-center justify-end pr-2 transition-all duration-500 ease-out`}
                    style={{ width: `${width}%` }}
                >
                    <span className="text-xs font-bold text-white mix-blend-difference">{value.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};


const StatGroup: React.FC<{ title: string; value2024: number; value2025: number }> = ({ title, value2024, value2025 }) => {
    const maxValue = Math.max(value2024, value2025, 0) * 1.1;

    return (
        <div>
            <h4 className="text-sm font-semibold text-brand-text mb-2">{title}</h4>
            <div className="space-y-1.5">
                <Bar value={value2024} maxValue={maxValue} color="bg-brand-subtle" label="2024" />
                <Bar value={value2025} maxValue={maxValue} color="bg-brand-accent" label="2025" />
            </div>
        </div>
    );
};


const StatComparisonChart: React.FC<StatComparisonChartProps> = ({ stats2024, stats2025, position }) => {
    if (!stats2025) return null;

    const statsToCompare: { title: string; key: keyof Stats }[] = [];

    switch (position) {
        case Position.QB:
            statsToCompare.push({ title: 'Passing Yards', key: 'passingYards' });
            statsToCompare.push({ title: 'Passing TDs', key: 'passingTds' });
            statsToCompare.push({ title: 'Rushing Yards', key: 'rushingYards' });
            break;
        case Position.RB:
            statsToCompare.push({ title: 'Rushing Yards', key: 'rushingYards' });
            statsToCompare.push({ title: 'Rushing TDs', key: 'rushingTds' });
            statsToCompare.push({ title: 'Receptions', key: 'receptions' });
            statsToCompare.push({ title: 'Receiving Yards', key: 'receivingYards' });
            break;
        case Position.WR:
        case Position.TE:
            statsToCompare.push({ title: 'Receptions', key: 'receptions' });
            statsToCompare.push({ title: 'Receiving Yards', key: 'receivingYards' });
            statsToCompare.push({ title: 'Receiving TDs', key: 'receivingTds' });
            break;
        default:
            return <p className="text-center text-brand-subtle text-sm p-4">No detailed stat comparison for this position.</p>;
    }

    return (
        <div className="bg-brand-secondary border border-brand-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-brand-text mb-4">Season Comparison Analysis</h2>
            <div className="space-y-6">
                {statsToCompare.map(({ title, key }) => (
                    <StatGroup
                        key={key}
                        title={title}
                        value2024={stats2024[key] as number ?? 0}
                        value2025={stats2025[key] as number ?? 0}
                    />
                ))}
            </div>
        </div>
    );
};

export default StatComparisonChart;

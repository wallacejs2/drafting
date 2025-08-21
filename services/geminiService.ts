import type { Player, AIAnalysis, TeamAnalysis, PositionalAdvantage, PlayerOutlook } from '../types';

export const getDraftAnalysis = (
    myRoster: Player[],
    availablePlayers: Player[],
    draftedPlayers: Player[],
    myCurrentPick: number,
    myNextPick: number,
    teamsPickingBeforeNext: number[]
): AIAnalysis => {
    const primary = availablePlayers[0] ?? null;
    const alternatives = availablePlayers.slice(1, 3);
    
    const picksBeforeNext = myNextPick > 0 ? myNextPick - myCurrentPick - 1 : 0;
    const predictions = availablePlayers.slice(1, 1 + Math.max(0, picksBeforeNext)).map(p => p.name);

    const posScores: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0 };
    const rosterCounts: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0 };
    myRoster.forEach(p => {
        if (p.position in rosterCounts) {
            rosterCounts[p.position]++;
        }
    });

    posScores.QB = rosterCounts.QB === 0 ? 100 : rosterCounts.QB === 1 ? 20 : 5;
    posScores.RB = rosterCounts.RB < 2 ? 100 - (rosterCounts.RB * 30) : 30;
    posScores.WR = rosterCounts.WR < 2 ? 100 - (rosterCounts.WR * 30) : 30;
    posScores.TE = rosterCounts.TE === 0 ? 90 : rosterCounts.TE === 1 ? 20 : 5;

    const top5 = availablePlayers.slice(0, 5);
    top5.forEach((p, index) => {
        if (p.position in posScores) {
            posScores[p.position] += (20 - index * 3);
        }
    });

    const totalScore = Object.values(posScores).reduce((sum, score) => sum + score, 0);
    const positionalAnalysis: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0 };

    if (totalScore > 0) {
        positionalAnalysis.QB = Math.round((posScores.QB / totalScore) * 100);
        positionalAnalysis.RB = Math.round((posScores.RB / totalScore) * 100);
        positionalAnalysis.WR = Math.round((posScores.WR / totalScore) * 100);
        positionalAnalysis.TE = Math.round((posScores.TE / totalScore) * 100);
    
        const currentTotal = Object.values(positionalAnalysis).reduce((sum, val) => sum + val, 0);
        if (currentTotal !== 100) {
            const diff = 100 - currentTotal;
            const maxPos = Object.keys(positionalAnalysis).reduce((a, b) => positionalAnalysis[a] > positionalAnalysis[b] ? a : b);
            positionalAnalysis[maxPos] += diff;
        }
    } else {
        positionalAnalysis.QB = 25;
        positionalAnalysis.RB = 25;
        positionalAnalysis.WR = 25;
        positionalAnalysis.TE = 25;
    }


    if (!primary) {
        return {
           primary: { name: "N/A", reasoning: "No available players to analyze." },
           alternatives: [],
           predictions: [],
           positionalAnalysis: { QB: 25, RB: 25, WR: 25, TE: 25 }
        };
   }

    return {
        primary: {
            name: primary.name,
            reasoning: `${primary.name} is the top player available based on 2025 projections. He offers the highest potential fantasy point output at this stage of the draft.`
        },
        alternatives: alternatives.map(p => ({
            name: p.name,
            reasoning: `Another elite option with strong projected performance.`
        })),
        predictions,
        positionalAnalysis,
    };
};


export const getTeamAnalysis = (
    myRoster: Player[],
    positionalBreakdown: PositionalAdvantage[],
    totalTeams: number,
): TeamAnalysis => {
    const avgRank = positionalBreakdown.length > 0 
        ? positionalBreakdown.reduce((sum, pos) => sum + pos.rank, 0) / positionalBreakdown.length
        : totalTeams;
    
    let grade = 'C';
    if (avgRank <= totalTeams * 0.25) grade = 'A';
    else if (avgRank <= totalTeams * 0.4) grade = 'B';
    else if (avgRank <= totalTeams * 0.6) grade = 'C';
    else grade = 'D';

    const strengths = positionalBreakdown.filter(p => p.rank <= Math.ceil(totalTeams / 3));
    const weaknesses = positionalBreakdown.filter(p => p.rank > Math.floor(totalTeams / 3) * 2);

    let title = 'Balanced Squad';
    if (strengths.length > weaknesses.length && strengths.length > 0) {
        title = `${strengths[0].position} Powerhouse`;
    } else if (weaknesses.length > strengths.length && weaknesses.length > 1) {
        title = 'Rebuilding Project';
    }

    let summary = `This team has a solid foundation. Its average positional rank of ${avgRank.toFixed(1)} puts it in a competitive spot. `;
    if (strengths.length > 0) {
        summary += `The clear strength is at ${strengths.map(p => p.position).join(', ')}. `;
    }
    if (weaknesses.length > 0) {
        summary += `The main area for improvement is ${weaknesses.map(p => p.position).join(', ')}.`;
    }

    const insights = [];
    if (strengths.length > 0) {
        insights.push(`Leverage your strength at ${strengths[0].position} in potential trades.`);
    }
    if (weaknesses.length > 0) {
        insights.push(`Focus on the waiver wire to improve depth at ${weaknesses[0].position}.`);
    }
    insights.push('Your roster shows a good balance between high-floor and high-upside players.');
    insights.push('Monitor rookie performance early in the season for potential breakout stars.');
    
    return {
        grade,
        title,
        summary,
        insights: insights.slice(0, 4)
    };
};

export const getPlayerOutlook = (player: Player): PlayerOutlook => {
    let riskRewardScore = 5;
    if (player.injuryRisk === 'Low') riskRewardScore -= 2;
    if (player.injuryRisk === 'High') riskRewardScore += 3;
    
    if (player.gamesPlayed2024 === 0) {
        riskRewardScore += 2;
    }
    
    riskRewardScore = Math.max(1, Math.min(10, riskRewardScore));
    
    const summary = `${player.name} is a ${player.position} for the ${player.team} with a ${player.injuryRisk.toLowerCase()} injury risk profile. Based on last year's performance and their current team situation, they are projected for a solid season, expecting to play around ${player.gamesPlayed2025Projected} games. They represent a key piece of their team's offense.`;
    const upside = `The ceiling for ${player.name} is high. If they can exceed their projected games played and see an increase in offensive volume, they have the potential to finish as a top-tier player at their position.`;
    const downside = `The main concern is their ${player.injuryRisk.toLowerCase()} injury designation. Any missed time could significantly impact their fantasy output, and they face competition for targets/carries within their offense.`;
    const verdict = `Overall, ${player.name} is a strong fantasy asset. They are a reliable starter with a mix of a safe floor and considerable upside, making them a solid pick around their ADP of ${player.adp ?? 'N/A'}.`;

    return {
        summary,
        upside,
        downside,
        verdict,
        riskRewardScore
    };
};
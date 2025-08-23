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
    
    let strategicNarrative = '';
    const needs = [];
    if (rosterCounts.QB === 0) needs.push('QB');
    if (rosterCounts.RB < 2) needs.push('RB');
    if (rosterCounts.WR < 2) needs.push('WR');
    if (rosterCounts.TE === 0) needs.push('TE');

    if (needs.length > 0) {
        strategicNarrative += `Your primary roster needs are at ${needs.join(', ')}. `;
    } else {
        strategicNarrative += 'Your core starting positions are filled. Focus on building depth and targeting the best player available, regardless of position. ';
    }
    
    if (primary) {
        if (needs.includes(primary.position)) {
            strategicNarrative += `${primary.name} perfectly fills a position of need and is the top-ranked player available. `;
        } else {
            strategicNarrative += `While not a primary need, ${primary.name} represents the best value on the board by a significant margin. `;
        }
    }

    if (!primary) {
        return {
           primary: { name: "N/A", reasoning: "No available players to analyze." },
           alternatives: [],
           predictions: [],
           positionalAnalysis: { QB: 25, RB: 25, WR: 25, TE: 25 },
           strategicNarrative: "The draft is complete. Time to analyze your new team!"
        };
   }

    return {
        primary: {
            name: primary.name,
            reasoning: `${primary.name} is the top player available based on our blended grade, which considers projections, value, and tier. He is a premier '${primary.archetype}' and offers elite potential at this stage of the draft.`
        },
        alternatives: alternatives.map(p => ({
            name: p.name,
            reasoning: `A strong '${p.archetype}' in a high tier with excellent projected performance.`
        })),
        predictions,
        positionalAnalysis,
        strategicNarrative
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

    const archetypeCounts: Record<string, number> = myRoster.reduce((acc, player) => {
        if (player.archetype) {
            acc[player.archetype] = (acc[player.archetype] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const sortedArchetypes = Object.entries(archetypeCounts).sort(([, a], [, b]) => b - a);

    let title = 'Balanced Build';
    if (sortedArchetypes.length > 0) {
        const primaryArchetype = sortedArchetypes[0][0];
        if (primaryArchetype.includes('Konami') || primaryArchetype.includes('Speedster')) {
            title = 'High-Upside Roster';
        } else if (primaryArchetype.includes('PPR') || primaryArchetype.includes('Possession')) {
            title = 'High-Floor Squad';
        } else if (primaryArchetype.includes('Bell-cow') || primaryArchetype.includes('Workhorse')) {
            title = 'Workhorse-Driven Team';
        }
    }

    let summary = `This team has a solid foundation, grading out as a ${grade} with an average positional rank of ${avgRank.toFixed(1)}. `;
    if (sortedArchetypes.length > 0) {
        summary += `Your drafting strategy has leaned heavily towards '${sortedArchetypes[0][0]}' players, which defines your roster's core identity. `;
    }
    if (strengths.length > 0) {
        summary += `The clear statistical strength is at ${strengths.map(p => p.position).join(', ')}. `;
    }
    if (weaknesses.length > 0) {
        summary += `The main area for statistical improvement is ${weaknesses.map(p => p.position).join(', ')}.`;
    }

    const insights = [];
    if (Object.keys(archetypeCounts).length > 2) {
        insights.push(`Your roster is well-diversified with multiple player archetypes, giving you flexibility for weekly matchups.`);
    }
    const hasHighFloor = myRoster.some(p => p.archetype.includes('PPR') || p.archetype.includes('Possession') || p.archetype.includes('Bell-cow'));
    const hasHighCeiling = myRoster.some(p => p.archetype.includes('Konami') || p.archetype.includes('Speedster') || p.archetype.includes('Boom/Bust'));
    
    if (hasHighFloor && !hasHighCeiling) {
        insights.push("Your team has a very safe floor but may lack the week-winning upside of more explosive archetypes. Look for high-ceiling players on waivers.");
    } else if (!hasHighFloor && hasHighCeiling) {
        insights.push("You've built a high-upside 'boom/bust' team. Your weekly scores could be volatile, but you have the potential to dominate any given week.");
    } else {
         insights.push("Your team shows a good balance between high-floor workhorses and high-ceiling explosive players.");
    }
     if (weaknesses.length > 0) {
        insights.push(`Focus on the waiver wire to improve depth at ${weaknesses[0].position}.`);
    } else if (strengths.length > 0) {
        insights.push(`Leverage your positional strength at ${strengths[0].position} in potential trades to address any depth concerns.`);
    }

    return {
        grade,
        title,
        summary,
        insights: insights.slice(0, 4),
        archetypeCounts,
    };
};

export const getPlayerOutlook = (player: Player): PlayerOutlook => {
    let riskRewardScore = 5;
    if (player.injuryRisk === 'Low') riskRewardScore -= 2;
    if (player.injuryRisk === 'High') riskRewardScore += 3;

    if (player.opportunityShare === 'Low') riskRewardScore += 2;
    if (player.opportunityShare === 'High') riskRewardScore -= 1;
    
    if (player.gamesPlayed2024 === 0) {
        riskRewardScore += 1;
    }
    
    riskRewardScore = Math.max(1, Math.min(10, riskRewardScore));
    
    const summary = `${player.name} is a Tier ${player.tier} ${player.position} for the ${player.team}, fitting the '${player.archetype}' profile. With a ${player.injuryRisk.toLowerCase()} injury risk, they are projected for a solid season, expecting to play around ${player.gamesPlayed2025Projected} games and are a key piece of their team's offense.`;
    
    let expertConsensus = `Industry consensus is high on ${player.name}, citing his ${player.opportunityShare.toLowerCase()} opportunity share as a key factor for a productive season. `;
    if (player.espnRank && player.adp) {
        if (player.espnRank < player.adp - 5) {
            expertConsensus += `ESPN is notably more bullish, ranking him at ${player.espnRank}, suggesting he could be a value at his current ADP of ${player.adp}. `;
        } else if (player.espnRank > player.adp + 5) {
             expertConsensus += `However, ESPN is slightly more cautious with a rank of ${player.espnRank}, indicating some may see him as a slight reach at his ADP of ${player.adp}. `;
        } else {
            expertConsensus += `His rank across major platforms is consistent with his ADP of ${player.adp}. `;
        }
    }
    if (player.strengthOfSchedule <= 10) {
        expertConsensus += `Analysts also point to one of the league's easiest schedules as a potential tailwind for his fantasy production.`
    } else if (player.strengthOfSchedule >= 23) {
        expertConsensus += `A challenging schedule is a frequently mentioned concern, but his talent may transcend difficult matchups.`
    }

    const upside = `The ceiling for ${player.name} is a top-tier finish. His '${player.opportunityShare}' opportunity share means he'll dominate touches/targets, and his '${player.archetype}' profile gives him week-winning potential.`;
    const downside = `The primary risk is his ${player.injuryRisk.toLowerCase()} injury history. Additionally, a tough schedule or a failure to live up to his '${player.archetype}' role could cap his weekly ceiling.`;
    const verdict = `Overall, ${player.name} is a strong fantasy asset. They are a reliable starter with a mix of a safe floor due to volume and considerable upside, making them a solid pick around their ADP of ${player.adp ?? 'N/A'}.`;

    return {
        summary,
        upside,
        downside,
        verdict,
        riskRewardScore,
        expertConsensus
    };
};
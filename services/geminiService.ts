import { GoogleGenAI, Type } from "@google/genai";
import type { Player, Stats, AIAnalysis, TeamAnalysis, PositionalAdvantage, PlayerOutlook } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const projectionSchema = {
    type: Type.OBJECT,
    properties: {
        players: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER },
                    gamesPlayed2025Projected: { type: Type.INTEGER },
                    stats2025Projected: {
                        type: Type.OBJECT,
                        properties: {
                            passingYards: { type: Type.INTEGER },
                            passingTds: { type: Type.INTEGER },
                            interceptions: { type: Type.INTEGER },
                            rushingYards: { type: Type.INTEGER },
                            rushingTds: { type: Type.INTEGER },
                            receptions: { type: Type.INTEGER },
                            receivingYards: { type: Type.INTEGER },
                            receivingTds: { type: Type.INTEGER },
                            fumblesLost: { type: Type.INTEGER },
                            fieldGoalsMade0to39: { type: Type.INTEGER },
                            fieldGoalsMade40to49: { type: Type.INTEGER },
                            fieldGoalsMade50plus: { type: Type.INTEGER },
                            extraPointsMade: { type: Type.INTEGER },
                            sacks: { type: Type.INTEGER },
                            defensiveInterceptions: { type: Type.INTEGER },
                            fumblesRecovered: { type: Type.INTEGER },
                            safeties: { type: Type.INTEGER },
                            defensiveTds: { type: Type.INTEGER },
                            pointsAllowed: { type: Type.INTEGER },
                            blockedKicks: { type: Type.INTEGER },
                        }
                    }
                }
            }
        }
    }
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        primary: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                reasoning: { type: Type.STRING },
            },
            required: ['name', 'reasoning']
        },
        alternatives: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    reasoning: { type: Type.STRING },
                },
                required: ['name', 'reasoning']
            }
        },
        predictions: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            }
        },
        positionalAnalysis: {
            type: Type.OBJECT,
            properties: {
                QB: { type: Type.INTEGER, description: 'Percentage chance I should draft a QB.' },
                RB: { type: Type.INTEGER, description: 'Percentage chance I should draft an RB.' },
                WR: { type: Type.INTEGER, description: 'Percentage chance I should draft a WR.' },
                TE: { type: Type.INTEGER, description: 'Percentage chance I should draft a TE.' },
            },
            required: ['QB', 'RB', 'WR', 'TE']
        }
    }
};

const teamAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        grade: { type: Type.STRING, description: "A letter grade for the team, e.g., 'A-', 'B+', 'C'." },
        title: { type: Type.STRING, description: "A short, catchy title for the analysis, e.g., 'High-Upside Squad', 'Balanced Contender'." },
        summary: { type: Type.STRING, description: "A 2-3 sentence paragraph summarizing the team's overall strengths and weaknesses." },
        insights: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: "A list of 3-4 bullet-point strategic insights about the team."
        }
    },
    required: ['grade', 'title', 'summary', 'insights']
};

const playerOutlookSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A 3-4 sentence detailed summary of the player's outlook for the upcoming season." },
        upside: { type: Type.STRING, description: "A 2-sentence analysis of the player's potential upside or ceiling." },
        downside: { type: Type.STRING, description: "A 2-sentence analysis of the player's potential downside or floor, including risks." },
        verdict: { type: Type.STRING, description: "A final 1-2 sentence concluding thought or recommendation on the player's fantasy value." },
        riskRewardScore: { type: Type.INTEGER, description: "A numerical score from 1 (very safe floor) to 10 (very high risk, boom/bust) representing their risk/reward profile." }
    },
    required: ['summary', 'upside', 'downside', 'verdict', 'riskRewardScore']
};


export const getProjections = async (players: Player[]): Promise<Player[]> => {
    const playersForPrompt = players.map(({ id, name, position, team, stats2024, injuryRisk, adp }) => ({
        id, name, position, team, adp, stats2024, injuryRisk
    }));

    const prompt = `
        Act as a world-class fantasy football analyst following ESPN Standard PPR scoring.
        Given the following list of players, their 2024 season stats, assessed injury risk, and their Average Draft Position (ADP), provide realistic projections for their 2025 season, including the number of games they are projected to play.
        Consider all factors: player age, team situation, potential for breakout or regression, offensive scheme, their injury risk, and their ADP (as an indicator of market expectation). A player with a 'High' injury risk should have a lower projected games played (e.g., 12-15 games), while a 'Low' risk player might be projected for a full 17-game season. A 'Medium' risk player would be somewhere in between. For rookies with no 2024 stats, use their ADP and team situation to build a reasonable projection.
        Return the data as a JSON object that matches the provided schema. Only include players from the list.

        Player Data:
        ${JSON.stringify(playersForPrompt, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: projectionSchema,
            },
        });

        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);
        const projectedData = parsed.players as { id: number; stats2025Projected: any; gamesPlayed2025Projected: number }[];

        const playersWithProjections = players.map(player => {
            const projection = projectedData.find(p => p.id === player.id);
            return projection ? { ...player, stats2025Projected: projection.stats2025Projected, gamesPlayed2025Projected: projection.gamesPlayed2025Projected } : player;
        });

        return playersWithProjections;
    } catch (error) {
        console.error("Error fetching projections from Gemini API:", error);
        throw new Error("Failed to fetch projections.");
    }
};

export const getDraftAnalysis = async (
    myRoster: Player[],
    availablePlayers: Player[],
    draftedPlayers: Player[],
    myCurrentPick: number,
    myNextPick: number,
    teamsPickingBeforeNext: number[]
): Promise<AIAnalysis> => {
    const prompt = `
        You are an expert fantasy football draft analyst. It's my turn to pick at pick #${myCurrentPick}. My next pick is #${myNextPick}.

        My Team So Far (${myRoster.length} players):
        ${myRoster.length > 0 ? myRoster.map(p => `${p.name} (${p.position})`).join(', ') : 'No players drafted yet.'}

        Top 15 Available Players (Name, Position, ADP, Injury Risk, 2025 Projected PPG):
        ${availablePlayers.slice(0, 15).map(p => `${p.name} (${p.position}, ADP ${p.adp}, ${p.injuryRisk} Risk, ${p.fantasyPointsPerGame2025Projected?.toFixed(1)})`).join('\n')}

        Teams Picking Before My Next Turn: Teams ${teamsPickingBeforeNext.join(', ')}.

        Your task is to provide expert draft advice in a JSON format.
        1.  **Primary Recommendation**: Analyze my roster needs, the top available talent based on Projected PPG, and their ADP/market value. Recommend the single best player for me to draft right now. Provide a compelling, 2-sentence reason focusing on value, strategy, and risk assessment.
        2.  **Alternative Picks**: Suggest two other strong options. For each, provide a brief, 1-sentence reason, factoring in their potential upside and ADP.
        3.  **Predictions**: Based on standard draft strategy (ADP) and team needs, predict three players from the available list who are most likely to be drafted by the other teams before my next pick at #${myNextPick}. List their names only.
        4.  **Positional Analysis**: Based on my roster, remaining talent (value over replacement), and draft trends, provide a percentage breakdown of which offensive skill position (QB, RB, WR, TE) I should target with this pick. The percentages should sum to 100.

        Adhere strictly to the JSON schema provided.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as AIAnalysis;

    } catch (error: any) {
        console.error("Error fetching draft analysis:", error);
        
        // This fallback logic prevents the app from crashing and provides a useful default.
        const bestPlayer = availablePlayers[0] ?? null;

        if (!bestPlayer) {
             return {
                primary: { name: "N/A", reasoning: "No available players to analyze." },
                alternatives: [],
                predictions: [],
                positionalAnalysis: { QB: 25, RB: 25, WR: 25, TE: 25 }
             };
        }
        
        let reasoning = `Unable to generate AI analysis. However, ${bestPlayer.name} is the best player available based on projections and would be a solid pick here.`;

        // Provide a more specific error message for rate-limiting.
        const errorString = String(error);
        if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED")) {
            reasoning = "AI analysis is temporarily unavailable due to high traffic. Please try again shortly. We're still recommending the top projected player.";
        }
        
        const alternativePlayers = availablePlayers.slice(1, 3);
        const predictionPlayers = availablePlayers.slice(3, 6);

        return {
            primary: {
                name: bestPlayer.name,
                reasoning: reasoning
            },
            alternatives: alternativePlayers.map(p => ({
                name: p.name,
                reasoning: `A strong value pick based on projections.`
            })),
            predictions: predictionPlayers.map(p => p.name),
            // Provide a neutral, non-zero fallback for positional analysis to keep the UI consistent.
            positionalAnalysis: { QB: 25, RB: 35, WR: 30, TE: 10 }
        };
    }
};

export const getTeamAnalysis = async (
    myRoster: Player[],
    positionalBreakdown: PositionalAdvantage[],
    totalTeams: number,
): Promise<TeamAnalysis> => {
    const prompt = `
        You are an expert fantasy football analyst. I have completed my draft in a ${totalTeams}-team league.
        Analyze my roster and its positional strength compared to the rest of the league to provide a team grade and strategic insights.

        My Roster:
        ${myRoster.map(p => `- ${p.name} (${p.position})`).join('\n')}

        Positional Breakdown (My Rank & PPG vs. League Average):
        ${positionalBreakdown.map(pos => `- ${pos.position}: Rank ${pos.rank}/${totalTeams}, My PPG: ${pos.yourPPG.toFixed(1)}, League Avg: ${pos.leagueAveragePPG.toFixed(1)}`).join('\n')}

        Based on this data, provide your analysis in the following JSON format:
        1.  **grade**: A letter grade (e.g., "A-") representing the overall strength of my team.
        2.  **title**: A short, descriptive title for my team (e.g., "Projected Winner", "RB Powerhouse").
        3.  **summary**: A 2-3 sentence summary explaining the grade, highlighting strengths and weaknesses.
        4.  **insights**: A list of 3-4 distinct, actionable insights or observations about my team's construction and strategy moving forward.

        Adhere strictly to the JSON schema provided.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: teamAnalysisSchema,
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as TeamAnalysis;

    } catch (error) {
        console.error("Error fetching team analysis:", error);
        // Fallback
        return {
            grade: 'B',
            title: 'Solid Squad',
            summary: 'AI analysis is currently unavailable. Based on the data, your team appears to have a solid foundation with a good mix of players across positions.',
            insights: [
                'Continue to monitor the waiver wire for breakout candidates.',
                'Your draft appears balanced.',
                'Consider potential trade opportunities to strengthen your weakest position.',
            ]
        };
    }
};

export const getPlayerOutlook = async (player: Player): Promise<PlayerOutlook> => {
    const prompt = `
        You are an expert fantasy football analyst providing a deep-dive analysis on a single player.
        
        Player Details:
        - Name: ${player.name}
        - Position: ${player.position}
        - Team: ${player.team}
        - ADP: ${player.adp ?? 'N/A'}
        - Injury Risk: ${player.injuryRisk}
        
        2024 Stats (${player.gamesPlayed2024} games):
        ${JSON.stringify(player.stats2024, null, 2)}
        
        2025 Projections (${player.gamesPlayed2025Projected} games):
        ${JSON.stringify(player.stats2025Projected, null, 2)}

        Your task is to provide a comprehensive outlook for the player's 2025 season in a JSON format.
        1. **summary**: Write a 3-4 sentence detailed summary. Consider their previous performance, ADP, team context (new coach, new QB, etc.), and their projected role.
        2. **upside**: Describe their ceiling. What is the best-case scenario for this player? What could lead to a breakout season? (2 sentences)
        3. **downside**: Describe their floor. What are the biggest risks? Could they bust? Consider their injury risk, competition for touches, or potential for regression. (2 sentences)
        4. **verdict**: Give a final, concluding recommendation. Is this player a safe pick, a high-risk/high-reward gamble, or something in between? (1-2 sentences)
        5. **riskRewardScore**: Provide a single integer score from 1 to 10. A score of 1 represents a very safe player with a high floor but limited ceiling. A score of 10 represents a classic high-risk, high-reward "boom/bust" player. A score of 5 is a balanced player.

        Adhere strictly to the JSON schema provided.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: playerOutlookSchema,
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as PlayerOutlook;
    } catch (error) {
        console.error(`Error fetching player outlook for ${player.name}:`, error);
        return {
            summary: "AI analysis is currently unavailable. Based on projections, this player is expected to be a solid contributor for their position.",
            upside: "There is potential for this player to outperform their projections if they secure a larger role in the offense.",
            downside: `The primary risk is related to their ${player.injuryRisk.toLowerCase()} injury history and potential competition for targets or carries.`,
            verdict: "A reliable player with a relatively safe floor, making them a dependable choice in the draft.",
            riskRewardScore: 5
        };
    }
};
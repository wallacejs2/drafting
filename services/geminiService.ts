
import { GoogleGenAI, Type } from "@google/genai";
import type { Player, Stats, AIAnalysis } from '../types';

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
                            passingYards: { type: Type.INTEGER, nullable: true },
                            passingTds: { type: Type.INTEGER, nullable: true },
                            interceptions: { type: Type.INTEGER, nullable: true },
                            rushingYards: { type: Type.INTEGER, nullable: true },
                            rushingTds: { type: Type.INTEGER, nullable: true },
                            receptions: { type: Type.INTEGER, nullable: true },
                            receivingYards: { type: Type.INTEGER, nullable: true },
                            receivingTds: { type: Type.INTEGER, nullable: true },
                            fumblesLost: { type: Type.INTEGER, nullable: true },
                            fieldGoalsMade0to39: { type: Type.INTEGER, nullable: true },
                            fieldGoalsMade40to49: { type: Type.INTEGER, nullable: true },
                            fieldGoalsMade50plus: { type: Type.INTEGER, nullable: true },
                            extraPointsMade: { type: Type.INTEGER, nullable: true },
                            sacks: { type: Type.INTEGER, nullable: true },
                            defensiveInterceptions: { type: Type.INTEGER, nullable: true },
                            fumblesRecovered: { type: Type.INTEGER, nullable: true },
                            safeties: { type: Type.INTEGER, nullable: true },
                            defensiveTds: { type: Type.INTEGER, nullable: true },
                            pointsAllowed: { type: Type.INTEGER, nullable: true },
                            blockedKicks: { type: Type.INTEGER, nullable: true },
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


export const getProjections = async (players: Player[]): Promise<Player[]> => {
    const playersForPrompt = players.map(({ id, name, position, team, stats2024, injuryRisk }) => ({
        id, name, position, team, stats2024, injuryRisk
    }));

    const prompt = `
        Act as a world-class fantasy football analyst following ESPN Standard PPR scoring.
        Given the following list of players, their 2024 season stats, and their assessed injury risk, provide realistic projections for their 2025 season, including the number of games they are projected to play.
        Consider factors like player age, team situation, potential for breakout or regression, offensive scheme, and their injury risk. A player with a 'High' injury risk should have a lower projected games played (e.g., 12-15 games), while a 'Low' risk player might be projected for a full 17-game season. A 'Medium' risk player would be somewhere in between.
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

        Top 15 Available Players (Name, Position, Injury Risk, 2025 Projected PPG):
        ${availablePlayers.slice(0, 15).map(p => `${p.name} (${p.position}, ${p.injuryRisk} Risk, ${p.fantasyPointsPerGame2025Projected?.toFixed(1)})`).join('\n')}

        Teams Picking Before My Next Turn: Teams ${teamsPickingBeforeNext.join(', ')}.

        Your task is to provide expert draft advice in a JSON format.
        1.  **Primary Recommendation**: Analyze my roster needs, the top available talent based on Projected PPG, and their injury risk. Recommend the single best player for me to draft right now. Provide a compelling, 2-sentence reason focusing on value, strategy, and risk assessment.
        2.  **Alternative Picks**: Suggest two other strong options. For each, provide a brief, 1-sentence reason, factoring in their potential upside and risk.
        3.  **Predictions**: Based on standard draft strategy and team needs, predict three players from the available list who are most likely to be drafted by the other teams before my next pick at #${myNextPick}. List their names only.
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
        
        const bestPlayer = availablePlayers[0];
        let reasoning = `Unable to generate AI analysis. However, ${bestPlayer.name} is the best player available based on projections and would be a solid pick here.`;

        // Provide a more specific error message for rate-limiting.
        const errorString = String(error);
        if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED")) {
            reasoning = "AI analysis is temporarily unavailable due to high traffic. Please try again shortly. We're still recommending the top projected player.";
        }

        return {
            primary: {
                name: bestPlayer.name,
                reasoning: reasoning
            },
            alternatives: availablePlayers.slice(1, 3).map(p => ({
                name: p.name,
                reasoning: `A strong value pick based on projections.`
            })),
            predictions: [],
            // Provide a neutral, non-zero fallback for positional analysis to keep the UI consistent.
            positionalAnalysis: { QB: 25, RB: 35, WR: 30, TE: 10 }
        };
    }
};

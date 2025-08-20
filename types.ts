export enum Position {
    QB = 'QB',
    RB = 'RB',
    WR = 'WR',
    TE = 'TE',
    K = 'K',
    DST = 'DST',
}

export interface Stats {
    passingYards?: number;
    passingTds?: number;
    interceptions?: number;
    rushingYards?: number;
    rushingTds?: number;
    receptions?: number;
    receivingYards?: number;
    receivingTds?: number;
    fumblesLost?: number;
    // For Kicker
    fieldGoalsMade0to39?: number;
    fieldGoalsMade40to49?: number;
    fieldGoalsMade50plus?: number;
    extraPointsMade?: number;
    // For DST
    sacks?: number;
    defensiveInterceptions?: number;
    fumblesRecovered?: number;
    safeties?: number;
    defensiveTds?: number;
    pointsAllowed?: number;
    blockedKicks?: number;
}

export interface Player {
    id: number;
    name: string;
    position: Position;
    team: string;
    injuryRisk: 'Low' | 'Medium' | 'High';
    adp?: number;
    stats2024: Stats;
    gamesPlayed2024: number;
    stats2025Projected?: Stats;
    gamesPlayed2025Projected?: number;
    fantasyPoints2024?: number;
    fantasyPointsPerGame2024?: number;
    fantasyPoints2025Projected?: number;
    fantasyPointsPerGame2025Projected?: number;
    drafted: boolean;
    draftPick?: number;
    teamNumber?: number;
}

export interface AIRecommendation {
  name: string;
  reasoning: string;
}

export interface AIAnalysis {
  primary: AIRecommendation;
  alternatives: AIRecommendation[];
  predictions: string[];
  positionalAnalysis: Record<string, number>;
}

export interface PositionalAdvantage {
  position: Position | string;
  yourPPG: number;
  leagueAveragePPG: number;
  rank: number;
}

export interface TeamAnalysis {
  grade: string;
  title: string;
  summary: string;
  insights: string[];
}

export interface AnalyticsData {
  teamAnalysis: TeamAnalysis;
  positionalAdvantages: PositionalAdvantage[];
}

export interface PlayerOutlook {
  summary: string;
  upside: string;
  downside: string;
  verdict: string;
  riskRewardScore: number;
}
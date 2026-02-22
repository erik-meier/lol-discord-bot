import { REGIONS } from '../../models/riot-api/index.js';

/**
 * Utility functions for Riot API operations
 */
export class RiotApiUtils {
    /**
     * Validates if a region is supported
     */
    public static isValidRegion(region: string): boolean {
        return Object.prototype.hasOwnProperty.call(REGIONS, region.toLowerCase());
    }

    /**
     * Gets all supported regions
     */
    public static getSupportedRegions(): string[] {
        return Object.keys(REGIONS);
    }

    /**
     * Normalizes a summoner name (removes spaces, converts to lowercase)
     */
    public static normalizeSummonerName(name: string): string {
        return name.trim().toLowerCase().replace(/\s+/g, '');
    }

    /**
     * Formats a Riot ID from gameName and tagLine
     */
    public static formatRiotId(gameName: string, tagLine: string): string {
        return `${gameName}#${tagLine}`;
    }

    /**
     * Parses a Riot ID string into gameName and tagLine
     */
    public static parseRiotId(riotId: string): { gameName: string; tagLine: string } | null {
        const parts = riotId.split('#');
        if (parts.length !== 2) {
            return null;
        }
        return {
            gameName: parts[0].trim(),
            tagLine: parts[1].trim()
        };
    }

    /**
     * Validates a summoner name or Riot ID format
     * Accepts both: "SummonerName" and "GameName#TAG"
     */
    public static isValidSummonerName(name: string): boolean {
        if (!name || name.length < 3) {
            return false;
        }
        
        // If it contains #, validate as Riot ID
        if (name.includes('#')) {
            const parsed = this.parseRiotId(name);
            if (!parsed) return false;
            
            // Validate gameName (3-16 characters)
            if (parsed.gameName.length < 3 || parsed.gameName.length > 16) {
                return false;
            }
            
            // Validate tagLine (3-5 characters, alphanumeric)
            if (parsed.tagLine.length < 2 || parsed.tagLine.length > 5) {
                return false;
            }
            
            return true;
        }
        
        // Legacy summoner name validation (3-16 characters)
        if (name.length > 16) {
            return false;
        }
        
        // Check for valid characters (letters, numbers, spaces, and some special characters)
        const validPattern = /^[a-zA-Z0-9\s._-]+$/;
        return validPattern.test(name);
    }

    /**
     * Gets the display name for a region
     */
    public static getRegionDisplayName(region: string): string {
        const regionMap: Record<string, string> = {
            'na1': 'North America',
            'euw1': 'Europe West',
            'eune1': 'Europe Nordic & East',
            'kr': 'Korea',
            'jp1': 'Japan',
            'br1': 'Brazil',
            'la1': 'Latin America North',
            'la2': 'Latin America South',
            'oc1': 'Oceania',
            'tr1': 'Turkey',
            'ru': 'Russia',
            'ph2': 'Philippines',
            'sg2': 'Singapore',
            'th2': 'Thailand',
            'tw2': 'Taiwan',
            'vn2': 'Vietnam'
        };
        
        return regionMap[region.toLowerCase()] || region.toUpperCase();
    }

    /**
     * Formats LP (League Points) with appropriate suffix
     */
    public static formatLP(lp: number): string {
        return `${lp} LP`;
    }

    /**
     * Calculates win rate percentage
     */
    public static calculateWinRate(wins: number, losses: number): number {
        const total = wins + losses;
        if (total === 0) return 0;
        return Math.round((wins / total) * 100);
    }

    /**
     * Formats win rate as a string
     */
    public static formatWinRate(wins: number, losses: number): string {
        const winRate = this.calculateWinRate(wins, losses);
        return `${winRate}%`;
    }

    /**
     * Gets the rank display string (e.g., "Gold II")
     */
    public static formatRank(tier: string, rank: string): string {
        if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier.toUpperCase())) {
            return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
        }
        return `${tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()} ${rank}`;
    }

    /**
     * Gets queue type display name
     */
    public static getQueueDisplayName(queueType: string): string {
        const queueMap: Record<string, string> = {
            'RANKED_SOLO_5x5': 'Ranked Solo/Duo',
            'RANKED_FLEX_SR': 'Ranked Flex',
            'RANKED_FLEX_TT': 'Ranked Flex 3v3'
        };
        
        return queueMap[queueType] || queueType;
    }

    /**
     * Converts champion mastery level to display string with emojis
     */
    public static formatMasteryLevel(level: number): string {
        const masteryEmojis: Record<number, string> = {
            1: '🥉',
            2: '🥉',
            3: '🥈',
            4: '🥈',
            5: '🥇',
            6: '💎',
            7: '👑'
        };
        
        return `${masteryEmojis[level] || '⭐'} Level ${level}`;
    }

    /**
     * Formats champion mastery points with appropriate suffix
     */
    public static formatMasteryPoints(points: number): string {
        if (points >= 1000000) {
            return `${(points / 1000000).toFixed(1)}M`;
        } else if (points >= 1000) {
            return `${(points / 1000).toFixed(1)}k`;
        }
        return points.toString();
    }

    /**
     * Formats time since last played
     */
    public static formatTimeSince(timestamp: number): string {
        const now = Date.now();
        const diff = now - timestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
            }
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else if (days < 30) {
            const weeks = Math.floor(days / 7);
            return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
        } else {
            const months = Math.floor(days / 30);
            return `${months} month${months !== 1 ? 's' : ''} ago`;
        }
    }
}
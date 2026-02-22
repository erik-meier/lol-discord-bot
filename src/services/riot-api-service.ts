import { Response } from 'node-fetch';
import { createRequire } from 'node:module';
import { URL } from 'node:url';

import { HttpService, Logger } from './index.js';
import {
    CachedData,
    ChampionMastery,
    LeagueEntry,
    Match,
    MatchHistoryParams,
    RegionConfig,
    REGIONS,
    RiotAccount,
    RiotApiError,
    RiotSummoner,
    SummonerLookupParams
} from '../models/riot-api/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class RiotApiService {
    private httpService: HttpService;
    private cache: Map<string, CachedData<any>>;
    private rateLimiters: Map<string, RateLimiter>;

    constructor() {
        this.httpService = new HttpService();
        this.cache = new Map();
        this.rateLimiters = new Map();
        this.initializeRateLimiters();
    }

    private initializeRateLimiters(): void {
        // Initialize rate limiters based on config
        const limits = Config.riotApi.rateLimits.personalKey; // Default to personal key limits
        
        this.rateLimiters.set('global', new RateLimiter(limits.perSecond, 1000));
        this.rateLimiters.set('app', new RateLimiter(limits.per2Minutes, 120000));
    }

    private getRegionConfig(region: string): RegionConfig {
        const regionConfig = REGIONS[region.toLowerCase()];
        if (!regionConfig) {
            throw new Error(`Invalid region: ${region}. Supported regions: ${Object.keys(REGIONS).join(', ')}`);
        }
        return regionConfig;
    }

    private buildUrl(region: string, endpoint: string, isRegionalEndpoint: boolean = true): string {
        const regionConfig = this.getRegionConfig(region);
        
        if (isRegionalEndpoint) {
            // Regional endpoints use the platform-specific URL
            return `https://${regionConfig.platform}.api.riotgames.com${endpoint}`;
        } else {
            // Continental endpoints use the continent-specific URL
            const continentUrl = Config.riotApi.baseUrls[regionConfig.continent];
            return `${continentUrl}${endpoint}`;
        }
    }

    private async makeApiCall<T>(url: string, cacheKey?: string, ttl?: number): Promise<T> {
        // Check cache first
        if (cacheKey && Config.riotApi.cache.enabled) {
            const cached = this.getFromCache<T>(cacheKey);
            if (cached) {
                Logger.info(`Cache hit for ${cacheKey}`);
                return cached;
            }
        }

        // Apply rate limiting
        await this.applyRateLimit();

        try {
            const response = await this.httpService.getWithHeaders(
                new URL(url),
                {
                    'X-Riot-Token': Config.riotApi.key
                }
            );

            if (!response.ok) {
                await this.handleApiError(response);
            }

            const data = await response.json() as T;

            // Cache the response if specified
            if (cacheKey && ttl && Config.riotApi.cache.enabled) {
                this.setCache(cacheKey, data, ttl);
            }

            return data;
        } catch (error) {
            Logger.error('Riot API request failed', error);
            throw error;
        }
    }

    private async applyRateLimit(): Promise<void> {
        const globalLimiter = this.rateLimiters.get('global');
        const appLimiter = this.rateLimiters.get('app');

        if (globalLimiter && !globalLimiter.tryRequest()) {
            const waitTime = globalLimiter.getRetryAfter();
            Logger.warn(`Rate limited globally, waiting ${waitTime}ms`);
            await this.sleep(waitTime);
        }

        if (appLimiter && !appLimiter.tryRequest()) {
            const waitTime = appLimiter.getRetryAfter();
            Logger.warn(`Rate limited by app limits, waiting ${waitTime}ms`);
            await this.sleep(waitTime);
        }
    }

    private async handleApiError(response: Response): Promise<never> {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
            const errorBody = await response.json() as RiotApiError;
            if (errorBody.status?.message) {
                errorMessage = errorBody.status.message;
            }
        } catch {
            // Failed to parse error body, use default message
        }

        switch (response.status) {
            case 400:
                throw new Error(`Bad Request: ${errorMessage}`);
            case 401:
                throw new Error('Unauthorized: Invalid API key');
            case 403:
                throw new Error('Forbidden: API key may be expired or lacking permissions');
            case 404:
                throw new Error('Not Found: Summoner or data not found');
            case 415:
                throw new Error('Unsupported Media Type');
            case 429: {
                const retryAfter = response.headers.get('retry-after');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
                Logger.warn(`Rate limited by Riot API, waiting ${waitTime}ms`);
                await this.sleep(waitTime);
                throw new Error('Rate limited by Riot API');
            }
            case 500:
                throw new Error('Internal Server Error: Riot API is experiencing issues');
            case 502:
                throw new Error('Bad Gateway: Riot API is temporarily unavailable');
            case 503:
                throw new Error('Service Unavailable: Riot API is under maintenance');
            default:
                throw new Error(`API Error ${response.status}: ${errorMessage}`);
        }
    }

    private getFromCache<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now > cached.timestamp + cached.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.data as T;
    }

    private setCache<T>(key: string, data: T, ttl: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API Methods

    /**
     * Get summoner by Riot ID (gameName#tagLine) - Two-step process
     * This is the NEW way to look up summoners (by-name endpoint is deprecated)
     * 
     * Step 1: Get PUUID from Account API using Riot ID
     * Step 2: Get summoner info using PUUID
     */
    public async getSummonerByRiotId(gameName: string, tagLine: string, region: string): Promise<RiotSummoner> {
        // Step 1: Get account (PUUID) from Riot ID
        const account = await this.getAccountByRiotId(gameName, tagLine, region);
        
        // Step 2: Get summoner data using PUUID
        return await this.getSummonerByPuuid(account.puuid, region);
    }

    /**
     * Get summoner by name (legacy method - for backwards compatibility)
     * This now internally uses Riot ID with default tagLine
     * 
     * Note: Most summoners now use Riot IDs (gameName#tagLine)
     * If you have just a name, try common tagLines or ask user for full Riot ID
     */
    public async getSummonerByName(params: SummonerLookupParams): Promise<RiotSummoner> {
        const { summonerName, region } = params;
        
        // Try to parse as Riot ID first (gameName#tagLine)
        if (summonerName.includes('#')) {
            const parts = summonerName.split('#');
            const gameName = parts[0].trim();
            const tagLine = parts[1].trim();
            return await this.getSummonerByRiotId(gameName, tagLine, region);
        }
        
        // If no tag, try common default tagLine patterns for the region
        const defaultTagLines = this.getDefaultTagLinesForRegion(region);
        
        for (const tagLine of defaultTagLines) {
            try {
                return await this.getSummonerByRiotId(summonerName, tagLine, region);
            } catch (error) {
                // If not found with this tagLine, try next one
                if (!error.message.includes('Not Found')) {
                    throw error; // Re-throw if it's not a 404
                }
            }
        }
        
        // If all attempts fail, throw helpful error
        throw new Error(`Summoner "${summonerName}" not found. Please use full Riot ID format: gameName#tagLine (e.g., "Faker#KR1")`);
    }

    /**
     * Get common tagLines for a region
     */
    private getDefaultTagLinesForRegion(region: string): string[] {
        const regionConfig = this.getRegionConfig(region);
        
        // Common tagLine patterns by region
        const tagLineMap: Record<string, string[]> = {
            'americas': ['NA1', 'BR1', 'LAN', 'LAS', '0000'],
            'europe': ['EUW', 'EUNE', 'TR1', 'RU', '0000'],
            'asia': ['KR1', 'JP1', '0000'],
            'sea': ['OCE', 'PH2', 'SG2', 'TH2', 'TW2', 'VN2', '0000']
        };
        
        return tagLineMap[regionConfig.continent] || ['0000'];
    }

    /**
     * Get summoner by PUUID
     */
    public async getSummonerByPuuid(puuid: string, region: string): Promise<RiotSummoner> {
        const endpoint = `/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        const url = this.buildUrl(region, endpoint, true);
        const cacheKey = `summoner:puuid:${puuid}`;

        return await this.makeApiCall<RiotSummoner>(url, cacheKey, Config.riotApi.cache.summonerTtl * 1000);
    }

    /**
     * Get account by Riot ID (gameName#tagLine)
     */
    public async getAccountByRiotId(gameName: string, tagLine: string, region: string): Promise<RiotAccount> {
        const encodedGameName = encodeURIComponent(gameName);
        const encodedTagLine = encodeURIComponent(tagLine);
        const endpoint = `/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`;
        const url = this.buildUrl(region, endpoint, false); // Continental endpoint
        const cacheKey = `account:${region}:${gameName}:${tagLine}`;

        return await this.makeApiCall<RiotAccount>(url, cacheKey, Config.riotApi.cache.summonerTtl * 1000);
    }

    /**
     * Get ranked league entries for a summoner
     */
    public async getLeagueEntriesBySummonerId(summonerId: string, region: string): Promise<LeagueEntry[]> {
        const endpoint = `/lol/league/v4/entries/by-summoner/${summonerId}`;
        const url = this.buildUrl(region, endpoint, true);
        const cacheKey = `league:${region}:${summonerId}`;

        return await this.makeApiCall<LeagueEntry[]>(url, cacheKey, Config.riotApi.cache.rankedTtl * 1000);
    }

    /**
     * Get champion mastery by PUUID
     */
    public async getChampionMasteryByPuuid(puuid: string, region: string): Promise<ChampionMastery[]> {
        const endpoint = `/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`;
        const url = this.buildUrl(region, endpoint, true);
        const cacheKey = `mastery:${region}:${puuid}`;

        return await this.makeApiCall<ChampionMastery[]>(url, cacheKey, Config.riotApi.cache.championMasteryTtl * 1000);
    }

    /**
     * Get champion mastery for a specific champion
     */
    public async getChampionMasteryByChampion(puuid: string, championId: number, region: string): Promise<ChampionMastery> {
        const endpoint = `/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/by-champion/${championId}`;
        const url = this.buildUrl(region, endpoint, true);
        const cacheKey = `mastery:${region}:${puuid}:${championId}`;

        return await this.makeApiCall<ChampionMastery>(url, cacheKey, Config.riotApi.cache.championMasteryTtl * 1000);
    }

    /**
     * Get match IDs by PUUID
     */
    public async getMatchIdsByPuuid(params: MatchHistoryParams): Promise<string[]> {
        const { puuid, region, start = 0, count = 20, queue, type, startTime, endTime } = params;
        
        let endpoint = `/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
        
        if (queue) endpoint += `&queue=${queue}`;
        if (type) endpoint += `&type=${type}`;
        if (startTime) endpoint += `&startTime=${startTime}`;
        if (endTime) endpoint += `&endTime=${endTime}`;

        const url = this.buildUrl(region, endpoint, false); // Continental endpoint
        const cacheKey = `matches:${region}:${puuid}:${start}:${count}:${queue || 'all'}`;

        return await this.makeApiCall<string[]>(url, cacheKey, Config.riotApi.cache.matchesTtl * 1000);
    }

    /**
     * Get match details by match ID
     */
    public async getMatchById(matchId: string, region: string): Promise<Match> {
        const endpoint = `/lol/match/v5/matches/${matchId}`;
        const url = this.buildUrl(region, endpoint, false); // Continental endpoint
        const cacheKey = `match:${matchId}`;

        return await this.makeApiCall<Match>(url, cacheKey, Config.riotApi.cache.matchesTtl * 1000);
    }

    /**
     * Clear cache (useful for testing or manual cache invalidation)
     */
    public clearCache(): void {
        this.cache.clear();
        Logger.info('Riot API cache cleared');
    }

    /**
     * Get cache statistics
     */
    public getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

/**
 * Simple rate limiter implementation
 */
class RateLimiter {
    private requests: number[];
    private limit: number;
    private windowMs: number;

    constructor(limit: number, windowMs: number) {
        this.requests = [];
        this.limit = limit;
        this.windowMs = windowMs;
    }

    public tryRequest(): boolean {
        const now = Date.now();
        
        // Remove old requests outside the window
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        
        if (this.requests.length < this.limit) {
            this.requests.push(now);
            return true;
        }
        
        return false;
    }

    public getRetryAfter(): number {
        if (this.requests.length === 0) return 0;
        
        const oldestRequest = Math.min(...this.requests);
        const retryAfter = this.windowMs - (Date.now() - oldestRequest);
        
        return Math.max(0, retryAfter);
    }
}
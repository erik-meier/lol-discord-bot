import { createRequire } from 'node:module';

import { RiotApiUtils } from './riot-api-utils.js';
import { Logger, RiotApiService } from '../../services/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../../config/config.json');

/**
 * Test utility for Riot API service
 * Run this to test your API integration before implementing the Discord command
 * 
 * Usage examples:
 * - Test basic summoner lookup: RiotApiTester.testSummoner('Faker', 'kr')
 * - Run full test suite: RiotApiTester.runFullTest('Doublelift', 'na1')
 */
export class RiotApiTester {
    private static riotApi: RiotApiService = new RiotApiService();

    /**
     * Test basic summoner lookup functionality
     */
    public static async testSummoner(summonerName: string, region: string = 'na1'): Promise<any> {
        try {
            Logger.info(`🔍 Testing summoner lookup: ${summonerName} on ${RiotApiUtils.getRegionDisplayName(region)}`);
            
            // Validate inputs
            if (!RiotApiUtils.isValidRegion(region)) {
                throw new Error(`Invalid region: ${region}. Supported: ${RiotApiUtils.getSupportedRegions().join(', ')}`);
            }
            
            if (!RiotApiUtils.isValidSummonerName(summonerName)) {
                throw new Error(`Invalid summoner name format: ${summonerName}`);
            }
            
            // Test summoner lookup
            const summoner = await this.riotApi.getSummonerByName({
                summonerName: summonerName, // Don't normalize - let the service handle Riot ID parsing
                region
            });
            
            Logger.info('✅ Summoner found:', {
                name: summoner.name,
                level: summoner.summonerLevel,
                id: summoner.id?.substring(0, 8) + '...' || 'N/A',
                puuid: summoner.puuid?.substring(0, 8) + '...' || 'N/A'
            });
            
            return summoner;
        } catch (error) {
            Logger.error('❌ Summoner lookup failed:', error);
            throw error;
        }
    }

    /**
     * Test ranked data retrieval
     */
    public static async testRankedData(summonerName: string, region: string = 'na1'): Promise<void> {
        try {
            Logger.info('📊 Testing ranked data retrieval...');
            
            const summoner = await this.testSummoner(summonerName, region);
            const rankedEntries = await this.riotApi.getLeagueEntriesBySummonerId(summoner.id, region);
            
            if (rankedEntries.length === 0) {
                Logger.info('📊 No ranked data found (unranked player)');
                return;
            }
            
            Logger.info(`✅ Found ${rankedEntries.length} ranked queue(s):`);
            for (const entry of rankedEntries) {
                const queueName = RiotApiUtils.getQueueDisplayName(entry.queueType);
                const rank = RiotApiUtils.formatRank(entry.tier, entry.rank);
                const winRate = RiotApiUtils.formatWinRate(entry.wins, entry.losses);
                const lp = RiotApiUtils.formatLP(entry.leaguePoints);
                
                Logger.info(`  ${queueName}: ${rank} ${lp} | ${entry.wins}W ${entry.losses}L (${winRate})`);
                
                if (entry.hotStreak) Logger.info('    🔥 On a hot streak!');
                if (entry.veteran) Logger.info('    🎖️  Veteran player');
                if (entry.freshBlood) Logger.info('    🆕 Fresh blood');
            }
        } catch (error) {
            Logger.error('❌ Ranked data test failed:', error);
            throw error;
        }
    }

    /**
     * Test champion mastery data
     */
    public static async testChampionMastery(summonerName: string, region: string = 'na1', limit: number = 5): Promise<void> {
        try {
            Logger.info(`🏆 Testing champion mastery (top ${limit})...`);
            
            const summoner = await this.testSummoner(summonerName, region);
            const masteries = await this.riotApi.getChampionMasteryByPuuid(summoner.puuid, region);
            
            if (masteries.length === 0) {
                Logger.info('🏆 No mastery data found');
                return;
            }
            
            const topMasteries = masteries.slice(0, limit);
            Logger.info(`✅ Top ${topMasteries.length} champion masteries:`);
            
            for (let i = 0; i < topMasteries.length; i++) {
                const mastery = topMasteries[i];
                const masteryLevel = RiotApiUtils.formatMasteryLevel(mastery.championLevel);
                const points = RiotApiUtils.formatMasteryPoints(mastery.championPoints);
                const lastPlayed = RiotApiUtils.formatTimeSince(mastery.lastPlayTime);
                
                Logger.info(`  ${i + 1}. Champion ${mastery.championId}: ${masteryLevel} (${points} points) - ${lastPlayed}`);
            }
        } catch (error) {
            Logger.error('❌ Champion mastery test failed:', error);
            throw error;
        }
    }

    /**
     * Test match history retrieval
     */
    public static async testMatchHistory(summonerName: string, region: string = 'na1', count: number = 5): Promise<void> {
        try {
            Logger.info(`🎮 Testing match history (last ${count} games)...`);
            
            const summoner = await this.testSummoner(summonerName, region);
            const matchIds = await this.riotApi.getMatchIdsByPuuid({
                puuid: summoner.puuid,
                region,
                count
            });
            
            if (matchIds.length === 0) {
                Logger.info('🎮 No recent matches found');
                return;
            }
            
            Logger.info(`✅ Found ${matchIds.length} recent matches:`);
            
            // Test detailed match data for the most recent match
            if (matchIds.length > 0) {
                Logger.info('🔍 Testing detailed match data for most recent game...');
                const match = await this.riotApi.getMatchById(matchIds[0], region);
                
                const participant = match.info.participants.find(p => p.puuid === summoner.puuid);
                if (participant) {
                    const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;
                    const result = participant.win ? '🟢 Victory' : '🔴 Defeat';
                    const duration = Math.floor(match.info.gameDuration / 60);
                    
                    Logger.info(`  Most recent: ${participant.championName} | ${kda} | ${result} | ${duration}m`);
                    Logger.info(`  Game mode: ${match.info.gameMode} | Queue: ${match.info.queueId}`);
                }
                
                // Show match IDs (truncated for readability)
                Logger.info('📋 Recent match IDs:');
                matchIds.slice(0, 3).forEach((matchId, index) => {
                    Logger.info(`  ${index + 1}. ${matchId}`);
                });
            }
        } catch (error) {
            Logger.error('❌ Match history test failed:', error);
            throw error;
        }
    }

    /**
     * Test API key validation
     */
    public static async testApiKey(): Promise<void> {
        Logger.info('🔑 Testing API key configuration...');
        
        const apiKey = Config.riotApi?.key;
        
        if (!apiKey) {
            throw new Error('No API key found in config. Please set riotApi.key in config.json');
        }
        
        if (apiKey === 'RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx') {
            throw new Error('Please replace the placeholder API key with your actual Riot API key');
        }
        
        if (!apiKey.startsWith('RGAPI-')) {
            Logger.warn('⚠️  API key does not start with "RGAPI-". Make sure you\'re using a valid Riot Games API key');
        }
        
        Logger.info('✅ API key format looks valid');
        
        // Test a simple API call to validate the key
        try {
            await this.testSummoner('Doublelift#NA1', 'na1');
            Logger.info('✅ API key is working correctly!');
        } catch (error) {
            if (error.message.includes('Unauthorized')) {
                throw new Error('API key is invalid or expired. Please get a new key from https://developer.riotgames.com');
            }
            // If it's just a "not found" error, API key still works
            if (error.message.includes('not found')) {
                Logger.info('✅ API key is working (summoner not found is OK for validation)');
                return;
            }
            throw error;
        }
    }

    /**
     * Run comprehensive API test suite
     */
    public static async runFullTest(summonerName: string, region: string = 'na1'): Promise<void> {
        Logger.info('🚀 Starting comprehensive Riot API test suite...');
        Logger.info(`Target: ${summonerName} on ${RiotApiUtils.getRegionDisplayName(region)}`);
        Logger.info('─'.repeat(60));
        
        try {
            // Test API key first
            await this.testApiKey();
            
            // Test all functionality
            await this.testSummoner(summonerName, region);
            await this.testRankedData(summonerName, region);
            await this.testChampionMastery(summonerName, region);
            await this.testMatchHistory(summonerName, region);
            
            // Show cache performance
            const cacheStats = this.riotApi.getCacheStats();
            Logger.info('─'.repeat(60));
            Logger.info(`📊 Cache performance: ${cacheStats.size} entries cached`);
            Logger.info('Cache keys:', cacheStats.keys.slice(0, 5).map(key => key.substring(0, 30) + '...'));
            
            Logger.info('─'.repeat(60));
            Logger.info('🎉 All tests completed successfully!');
            Logger.info('Your Riot API integration is working correctly and ready for Discord commands!');
            
        } catch (error) {
            Logger.error('─'.repeat(60));
            Logger.error('💥 Test suite failed:', error);
            Logger.error('Please fix the issue above before implementing Discord commands');
            throw error;
        }
    }

    /**
     * Quick test with well-known summoner names
     */
    public static async quickTest(): Promise<void> {
        const testCases = [
            { name: 'Faker', region: 'kr' },
            { name: 'Doublelift', region: 'na1' },
            { name: 'Rekkles', region: 'euw1' }
        ];
        
        Logger.info('⚡ Running quick tests with well-known summoners...');
        
        for (const testCase of testCases) {
            try {
                Logger.info(`Testing ${testCase.name} (${testCase.region.toUpperCase()})...`);
                await this.testSummoner(testCase.name, testCase.region);
            } catch (error) {
                Logger.warn(`❌ ${testCase.name} test failed:`, error.message);
            }
        }
        
        Logger.info('⚡ Quick test completed!');
    }
}
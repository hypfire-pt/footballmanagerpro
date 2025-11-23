import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TransitionRequest {
  saveId: string
  currentSeasonId: string
  userId: string
}

interface CompetitionQualification {
  competition: string
  qualifiedTeamIds: string[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { saveId, currentSeasonId, userId } = await req.json() as TransitionRequest

    console.log('Starting season transition for save:', saveId)

    // 1. Get current season data
    const { data: currentSeason, error: seasonError } = await supabase
      .from('save_seasons')
      .select('*')
      .eq('id', currentSeasonId)
      .single()

    if (seasonError) throw seasonError

    const standings = currentSeason.standings_state as any[]
    const currentYear = currentSeason.season_year

    // 2. Determine competition qualifications based on final standings
    const qualifications = determineQualifications(standings)
    console.log('Competition qualifications:', qualifications)

    // 3. Get all leagues to generate fixtures for
    const { data: gameSave } = await supabase
      .from('game_saves')
      .select('team_id')
      .eq('id', saveId)
      .single()

    const { data: managerTeam } = await supabase
      .from('teams')
      .select('league_id')
      .eq('id', gameSave?.team_id)
      .single()

    const leagueId = managerTeam?.league_id

    // 4. Get all teams in the league for fixture generation
    const { data: leagueTeams } = await supabase
      .from('teams')
      .select('*')
      .eq('league_id', leagueId)

    if (!leagueTeams || leagueTeams.length === 0) {
      throw new Error('No teams found for league')
    }

    // 5. Generate fixtures for new season (all competitions)
    const newSeasonYear = currentYear + 1
    const seasonStartDate = new Date(newSeasonYear, 7, 15) // August 15
    
    const leagueFixtures = generateLeagueFixtures(
      leagueTeams,
      seasonStartDate,
      leagueId,
      leagueId
    )

    // 6. Generate European competition fixtures based on qualifications
    const europeanFixtures = generateEuropeanFixtures(
      qualifications,
      seasonStartDate,
      leagueTeams
    )

    const allFixtures = [...leagueFixtures, ...europeanFixtures]
    console.log(`Generated ${allFixtures.length} fixtures for new season`)

    // 7. Reset standings for new season
    const newStandings = leagueTeams.map((team: any, index: number) => ({
      team_id: team.id,
      team_name: team.name,
      position: index + 1,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      form: []
    }))

    // 8. Create new season record
    const { data: newSeason, error: newSeasonError } = await supabase
      .from('save_seasons')
      .insert({
        save_id: saveId,
        season_year: newSeasonYear,
        current_matchday: 1,
        current_game_week: 1,
        season_current_date: seasonStartDate.toISOString().split('T')[0],
        is_current: true,
        standings_state: newStandings,
        fixtures_state: allFixtures
      })
      .select()
      .single()

    if (newSeasonError) throw newSeasonError

    // 9. Mark old season as not current
    await supabase
      .from('save_seasons')
      .update({ is_current: false })
      .eq('id', currentSeasonId)

    // 10. Reset player stats for new season
    const { error: playerResetError } = await supabase
      .from('save_players')
      .update({
        goals: 0,
        assists: 0,
        appearances: 0,
        yellow_cards: 0,
        red_cards: 0,
        average_rating: null,
        form: 70,
        fitness: 100
      })
      .eq('save_id', saveId)

    if (playerResetError) throw playerResetError

    // 11. Update game save date to new season start
    await supabase
      .from('game_saves')
      .update({
        game_date: seasonStartDate.toISOString().split('T')[0],
        season_year: newSeasonYear
      })
      .eq('id', saveId)

    console.log('Season transition complete!')

    return new Response(
      JSON.stringify({
        success: true,
        newSeasonId: newSeason.id,
        newSeasonYear: newSeasonYear,
        fixturesGenerated: allFixtures.length,
        qualifications: qualifications
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Season transition error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Helper: Determine competition qualifications based on league position
function determineQualifications(standings: any[]): CompetitionQualification[] {
  const sorted = [...standings].sort((a, b) => b.points - a.points)
  
  return [
    {
      competition: 'UEFA Champions League',
      qualifiedTeamIds: sorted.slice(0, 4).map(t => t.team_id) // Top 4
    },
    {
      competition: 'UEFA Europa League',
      qualifiedTeamIds: sorted.slice(4, 6).map(t => t.team_id) // 5th-6th
    },
    {
      competition: 'UEFA Conference League',
      qualifiedTeamIds: sorted.slice(6, 7).map(t => t.team_id) // 7th
    }
  ]
}

// Helper: Generate league fixtures using round-robin
function generateLeagueFixtures(
  teams: any[],
  startDate: Date,
  leagueId: string,
  competition: string
): any[] {
  const fixtures: any[] = []
  const n = teams.length
  
  // Round-robin algorithm
  const rounds = generateRoundRobin(teams)
  
  // Generate home and away fixtures
  const allRounds = [...rounds, ...rounds.map(r => 
    r.map(m => ({ home: m.away, away: m.home }))
  )]
  
  allRounds.forEach((round, week) => {
    const matchDate = new Date(startDate)
    matchDate.setDate(matchDate.getDate() + (week * 7))
    
    round.forEach((match, idx) => {
      fixtures.push({
        id: `${leagueId}-${week + 1}-${idx}`,
        homeTeam: match.home.name,
        awayTeam: match.away.name,
        homeTeamId: match.home.id,
        awayTeamId: match.away.id,
        date: matchDate.toISOString().split('T')[0],
        competition: competition,
        status: 'scheduled',
        matchweek: week + 1
      })
    })
  })
  
  return fixtures
}

function generateRoundRobin(teams: any[]): any[][] {
  const n = teams.length
  const rounds: any[][] = []
  const numRounds = n - 1
  const matchesPerRound = n / 2
  
  for (let round = 0; round < numRounds; round++) {
    const roundMatches: any[] = []
    
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (n - 1)
      const away = (n - 1 - match + round) % (n - 1)
      
      if (match === 0) {
        roundMatches.push({
          home: teams[away],
          away: teams[n - 1]
        })
      } else {
        roundMatches.push({
          home: teams[home],
          away: teams[away]
        })
      }
    }
    
    rounds.push(roundMatches)
  }
  
  return rounds
}

// Helper: Generate European competition fixtures
function generateEuropeanFixtures(
  qualifications: CompetitionQualification[],
  startDate: Date,
  allTeams: any[]
): any[] {
  const fixtures: any[] = []
  
  qualifications.forEach(qual => {
    const qualifiedTeams = allTeams.filter(t => 
      qual.qualifiedTeamIds.includes(t.id)
    )
    
    if (qualifiedTeams.length === 0) return
    
    // Generate group stage fixtures (simplified)
    // Start in September
    const compStartDate = new Date(startDate)
    compStartDate.setMonth(8) // September
    
    const competitionId = qual.competition.toLowerCase().replace(/\s+/g, '-')
    
    // Round-robin within qualified teams
    for (let i = 0; i < qualifiedTeams.length; i++) {
      for (let j = i + 1; j < qualifiedTeams.length; j++) {
        // Home fixture
        fixtures.push({
          id: `${competitionId}-${i}-${j}`,
          homeTeam: qualifiedTeams[i].name,
          awayTeam: qualifiedTeams[j].name,
          homeTeamId: qualifiedTeams[i].id,
          awayTeamId: qualifiedTeams[j].id,
          date: new Date(compStartDate.getTime() + (i * 14 * 24 * 60 * 60 * 1000))
            .toISOString().split('T')[0],
          competition: qual.competition,
          status: 'scheduled',
          matchweek: i + 1
        })
        
        // Away fixture
        fixtures.push({
          id: `${competitionId}-${j}-${i}`,
          homeTeam: qualifiedTeams[j].name,
          awayTeam: qualifiedTeams[i].name,
          homeTeamId: qualifiedTeams[j].id,
          awayTeamId: qualifiedTeams[i].id,
          date: new Date(compStartDate.getTime() + ((i + 3) * 14 * 24 * 60 * 60 * 1000))
            .toISOString().split('T')[0],
          competition: qual.competition,
          status: 'scheduled',
          matchweek: i + 4
        })
      }
    }
  })
  
  return fixtures
}

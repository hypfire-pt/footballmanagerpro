import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// European leagues data
const leagues = [
  { id: "premier-league", name: "Premier League", country: "England", tier: 1, confederation: "UEFA", reputation: 98, founded: 1992 },
  { id: "la-liga", name: "La Liga", country: "Spain", tier: 1, confederation: "UEFA", reputation: 97, founded: 1929 },
  { id: "bundesliga", name: "Bundesliga", country: "Germany", tier: 1, confederation: "UEFA", reputation: 95, founded: 1963 },
  { id: "serie-a", name: "Serie A", country: "Italy", tier: 1, confederation: "UEFA", reputation: 94, founded: 1898 },
  { id: "ligue-1", name: "Ligue 1", country: "France", tier: 1, confederation: "UEFA", reputation: 90, founded: 1932 },
  { id: "primeira-liga", name: "Primeira Liga", country: "Portugal", tier: 1, confederation: "UEFA", reputation: 85, founded: 1934 },
  { id: "eredivisie", name: "Eredivisie", country: "Netherlands", tier: 1, confederation: "UEFA", reputation: 83, founded: 1956 },
  { id: "pro-league", name: "Belgian Pro League", country: "Belgium", tier: 1, confederation: "UEFA", reputation: 80, founded: 1895 },
  { id: "scottish-premiership", name: "Scottish Premiership", country: "Scotland", tier: 1, confederation: "UEFA", reputation: 78, founded: 2013 },
  { id: "super-lig", name: "Süper Lig", country: "Turkey", tier: 1, confederation: "UEFA", reputation: 77, founded: 1959 },
  { id: "ucl", name: "UEFA Champions League", country: "Europe", tier: 0, confederation: "UEFA", reputation: 100, founded: 1955 },
  { id: "uel", name: "UEFA Europa League", country: "Europe", tier: 0, confederation: "UEFA", reputation: 88, founded: 1971 },
  { id: "uecl", name: "UEFA Conference League", country: "Europe", tier: 0, confederation: "UEFA", reputation: 75, founded: 2021 }
];

// Sample teams - in production, this would include all 150+ teams
const teams = [
  // Premier League
  { id: "man-city", name: "Manchester City", shortName: "Man City", leagueId: "premier-league", country: "England", stadium: "Etihad Stadium", capacity: 53400, reputation: 95, balance: 500000000, primaryColor: "#6CABDD", secondaryColor: "#1C2C5B", founded: 1880 },
  { id: "arsenal", name: "Arsenal", shortName: "Arsenal", leagueId: "premier-league", country: "England", stadium: "Emirates Stadium", capacity: 60704, reputation: 92, balance: 400000000, primaryColor: "#EF0107", secondaryColor: "#FFFFFF", founded: 1886 },
  { id: "liverpool", name: "Liverpool", shortName: "Liverpool", leagueId: "premier-league", country: "England", stadium: "Anfield", capacity: 54074, reputation: 94, balance: 450000000, primaryColor: "#C8102E", secondaryColor: "#F6EB61", founded: 1892 },
  
  // La Liga
  { id: "real-madrid", name: "Real Madrid", shortName: "Real Madrid", leagueId: "la-liga", country: "Spain", stadium: "Santiago Bernabéu", capacity: 81044, reputation: 98, balance: 600000000, primaryColor: "#FFFFFF", secondaryColor: "#00529F", founded: 1902 },
  { id: "barcelona", name: "FC Barcelona", shortName: "Barcelona", leagueId: "la-liga", country: "Spain", stadium: "Camp Nou", capacity: 99354, reputation: 97, balance: 550000000, primaryColor: "#A50044", secondaryColor: "#004D98", founded: 1899 },
  
  // Bundesliga
  { id: "bayern", name: "Bayern Munich", shortName: "Bayern", leagueId: "bundesliga", country: "Germany", stadium: "Allianz Arena", capacity: 75024, reputation: 96, balance: 520000000, primaryColor: "#DC052D", secondaryColor: "#0066B2", founded: 1900 },
  { id: "dortmund", name: "Borussia Dortmund", shortName: "Dortmund", leagueId: "bundesliga", country: "Germany", stadium: "Signal Iduna Park", capacity: 81365, reputation: 88, balance: 300000000, primaryColor: "#FDE100", secondaryColor: "#000000", founded: 1909 }
];

// Player name generator
function generatePlayerName(nationality: string): { firstName: string; lastName: string } {
  const namesByNationality: Record<string, { first: string[]; last: string[] }> = {
    "England": {
      first: ["Harry", "Jack", "Phil", "Raheem", "Marcus", "Mason", "Declan", "Bukayo", "Jude", "Callum"],
      last: ["Kane", "Grealish", "Foden", "Sterling", "Rashford", "Mount", "Rice", "Saka", "Bellingham", "Wilson"]
    },
    "Spain": {
      first: ["Sergio", "David", "Álvaro", "Marco", "Pablo", "Carlos", "Dani", "Isco", "Koke", "Pedri"],
      last: ["Ramos", "Silva", "Morata", "Asensio", "Sarabia", "Soler", "Carvajal", "Alarcón", "Resurrección", "González"]
    },
    "Germany": {
      first: ["Thomas", "Manuel", "Joshua", "Timo", "Kai", "Leon", "Serge", "Marco", "Leroy", "Jonas"],
      last: ["Müller", "Neuer", "Kimmich", "Werner", "Havertz", "Goretzka", "Gnabry", "Reus", "Sané", "Hofmann"]
    },
    "France": {
      first: ["Kylian", "Antoine", "Paul", "N'Golo", "Karim", "Ousmane", "Kingsley", "Raphaël", "Hugo", "Olivier"],
      last: ["Mbappé", "Griezmann", "Pogba", "Kanté", "Benzema", "Dembélé", "Coman", "Varane", "Lloris", "Giroud"]
    },
    "Italy": {
      first: ["Giorgio", "Leonardo", "Ciro", "Lorenzo", "Marco", "Federico", "Nicolò", "Alessandro", "Gianluigi", "Andrea"],
      last: ["Chiellini", "Bonucci", "Immobile", "Insigne", "Verratti", "Chiesa", "Barella", "Bastoni", "Donnarumma", "Belotti"]
    }
  };

  const names = namesByNationality[nationality] || namesByNationality["England"];
  const firstName = names.first[Math.floor(Math.random() * names.first.length)];
  const lastName = names.last[Math.floor(Math.random() * names.last.length)];
  return { firstName, lastName };
}

// Position profiles for attribute generation
const positionProfiles: Record<string, { primary: string[]; secondary: string[] }> = {
  "GK": { primary: ["defending"], secondary: ["mental", "physical"] },
  "CB": { primary: ["defending", "physical"], secondary: ["mental"] },
  "LB": { primary: ["defending", "pace"], secondary: ["passing"] },
  "RB": { primary: ["defending", "pace"], secondary: ["passing"] },
  "CDM": { primary: ["defending", "passing"], secondary: ["mental", "physical"] },
  "CM": { primary: ["passing", "mental"], secondary: ["physical", "technical"] },
  "CAM": { primary: ["passing", "technical"], secondary: ["shooting", "mental"] },
  "LM": { primary: ["pace", "passing"], secondary: ["technical"] },
  "RM": { primary: ["pace", "passing"], secondary: ["technical"] },
  "LW": { primary: ["pace", "technical"], secondary: ["shooting"] },
  "RW": { primary: ["pace", "technical"], secondary: ["shooting"] },
  "ST": { primary: ["shooting", "physical"], secondary: ["pace", "technical"] }
};

function generateAttribute(position: string, attributeType: string, overall: number, isPrimary: boolean): number {
  const baseValue = overall;
  const variance = isPrimary ? 10 : 15;
  const modifier = isPrimary ? 5 : -5;
  const value = baseValue + modifier + (Math.random() * variance - variance / 2);
  return Math.max(40, Math.min(99, Math.round(value)));
}

function generatePlayer(teamId: string, nationality: string, position: string, targetOverall: number) {
  const { firstName, lastName } = generatePlayerName(nationality);
  const age = 18 + Math.floor(Math.random() * 15);
  const overall = Math.max(50, Math.min(95, targetOverall + Math.floor(Math.random() * 10 - 5)));
  const potential = Math.min(99, overall + Math.floor(Math.random() * (95 - overall) * (25 - age) / 20));
  
  const profile = positionProfiles[position] || positionProfiles["CM"];
  const attributes: Record<string, number> = {};
  
  ["pace", "shooting", "passing", "defending", "physical", "technical", "mental"].forEach(attr => {
    const isPrimary = profile.primary.includes(attr);
    attributes[attr] = generateAttribute(position, attr, overall, isPrimary);
  });
  
  const marketValue = Math.floor(overall * overall * 50000 + Math.random() * 10000000);
  const wage = Math.floor(marketValue * 0.05);
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - age);
  const contractExpiry = new Date();
  contractExpiry.setFullYear(contractExpiry.getFullYear() + 1 + Math.floor(Math.random() * 4));
  
  const playerId = `${teamId}-${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: playerId,
    name: `${firstName} ${lastName}`,
    team_id: teamId,
    nationality,
    age,
    date_of_birth: dob.toISOString().split('T')[0],
    position,
    overall,
    potential,
    pace: attributes.pace,
    shooting: attributes.shooting,
    passing: attributes.passing,
    defending: attributes.defending,
    physical: attributes.physical,
    technical: attributes.technical,
    mental: attributes.mental,
    market_value: marketValue,
    wage,
    contract_expiry: contractExpiry.toISOString().split('T')[0],
    preferred_foot: Math.random() > 0.3 ? 'Right' : 'Left',
    height: 165 + Math.floor(Math.random() * 30),
    weight: 65 + Math.floor(Math.random() * 25)
  };
}

function generateSquad(teamId: string, teamReputation: number, primaryNationality: string) {
  const squadQuality = Math.floor(teamReputation * 0.85);
  const positions = [
    { position: "GK", count: 3 },
    { position: "CB", count: 4 },
    { position: "LB", count: 2 },
    { position: "RB", count: 2 },
    { position: "CDM", count: 2 },
    { position: "CM", count: 3 },
    { position: "CAM", count: 2 },
    { position: "LW", count: 2 },
    { position: "RW", count: 2 },
    { position: "ST", count: 3 }
  ];
  
  const players = [];
  for (const { position, count } of positions) {
    for (let i = 0; i < count; i++) {
      const nationality = Math.random() < 0.7 ? primaryNationality : 
        ["England", "Spain", "Germany", "France", "Italy"][Math.floor(Math.random() * 5)];
      const player = generatePlayer(teamId, nationality, position, squadQuality);
      players.push(player);
    }
  }
  
  return players;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting database seeding...');

    // 1. Insert leagues
    console.log('Inserting leagues...');
    const { error: leaguesError } = await supabase
      .from('leagues')
      .upsert(leagues, { onConflict: 'id' });
    
    if (leaguesError) throw leaguesError;
    console.log(`Inserted ${leagues.length} leagues`);

    // 2. Insert teams
    console.log('Inserting teams...');
    const teamsToInsert = teams.map(t => ({
      id: t.id,
      name: t.name,
      short_name: t.shortName,
      league_id: t.leagueId,
      country: t.country,
      stadium: t.stadium,
      capacity: t.capacity,
      reputation: t.reputation,
      balance: t.balance,
      primary_color: t.primaryColor,
      secondary_color: t.secondaryColor,
      founded: t.founded
    }));
    
    const { error: teamsError } = await supabase
      .from('teams')
      .upsert(teamsToInsert, { onConflict: 'id' });
    
    if (teamsError) throw teamsError;
    console.log(`Inserted ${teams.length} teams`);

    // 3. Generate and insert players for each team
    console.log('Generating players...');
    const allPlayers = [];
    
    for (const team of teams) {
      const primaryNationality = team.country;
      const squad = generateSquad(team.id, team.reputation, primaryNationality);
      allPlayers.push(...squad);
    }
    
    console.log(`Generated ${allPlayers.length} players`);
    console.log('Inserting players...');
    
    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < allPlayers.length; i += batchSize) {
      const batch = allPlayers.slice(i, i + batchSize);
      const { error: playersError } = await supabase
        .from('players')
        .upsert(batch, { onConflict: 'id' });
      
      if (playersError) throw playersError;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
    }
    
    console.log('Database seeding completed successfully!');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database seeded successfully',
        stats: {
          leagues: leagues.length,
          teams: teams.length,
          players: allPlayers.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Seeding error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

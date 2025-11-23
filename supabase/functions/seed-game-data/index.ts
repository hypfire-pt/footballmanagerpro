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
];

// Complete teams database - 162 teams across 10 leagues
const allTeams = [
  // Premier League (20 teams)
  { id: "man-city", name: "Manchester City", shortName: "Man City", leagueId: "premier-league", country: "England", stadium: "Etihad Stadium", capacity: 53400, reputation: 95, balance: 500000000, primaryColor: "#6CABDD", secondaryColor: "#1C2C5B", founded: 1880 },
  { id: "arsenal", name: "Arsenal", shortName: "Arsenal", leagueId: "premier-league", country: "England", stadium: "Emirates Stadium", capacity: 60704, reputation: 92, balance: 400000000, primaryColor: "#EF0107", secondaryColor: "#FFFFFF", founded: 1886 },
  { id: "liverpool", name: "Liverpool", shortName: "Liverpool", leagueId: "premier-league", country: "England", stadium: "Anfield", capacity: 54074, reputation: 94, balance: 450000000, primaryColor: "#C8102E", secondaryColor: "#F6EB61", founded: 1892 },
  { id: "chelsea", name: "Chelsea", shortName: "Chelsea", leagueId: "premier-league", country: "England", stadium: "Stamford Bridge", capacity: 40834, reputation: 91, balance: 420000000, primaryColor: "#034694", secondaryColor: "#FFFFFF", founded: 1905 },
  { id: "man-utd", name: "Manchester United", shortName: "Man Utd", leagueId: "premier-league", country: "England", stadium: "Old Trafford", capacity: 74310, reputation: 93, balance: 480000000, primaryColor: "#DA291C", secondaryColor: "#FBE122", founded: 1878 },
  { id: "tottenham", name: "Tottenham Hotspur", shortName: "Spurs", leagueId: "premier-league", country: "England", stadium: "Tottenham Hotspur Stadium", capacity: 62850, reputation: 88, balance: 350000000, primaryColor: "#132257", secondaryColor: "#FFFFFF", founded: 1882 },
  { id: "newcastle", name: "Newcastle United", shortName: "Newcastle", leagueId: "premier-league", country: "England", stadium: "St James' Park", capacity: 52305, reputation: 85, balance: 600000000, primaryColor: "#241F20", secondaryColor: "#FFFFFF", founded: 1892 },
  { id: "aston-villa", name: "Aston Villa", shortName: "Villa", leagueId: "premier-league", country: "England", stadium: "Villa Park", capacity: 42785, reputation: 82, balance: 180000000, primaryColor: "#670E36", secondaryColor: "#95BFE5", founded: 1874 },
  { id: "brighton", name: "Brighton & Hove Albion", shortName: "Brighton", leagueId: "premier-league", country: "England", stadium: "Amex Stadium", capacity: 31800, reputation: 79, balance: 150000000, primaryColor: "#0057B8", secondaryColor: "#FFCD00", founded: 1901 },
  { id: "west-ham", name: "West Ham United", shortName: "West Ham", leagueId: "premier-league", country: "England", stadium: "London Stadium", capacity: 62500, reputation: 80, balance: 200000000, primaryColor: "#7A263A", secondaryColor: "#1BB1E7", founded: 1895 },
  { id: "fulham", name: "Fulham", shortName: "Fulham", leagueId: "premier-league", country: "England", stadium: "Craven Cottage", capacity: 29600, reputation: 75, balance: 120000000, primaryColor: "#FFFFFF", secondaryColor: "#000000", founded: 1879 },
  { id: "brentford", name: "Brentford", shortName: "Brentford", leagueId: "premier-league", country: "England", stadium: "Brentford Community Stadium", capacity: 17250, reputation: 74, balance: 100000000, primaryColor: "#D20000", secondaryColor: "#FDB913", founded: 1889 },
  { id: "crystal-palace", name: "Crystal Palace", shortName: "Palace", leagueId: "premier-league", country: "England", stadium: "Selhurst Park", capacity: 26309, reputation: 76, balance: 130000000, primaryColor: "#1B458F", secondaryColor: "#C4122E", founded: 1905 },
  { id: "wolves", name: "Wolverhampton Wanderers", shortName: "Wolves", leagueId: "premier-league", country: "England", stadium: "Molineux Stadium", capacity: 31700, reputation: 77, balance: 140000000, primaryColor: "#FDB913", secondaryColor: "#231F20", founded: 1877 },
  { id: "everton", name: "Everton", shortName: "Everton", leagueId: "premier-league", country: "England", stadium: "Goodison Park", capacity: 39414, reputation: 78, balance: 160000000, primaryColor: "#003399", secondaryColor: "#FFFFFF", founded: 1878 },
  { id: "nottm-forest", name: "Nottingham Forest", shortName: "Forest", leagueId: "premier-league", country: "England", stadium: "City Ground", capacity: 30455, reputation: 73, balance: 110000000, primaryColor: "#DD0000", secondaryColor: "#FFFFFF", founded: 1865 },
  { id: "bournemouth", name: "AFC Bournemouth", shortName: "Bournemouth", leagueId: "premier-league", country: "England", stadium: "Vitality Stadium", capacity: 11329, reputation: 70, balance: 90000000, primaryColor: "#DA291C", secondaryColor: "#000000", founded: 1899 },
  { id: "luton", name: "Luton Town", shortName: "Luton", leagueId: "premier-league", country: "England", stadium: "Kenilworth Road", capacity: 10356, reputation: 68, balance: 70000000, primaryColor: "#F78F1E", secondaryColor: "#002D62", founded: 1885 },
  { id: "burnley", name: "Burnley", shortName: "Burnley", leagueId: "premier-league", country: "England", stadium: "Turf Moor", capacity: 21944, reputation: 71, balance: 85000000, primaryColor: "#6C1D45", secondaryColor: "#99D6EA", founded: 1882 },
  { id: "sheffield-utd", name: "Sheffield United", shortName: "Sheff Utd", leagueId: "premier-league", country: "England", stadium: "Bramall Lane", capacity: 32702, reputation: 72, balance: 95000000, primaryColor: "#EE2737", secondaryColor: "#FFFFFF", founded: 1889 },
  
  // La Liga (20 teams)
  { id: "real-madrid", name: "Real Madrid", shortName: "Real Madrid", leagueId: "la-liga", country: "Spain", stadium: "Santiago Bernabéu", capacity: 81044, reputation: 98, balance: 600000000, primaryColor: "#FFFFFF", secondaryColor: "#00529F", founded: 1902 },
  { id: "barcelona", name: "FC Barcelona", shortName: "Barcelona", leagueId: "la-liga", country: "Spain", stadium: "Camp Nou", capacity: 99354, reputation: 97, balance: 550000000, primaryColor: "#A50044", secondaryColor: "#004D98", founded: 1899 },
  { id: "atletico", name: "Atlético Madrid", shortName: "Atlético", leagueId: "la-liga", country: "Spain", stadium: "Cívitas Metropolitano", capacity: 68456, reputation: 90, balance: 380000000, primaryColor: "#CB3524", secondaryColor: "#FFFFFF", founded: 1903 },
  { id: "sevilla", name: "Sevilla FC", shortName: "Sevilla", leagueId: "la-liga", country: "Spain", stadium: "Ramón Sánchez Pizjuán", capacity: 43864, reputation: 86, balance: 250000000, primaryColor: "#FFFFFF", secondaryColor: "#F43333", founded: 1890 },
  { id: "real-sociedad", name: "Real Sociedad", shortName: "Sociedad", leagueId: "la-liga", country: "Spain", stadium: "Reale Arena", capacity: 39500, reputation: 82, balance: 180000000, primaryColor: "#0066B3", secondaryColor: "#FFFFFF", founded: 1909 },
  { id: "real-betis", name: "Real Betis", shortName: "Betis", leagueId: "la-liga", country: "Spain", stadium: "Benito Villamarín", capacity: 60721, reputation: 81, balance: 170000000, primaryColor: "#00954C", secondaryColor: "#FFFFFF", founded: 1907 },
  { id: "villarreal", name: "Villarreal CF", shortName: "Villarreal", leagueId: "la-liga", country: "Spain", stadium: "Estadio de la Cerámica", capacity: 23500, reputation: 84, balance: 210000000, primaryColor: "#FFE667", secondaryColor: "#005187", founded: 1923 },
  { id: "athletic", name: "Athletic Bilbao", shortName: "Athletic", leagueId: "la-liga", country: "Spain", stadium: "San Mamés", capacity: 53289, reputation: 83, balance: 190000000, primaryColor: "#EE2523", secondaryColor: "#FFFFFF", founded: 1898 },
  { id: "valencia", name: "Valencia CF", shortName: "Valencia", leagueId: "la-liga", country: "Spain", stadium: "Mestalla", capacity: 48600, reputation: 85, balance: 220000000, primaryColor: "#FFFFFF", secondaryColor: "#000000", founded: 1919 },
  { id: "osasuna", name: "CA Osasuna", shortName: "Osasuna", leagueId: "la-liga", country: "Spain", stadium: "El Sadar", capacity: 23576, reputation: 75, balance: 100000000, primaryColor: "#C8102E", secondaryColor: "#010E80", founded: 1920 },
  { id: "getafe", name: "Getafe CF", shortName: "Getafe", leagueId: "la-liga", country: "Spain", stadium: "Coliseum Alfonso Pérez", capacity: 17393, reputation: 74, balance: 90000000, primaryColor: "#005999", secondaryColor: "#FFFFFF", founded: 1983 },
  { id: "rayo", name: "Rayo Vallecano", shortName: "Rayo", leagueId: "la-liga", country: "Spain", stadium: "Vallecas", capacity: 14708, reputation: 72, balance: 80000000, primaryColor: "#FFFFFF", secondaryColor: "#E2001A", founded: 1924 },
  { id: "celta", name: "Celta Vigo", shortName: "Celta", leagueId: "la-liga", country: "Spain", stadium: "Balaídos", capacity: 29000, reputation: 76, balance: 110000000, primaryColor: "#87CEEB", secondaryColor: "#FFFFFF", founded: 1923 },
  { id: "mallorca", name: "RCD Mallorca", shortName: "Mallorca", leagueId: "la-liga", country: "Spain", stadium: "Son Moix", capacity: 23142, reputation: 73, balance: 85000000, primaryColor: "#E20613", secondaryColor: "#000000", founded: 1916 },
  { id: "girona", name: "Girona FC", shortName: "Girona", leagueId: "la-liga", country: "Spain", stadium: "Montilivi", capacity: 13500, reputation: 70, balance: 70000000, primaryColor: "#CC0E2D", secondaryColor: "#FFFFFF", founded: 1930 },
  { id: "las-palmas", name: "UD Las Palmas", shortName: "Las Palmas", leagueId: "la-liga", country: "Spain", stadium: "Gran Canaria", capacity: 32400, reputation: 71, balance: 75000000, primaryColor: "#FFD700", secondaryColor: "#005EB8", founded: 1949 },
  { id: "alaves", name: "Deportivo Alavés", shortName: "Alavés", leagueId: "la-liga", country: "Spain", stadium: "Mendizorrotza", capacity: 19840, reputation: 69, balance: 65000000, primaryColor: "#005CA9", secondaryColor: "#FFFFFF", founded: 1921 },
  { id: "cadiz", name: "Cádiz CF", shortName: "Cádiz", leagueId: "la-liga", country: "Spain", stadium: "Nuevo Mirandilla", capacity: 20724, reputation: 68, balance: 60000000, primaryColor: "#FFED00", secondaryColor: "#005EB8", founded: 1910 },
  { id: "almeria", name: "UD Almería", shortName: "Almería", leagueId: "la-liga", country: "Spain", stadium: "Power Horse Stadium", capacity: 15200, reputation: 67, balance: 55000000, primaryColor: "#EE2E34", secondaryColor: "#FFFFFF", founded: 1989 },
  { id: "granada", name: "Granada CF", shortName: "Granada", leagueId: "la-liga", country: "Spain", stadium: "Nuevo Los Cármenes", capacity: 19336, reputation: 71, balance: 72000000, primaryColor: "#ED1C24", secondaryColor: "#FFFFFF", founded: 1931 },
  
  // Bundesliga (18 teams)
  { id: "bayern", name: "Bayern Munich", shortName: "Bayern", leagueId: "bundesliga", country: "Germany", stadium: "Allianz Arena", capacity: 75024, reputation: 96, balance: 520000000, primaryColor: "#DC052D", secondaryColor: "#0066B2", founded: 1900 },
  { id: "dortmund", name: "Borussia Dortmund", shortName: "Dortmund", leagueId: "bundesliga", country: "Germany", stadium: "Signal Iduna Park", capacity: 81365, reputation: 88, balance: 300000000, primaryColor: "#FDE100", secondaryColor: "#000000", founded: 1909 },
  { id: "rb-leipzig", name: "RB Leipzig", shortName: "Leipzig", leagueId: "bundesliga", country: "Germany", stadium: "Red Bull Arena", capacity: 47069, reputation: 86, balance: 280000000, primaryColor: "#DD0741", secondaryColor: "#FFFFFF", founded: 2009 },
  { id: "leverkusen", name: "Bayer Leverkusen", shortName: "Leverkusen", leagueId: "bundesliga", country: "Germany", stadium: "BayArena", capacity: 30210, reputation: 85, balance: 260000000, primaryColor: "#E32221", secondaryColor: "#000000", founded: 1904 },
  { id: "union-berlin", name: "Union Berlin", shortName: "Union", leagueId: "bundesliga", country: "Germany", stadium: "Stadion An der Alten Försterei", capacity: 22012, reputation: 78, balance: 120000000, primaryColor: "#EB1923", secondaryColor: "#FFFFFF", founded: 1966 },
  { id: "freiburg", name: "SC Freiburg", shortName: "Freiburg", leagueId: "bundesliga", country: "Germany", stadium: "Europa-Park Stadion", capacity: 34700, reputation: 77, balance: 110000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1904 },
  { id: "frankfurt", name: "Eintracht Frankfurt", shortName: "Frankfurt", leagueId: "bundesliga", country: "Germany", stadium: "Deutsche Bank Park", capacity: 51500, reputation: 82, balance: 180000000, primaryColor: "#E1000F", secondaryColor: "#000000", founded: 1899 },
  { id: "wolfsburg", name: "VfL Wolfsburg", shortName: "Wolfsburg", leagueId: "bundesliga", country: "Germany", stadium: "Volkswagen Arena", capacity: 30000, reputation: 80, balance: 150000000, primaryColor: "#65B32E", secondaryColor: "#FFFFFF", founded: 1945 },
  { id: "gladbach", name: "Borussia Mönchengladbach", shortName: "Gladbach", leagueId: "bundesliga", country: "Germany", stadium: "Borussia-Park", capacity: 54057, reputation: 81, balance: 160000000, primaryColor: "#000000", secondaryColor: "#00FF85", founded: 1900 },
  { id: "mainz", name: "1. FSV Mainz 05", shortName: "Mainz", leagueId: "bundesliga", country: "Germany", stadium: "MEWA Arena", capacity: 34000, reputation: 74, balance: 95000000, primaryColor: "#C3151C", secondaryColor: "#FFFFFF", founded: 1905 },
  { id: "hoffenheim", name: "TSG 1899 Hoffenheim", shortName: "Hoffenheim", leagueId: "bundesliga", country: "Germany", stadium: "PreZero Arena", capacity: 30150, reputation: 76, balance: 105000000, primaryColor: "#1961B5", secondaryColor: "#FFFFFF", founded: 1899 },
  { id: "augsburg", name: "FC Augsburg", shortName: "Augsburg", leagueId: "bundesliga", country: "Germany", stadium: "WWK Arena", capacity: 30660, reputation: 72, balance: 85000000, primaryColor: "#BA3733", secondaryColor: "#FFFFFF", founded: 1907 },
  { id: "werder", name: "Werder Bremen", shortName: "Bremen", leagueId: "bundesliga", country: "Germany", stadium: "Weserstadion", capacity: 42100, reputation: 79, balance: 130000000, primaryColor: "#1D9053", secondaryColor: "#FFFFFF", founded: 1899 },
  { id: "stuttgart", name: "VfB Stuttgart", shortName: "Stuttgart", leagueId: "bundesliga", country: "Germany", stadium: "Mercedes-Benz Arena", capacity: 60449, reputation: 80, balance: 140000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1893 },
  { id: "bochum", name: "VfL Bochum", shortName: "Bochum", leagueId: "bundesliga", country: "Germany", stadium: "Vonovia Ruhrstadion", capacity: 27599, reputation: 70, balance: 70000000, primaryColor: "#005CA9", secondaryColor: "#FFFFFF", founded: 1848 },
  { id: "koln", name: "1. FC Köln", shortName: "Köln", leagueId: "bundesliga", country: "Germany", stadium: "RheinEnergieStadion", capacity: 50000, reputation: 75, balance: 100000000, primaryColor: "#ED1C24", secondaryColor: "#FFFFFF", founded: 1948 },
  { id: "heidenheim", name: "1. FC Heidenheim", shortName: "Heidenheim", leagueId: "bundesliga", country: "Germany", stadium: "Voith-Arena", capacity: 15000, reputation: 68, balance: 60000000, primaryColor: "#1961B5", secondaryColor: "#ED1C24", founded: 1846 },
  { id: "darmstadt", name: "SV Darmstadt 98", shortName: "Darmstadt", leagueId: "bundesliga", country: "Germany", stadium: "Merck-Stadion am Böllenfalltor", capacity: 17810, reputation: 67, balance: 55000000, primaryColor: "#1D5DAD", secondaryColor: "#FFFFFF", founded: 1898 },
  
  // Serie A (20 teams)
  { id: "inter", name: "Inter Milan", shortName: "Inter", leagueId: "serie-a", country: "Italy", stadium: "San Siro", capacity: 80018, reputation: 92, balance: 400000000, primaryColor: "#0068A8", secondaryColor: "#000000", founded: 1908 },
  { id: "ac-milan", name: "AC Milan", shortName: "Milan", leagueId: "serie-a", country: "Italy", stadium: "San Siro", capacity: 80018, reputation: 91, balance: 380000000, primaryColor: "#FB090B", secondaryColor: "#000000", founded: 1899 },
  { id: "juventus", name: "Juventus", shortName: "Juventus", leagueId: "serie-a", country: "Italy", stadium: "Allianz Stadium", capacity: 41507, reputation: 93, balance: 420000000, primaryColor: "#000000", secondaryColor: "#FFFFFF", founded: 1897 },
  { id: "napoli", name: "SSC Napoli", shortName: "Napoli", leagueId: "serie-a", country: "Italy", stadium: "Diego Armando Maradona", capacity: 54726, reputation: 89, balance: 320000000, primaryColor: "#00A7E1", secondaryColor: "#FFFFFF", founded: 1926 },
  { id: "roma", name: "AS Roma", shortName: "Roma", leagueId: "serie-a", country: "Italy", stadium: "Stadio Olimpico", capacity: 72698, reputation: 87, balance: 280000000, primaryColor: "#990022", secondaryColor: "#F4B223", founded: 1927 },
  { id: "lazio", name: "SS Lazio", shortName: "Lazio", leagueId: "serie-a", country: "Italy", stadium: "Stadio Olimpico", capacity: 72698, reputation: 84, balance: 220000000, primaryColor: "#87CEEB", secondaryColor: "#FFFFFF", founded: 1900 },
  { id: "atalanta", name: "Atalanta", shortName: "Atalanta", leagueId: "serie-a", country: "Italy", stadium: "Gewiss Stadium", capacity: 21747, reputation: 83, balance: 200000000, primaryColor: "#000000", secondaryColor: "#1D5DAD", founded: 1907 },
  { id: "fiorentina", name: "Fiorentina", shortName: "Fiorentina", leagueId: "serie-a", country: "Italy", stadium: "Artemio Franchi", capacity: 43147, reputation: 82, balance: 180000000, primaryColor: "#A71A3A", secondaryColor: "#FFFFFF", founded: 1926 },
  { id: "bologna", name: "Bologna FC", shortName: "Bologna", leagueId: "serie-a", country: "Italy", stadium: "Renato Dall'Ara", capacity: 38279, reputation: 78, balance: 120000000, primaryColor: "#00308F", secondaryColor: "#ED1C24", founded: 1909 },
  { id: "torino", name: "Torino FC", shortName: "Torino", leagueId: "serie-a", country: "Italy", stadium: "Stadio Olimpico Grande Torino", capacity: 27994, reputation: 77, balance: 110000000, primaryColor: "#822433", secondaryColor: "#FFFFFF", founded: 1906 },
  { id: "monza", name: "AC Monza", shortName: "Monza", leagueId: "serie-a", country: "Italy", stadium: "U-Power Stadium", capacity: 18568, reputation: 73, balance: 90000000, primaryColor: "#ED1C24", secondaryColor: "#FFFFFF", founded: 1912 },
  { id: "udinese", name: "Udinese Calcio", shortName: "Udinese", leagueId: "serie-a", country: "Italy", stadium: "Dacia Arena", capacity: 25144, reputation: 76, balance: 105000000, primaryColor: "#000000", secondaryColor: "#FFFFFF", founded: 1896 },
  { id: "sassuolo", name: "US Sassuolo", shortName: "Sassuolo", leagueId: "serie-a", country: "Italy", stadium: "MAPEI Stadium", capacity: 23717, reputation: 74, balance: 95000000, primaryColor: "#009246", secondaryColor: "#000000", founded: 1922 },
  { id: "empoli", name: "Empoli FC", shortName: "Empoli", leagueId: "serie-a", country: "Italy", stadium: "Carlo Castellani", capacity: 16800, reputation: 71, balance: 75000000, primaryColor: "#1D5DAD", secondaryColor: "#FFFFFF", founded: 1920 },
  { id: "verona", name: "Hellas Verona", shortName: "Verona", leagueId: "serie-a", country: "Italy", stadium: "Marcantonio Bentegodi", capacity: 39211, reputation: 72, balance: 80000000, primaryColor: "#0066B3", secondaryColor: "#FFD700", founded: 1903 },
  { id: "lecce", name: "US Lecce", shortName: "Lecce", leagueId: "serie-a", country: "Italy", stadium: "Stadio Via del Mare", capacity: 33786, reputation: 70, balance: 70000000, primaryColor: "#FFD700", secondaryColor: "#ED1C24", founded: 1908 },
  { id: "cagliari", name: "Cagliari Calcio", shortName: "Cagliari", leagueId: "serie-a", country: "Italy", stadium: "Sardegna Arena", capacity: 16416, reputation: 73, balance: 85000000, primaryColor: "#C8102E", secondaryColor: "#00308F", founded: 1920 },
  { id: "genoa", name: "Genoa CFC", shortName: "Genoa", leagueId: "serie-a", country: "Italy", stadium: "Luigi Ferraris", capacity: 36599, reputation: 75, balance: 100000000, primaryColor: "#C8102E", secondaryColor: "#00308F", founded: 1893 },
  { id: "salernitana", name: "US Salernitana", shortName: "Salernitana", leagueId: "serie-a", country: "Italy", stadium: "Arechi", capacity: 37800, reputation: 69, balance: 65000000, primaryColor: "#822433", secondaryColor: "#009246", founded: 1919 },
  { id: "frosinone", name: "Frosinone Calcio", shortName: "Frosinone", leagueId: "serie-a", country: "Italy", stadium: "Benito Stirpe", capacity: 16227, reputation: 68, balance: 60000000, primaryColor: "#FFD700", secondaryColor: "#00308F", founded: 1928 },
  
  // Ligue 1 (18 teams)
  { id: "psg", name: "Paris Saint-Germain", shortName: "PSG", leagueId: "ligue-1", country: "France", stadium: "Parc des Princes", capacity: 47929, reputation: 94, balance: 650000000, primaryColor: "#004170", secondaryColor: "#DA291C", founded: 1970 },
  { id: "marseille", name: "Olympique de Marseille", shortName: "Marseille", leagueId: "ligue-1", country: "France", stadium: "Stade Vélodrome", capacity: 67394, reputation: 87, balance: 220000000, primaryColor: "#2FAEE0", secondaryColor: "#FFFFFF", founded: 1899 },
  { id: "monaco", name: "AS Monaco", shortName: "Monaco", leagueId: "ligue-1", country: "France", stadium: "Stade Louis II", capacity: 18523, reputation: 85, balance: 280000000, primaryColor: "#CC2E3C", secondaryColor: "#FFFFFF", founded: 1924 },
  { id: "lyon", name: "Olympique Lyonnais", shortName: "Lyon", leagueId: "ligue-1", country: "France", stadium: "Groupama Stadium", capacity: 59186, reputation: 84, balance: 200000000, primaryColor: "#1D428A", secondaryColor: "#C8102E", founded: 1950 },
  { id: "nice", name: "OGC Nice", shortName: "Nice", leagueId: "ligue-1", country: "France", stadium: "Allianz Riviera", capacity: 36178, reputation: 79, balance: 140000000, primaryColor: "#ED1C24", secondaryColor: "#000000", founded: 1904 },
  { id: "lille", name: "Lille OSC", shortName: "Lille", leagueId: "ligue-1", country: "France", stadium: "Stade Pierre-Mauroy", capacity: 50186, reputation: 81, balance: 160000000, primaryColor: "#E11B22", secondaryColor: "#002B5C", founded: 1944 },
  { id: "rennes", name: "Stade Rennais", shortName: "Rennes", leagueId: "ligue-1", country: "France", stadium: "Roazhon Park", capacity: 29778, reputation: 78, balance: 130000000, primaryColor: "#E2001A", secondaryColor: "#000000", founded: 1901 },
  { id: "lens", name: "RC Lens", shortName: "Lens", leagueId: "ligue-1", country: "France", stadium: "Stade Bollaert-Delelis", capacity: 41229, reputation: 76, balance: 110000000, primaryColor: "#FFD700", secondaryColor: "#C8102E", founded: 1906 },
  { id: "strasbourg", name: "RC Strasbourg", shortName: "Strasbourg", leagueId: "ligue-1", country: "France", stadium: "Stade de la Meinau", capacity: 29230, reputation: 74, balance: 95000000, primaryColor: "#009EE0", secondaryColor: "#FFFFFF", founded: 1906 },
  { id: "reims", name: "Stade de Reims", shortName: "Reims", leagueId: "ligue-1", country: "France", stadium: "Stade Auguste Delaune", capacity: 21029, reputation: 73, balance: 85000000, primaryColor: "#C8102E", secondaryColor: "#FFFFFF", founded: 1931 },
  { id: "montpellier", name: "Montpellier HSC", shortName: "Montpellier", leagueId: "ligue-1", country: "France", stadium: "Stade de la Mosson", capacity: 32939, reputation: 75, balance: 100000000, primaryColor: "#1D76C3", secondaryColor: "#F58220", founded: 1974 },
  { id: "nantes", name: "FC Nantes", shortName: "Nantes", leagueId: "ligue-1", country: "France", stadium: "Stade de la Beaujoire", capacity: 37473, reputation: 77, balance: 115000000, primaryColor: "#FFD700", secondaryColor: "#009246", founded: 1943 },
  { id: "toulouse", name: "Toulouse FC", shortName: "Toulouse", leagueId: "ligue-1", country: "France", stadium: "Stadium de Toulouse", capacity: 33150, reputation: 72, balance: 80000000, primaryColor: "#3D195B", secondaryColor: "#FFFFFF", founded: 1970 },
  { id: "brest", name: "Stade Brestois", shortName: "Brest", leagueId: "ligue-1", country: "France", stadium: "Stade Francis-Le Blé", capacity: 15931, reputation: 70, balance: 70000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1950 },
  { id: "lorient", name: "FC Lorient", shortName: "Lorient", leagueId: "ligue-1", country: "France", stadium: "Stade du Moustoir", capacity: 18500, reputation: 71, balance: 75000000, primaryColor: "#F58220", secondaryColor: "#000000", founded: 1926 },
  { id: "le-havre", name: "Le Havre AC", shortName: "Le Havre", leagueId: "ligue-1", country: "France", stadium: "Stade Océane", capacity: 25178, reputation: 69, balance: 65000000, primaryColor: "#87CEEB", secondaryColor: "#FFFFFF", founded: 1872 },
  { id: "clermont", name: "Clermont Foot", shortName: "Clermont", leagueId: "ligue-1", country: "France", stadium: "Stade Gabriel Montpied", capacity: 12000, reputation: 68, balance: 60000000, primaryColor: "#80162B", secondaryColor: "#00A0DC", founded: 1990 },
  { id: "metz", name: "FC Metz", shortName: "Metz", leagueId: "ligue-1", country: "France", stadium: "Stade Saint-Symphorien", capacity: 26661, reputation: 72, balance: 82000000, primaryColor: "#990033", secondaryColor: "#FFFFFF", founded: 1932 },
  
  // Primeira Liga (18 teams)
  { id: "benfica", name: "SL Benfica", shortName: "Benfica", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio da Luz", capacity: 64642, reputation: 88, balance: 280000000, primaryColor: "#ED1C24", secondaryColor: "#FFFFFF", founded: 1904 },
  { id: "porto", name: "FC Porto", shortName: "Porto", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio do Dragão", capacity: 50033, reputation: 89, balance: 290000000, primaryColor: "#0068A8", secondaryColor: "#FFFFFF", founded: 1893 },
  { id: "sporting", name: "Sporting CP", shortName: "Sporting", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio José Alvalade", capacity: 50095, reputation: 86, balance: 250000000, primaryColor: "#009246", secondaryColor: "#FFFFFF", founded: 1906 },
  { id: "braga", name: "SC Braga", shortName: "Braga", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio Municipal de Braga", capacity: 30286, reputation: 80, balance: 140000000, primaryColor: "#C8102E", secondaryColor: "#FFFFFF", founded: 1921 },
  { id: "guimaraes", name: "Vitória SC", shortName: "Guimarães", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio D. Afonso Henriques", capacity: 30029, reputation: 76, balance: 100000000, primaryColor: "#FFFFFF", secondaryColor: "#000000", founded: 1922 },
  { id: "gil-vicente", name: "Gil Vicente FC", shortName: "Gil Vicente", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio Cidade de Barcelos", capacity: 12504, reputation: 71, balance: 70000000, primaryColor: "#E2001A", secondaryColor: "#00308F", founded: 1924 },
  { id: "rio-ave", name: "Rio Ave FC", shortName: "Rio Ave", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio do Rio Ave FC", capacity: 12821, reputation: 70, balance: 65000000, primaryColor: "#009246", secondaryColor: "#FFFFFF", founded: 1939 },
  { id: "famalicao", name: "FC Famalicão", shortName: "Famalicão", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio Municipal de Famalicão", capacity: 5307, reputation: 69, balance: 60000000, primaryColor: "#00308F", secondaryColor: "#FFFFFF", founded: 1931 },
  { id: "boavista", name: "Boavista FC", shortName: "Boavista", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio do Bessa", capacity: 28263, reputation: 73, balance: 80000000, primaryColor: "#000000", secondaryColor: "#FFFFFF", founded: 1903 },
  { id: "moreirense", name: "Moreirense FC", shortName: "Moreirense", leagueId: "primeira-liga", country: "Portugal", stadium: "Parque de Jogos Comendador Joaquim de Almeida Freitas", capacity: 6000, reputation: 68, balance: 55000000, primaryColor: "#009246", secondaryColor: "#FFFFFF", founded: 1938 },
  { id: "casa-pia", name: "Casa Pia AC", shortName: "Casa Pia", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio Pina Manique", capacity: 2500, reputation: 66, balance: 45000000, primaryColor: "#FFD700", secondaryColor: "#000000", founded: 1920 },
  { id: "arouca", name: "FC Arouca", shortName: "Arouca", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio Municipal de Arouca", capacity: 5600, reputation: 67, balance: 50000000, primaryColor: "#FFD700", secondaryColor: "#000000", founded: 1951 },
  { id: "chaves", name: "GD Chaves", shortName: "Chaves", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio Municipal de Chaves", capacity: 8000, reputation: 68, balance: 55000000, primaryColor: "#E2001A", secondaryColor: "#00308F", founded: 1949 },
  { id: "vizela", name: "FC Vizela", shortName: "Vizela", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio do FC Vizela", capacity: 6000, reputation: 65, balance: 42000000, primaryColor: "#FFFFFF", secondaryColor: "#009246", founded: 1939 },
  { id: "portimonense", name: "Portimonense SC", shortName: "Portimonense", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio Municipal de Portimão", capacity: 9544, reputation: 69, balance: 58000000, primaryColor: "#000000", secondaryColor: "#FFD700", founded: 1914 },
  { id: "estoril", name: "GD Estoril Praia", shortName: "Estoril", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio António Coimbra da Mota", capacity: 8015, reputation: 70, balance: 62000000, primaryColor: "#FFD700", secondaryColor: "#00308F", founded: 1939 },
  { id: "farense", name: "SC Farense", shortName: "Farense", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio de São Luís", capacity: 7500, reputation: 68, balance: 54000000, primaryColor: "#000000", secondaryColor: "#FFFFFF", founded: 1910 },
  { id: "estrela", name: "CF Estrela da Amadora", shortName: "Estrela", leagueId: "primeira-liga", country: "Portugal", stadium: "Estádio José Gomes", capacity: 9288, reputation: 67, balance: 48000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1932 },
  
  // Eredivisie (18 teams)
  { id: "ajax", name: "AFC Ajax", shortName: "Ajax", leagueId: "eredivisie", country: "Netherlands", stadium: "Johan Cruyff ArenA", capacity: 54990, reputation: 87, balance: 220000000, primaryColor: "#D2122E", secondaryColor: "#FFFFFF", founded: 1900 },
  { id: "psv", name: "PSV Eindhoven", shortName: "PSV", leagueId: "eredivisie", country: "Netherlands", stadium: "Philips Stadion", capacity: 35000, reputation: 85, balance: 200000000, primaryColor: "#ED1C24", secondaryColor: "#FFFFFF", founded: 1913 },
  { id: "feyenoord", name: "Feyenoord", shortName: "Feyenoord", leagueId: "eredivisie", country: "Netherlands", stadium: "De Kuip", capacity: 51117, reputation: 84, balance: 180000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1908 },
  { id: "az", name: "AZ Alkmaar", shortName: "AZ", leagueId: "eredivisie", country: "Netherlands", stadium: "AFAS Stadion", capacity: 17023, reputation: 78, balance: 110000000, primaryColor: "#C8102E", secondaryColor: "#FFFFFF", founded: 1967 },
  { id: "twente", name: "FC Twente", shortName: "Twente", leagueId: "eredivisie", country: "Netherlands", stadium: "De Grolsch Veste", capacity: 30205, reputation: 76, balance: 95000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1965 },
  { id: "utrecht", name: "FC Utrecht", shortName: "Utrecht", leagueId: "eredivisie", country: "Netherlands", stadium: "Stadion Galgenwaard", capacity: 23750, reputation: 74, balance: 85000000, primaryColor: "#CC2E3C", secondaryColor: "#FFFFFF", founded: 1970 },
  { id: "heerenveen", name: "SC Heerenveen", shortName: "Heerenveen", leagueId: "eredivisie", country: "Netherlands", stadium: "Abe Lenstra Stadion", capacity: 26100, reputation: 72, balance: 75000000, primaryColor: "#0066B3", secondaryColor: "#FFFFFF", founded: 1920 },
  { id: "groningen", name: "FC Groningen", shortName: "Groningen", leagueId: "eredivisie", country: "Netherlands", stadium: "Euroborg", capacity: 22329, reputation: 71, balance: 70000000, primaryColor: "#009246", secondaryColor: "#FFFFFF", founded: 1971 },
  { id: "vitesse", name: "Vitesse", shortName: "Vitesse", leagueId: "eredivisie", country: "Netherlands", stadium: "GelreDome", capacity: 21248, reputation: 73, balance: 80000000, primaryColor: "#FFD700", secondaryColor: "#000000", founded: 1892 },
  { id: "go-ahead", name: "Go Ahead Eagles", shortName: "Go Ahead", leagueId: "eredivisie", country: "Netherlands", stadium: "De Adelaarshorst", capacity: 10400, reputation: 68, balance: 55000000, primaryColor: "#FFD700", secondaryColor: "#E2001A", founded: 1902 },
  { id: "sparta", name: "Sparta Rotterdam", shortName: "Sparta", leagueId: "eredivisie", country: "Netherlands", stadium: "Het Kasteel", capacity: 11000, reputation: 69, balance: 60000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1888 },
  { id: "nec", name: "NEC Nijmegen", shortName: "NEC", leagueId: "eredivisie", country: "Netherlands", stadium: "Goffertstadion", capacity: 12500, reputation: 70, balance: 65000000, primaryColor: "#E2001A", secondaryColor: "#000000", founded: 1900 },
  { id: "zwolle", name: "PEC Zwolle", shortName: "Zwolle", leagueId: "eredivisie", country: "Netherlands", stadium: "MAC³PARK Stadion", capacity: 14000, reputation: 68, balance: 56000000, primaryColor: "#0066B3", secondaryColor: "#FFFFFF", founded: 1910 },
  { id: "fortuna", name: "Fortuna Sittard", shortName: "Fortuna", leagueId: "eredivisie", country: "Netherlands", stadium: "Fortuna Sittard Stadion", capacity: 12500, reputation: 67, balance: 52000000, primaryColor: "#FFD700", secondaryColor: "#009246", founded: 1968 },
  { id: "heracles", name: "Heracles Almelo", shortName: "Heracles", leagueId: "eredivisie", country: "Netherlands", stadium: "Erve Asito", capacity: 13500, reputation: 68, balance: 54000000, primaryColor: "#000000", secondaryColor: "#FFFFFF", founded: 1903 },
  { id: "cambuur", name: "SC Cambuur", shortName: "Cambuur", leagueId: "eredivisie", country: "Netherlands", stadium: "Cambuur Stadion", capacity: 10250, reputation: 66, balance: 48000000, primaryColor: "#FFD700", secondaryColor: "#0066B3", founded: 1964 },
  { id: "waalwijk", name: "RKC Waalwijk", shortName: "Waalwijk", leagueId: "eredivisie", country: "Netherlands", stadium: "Mandemakers Stadion", capacity: 7500, reputation: 65, balance: 45000000, primaryColor: "#FFD700", secondaryColor: "#0066B3", founded: 1940 },
  { id: "volendam", name: "FC Volendam", shortName: "Volendam", leagueId: "eredivisie", country: "Netherlands", stadium: "Kras Stadion", capacity: 6984, reputation: 64, balance: 42000000, primaryColor: "#F58220", secondaryColor: "#000000", founded: 1920 },
  
  // Belgian Pro League (18 teams)
  { id: "club-brugge", name: "Club Brugge", shortName: "Club Brugge", leagueId: "pro-league", country: "Belgium", stadium: "Jan Breydel Stadium", capacity: 29042, reputation: 82, balance: 150000000, primaryColor: "#0066B3", secondaryColor: "#000000", founded: 1891 },
  { id: "anderlecht", name: "RSC Anderlecht", shortName: "Anderlecht", leagueId: "pro-league", country: "Belgium", stadium: "Lotto Park", capacity: 21500, reputation: 81, balance: 140000000, primaryColor: "#7B3F96", secondaryColor: "#FFFFFF", founded: 1908 },
  { id: "antwerp", name: "Royal Antwerp", shortName: "Antwerp", leagueId: "pro-league", country: "Belgium", stadium: "Bosuilstadion", capacity: 16144, reputation: 76, balance: 95000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1880 },
  { id: "genk", name: "KRC Genk", shortName: "Genk", leagueId: "pro-league", country: "Belgium", stadium: "Cegeka Arena", capacity: 23718, reputation: 77, balance: 100000000, primaryColor: "#0066B3", secondaryColor: "#FFFFFF", founded: 1988 },
  { id: "union-sg", name: "Union Saint-Gilloise", shortName: "Union SG", leagueId: "pro-league", country: "Belgium", stadium: "Stade Joseph Marien", capacity: 8000, reputation: 75, balance: 88000000, primaryColor: "#FFD700", secondaryColor: "#0066B3", founded: 1897 },
  { id: "gent", name: "KAA Gent", shortName: "Gent", leagueId: "pro-league", country: "Belgium", stadium: "Ghelamco Arena", capacity: 20000, reputation: 74, balance: 82000000, primaryColor: "#0066B3", secondaryColor: "#FFFFFF", founded: 1864 },
  { id: "standard", name: "Standard Liège", shortName: "Standard", leagueId: "pro-league", country: "Belgium", stadium: "Stade Maurice Dufrasne", capacity: 27670, reputation: 78, balance: 108000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1898 },
  { id: "mechelen", name: "KV Mechelen", shortName: "Mechelen", leagueId: "pro-league", country: "Belgium", stadium: "AFAS Stadion", capacity: 16672, reputation: 71, balance: 68000000, primaryColor: "#FFD700", secondaryColor: "#E2001A", founded: 1904 },
  { id: "cercle-brugge", name: "Cercle Brugge", shortName: "Cercle", leagueId: "pro-league", country: "Belgium", stadium: "Jan Breydel Stadium", capacity: 29042, reputation: 69, balance: 58000000, primaryColor: "#009246", secondaryColor: "#000000", founded: 1899 },
  { id: "charleroi", name: "Royal Charleroi SC", shortName: "Charleroi", leagueId: "pro-league", country: "Belgium", stadium: "Stade du Pays de Charleroi", capacity: 15000, reputation: 70, balance: 62000000, primaryColor: "#000000", secondaryColor: "#FFFFFF", founded: 1904 },
  { id: "oostende", name: "KV Oostende", shortName: "Oostende", leagueId: "pro-league", country: "Belgium", stadium: "Diaz Arena", capacity: 8125, reputation: 68, balance: 54000000, primaryColor: "#FFD700", secondaryColor: "#009246", founded: 1904 },
  { id: "kortrijk", name: "KV Kortrijk", shortName: "Kortrijk", leagueId: "pro-league", country: "Belgium", stadium: "Guldensporenstadion", capacity: 9500, reputation: 67, balance: 50000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1901 },
  { id: "leuven", name: "Oud-Heverlee Leuven", shortName: "Leuven", leagueId: "pro-league", country: "Belgium", stadium: "King Power at Den Dreef Stadium", capacity: 10020, reputation: 66, balance: 46000000, primaryColor: "#FFFFFF", secondaryColor: "#E2001A", founded: 2002 },
  { id: "sint-truiden", name: "Sint-Truidense VV", shortName: "Sint-Truiden", leagueId: "pro-league", country: "Belgium", stadium: "Stayen", capacity: 14600, reputation: 65, balance: 44000000, primaryColor: "#FFD700", secondaryColor: "#0066B3", founded: 1924 },
  { id: "eupen", name: "KAS Eupen", shortName: "Eupen", leagueId: "pro-league", country: "Belgium", stadium: "Kehrwegstadion", capacity: 8363, reputation: 64, balance: 40000000, primaryColor: "#FFFFFF", secondaryColor: "#FFD700", founded: 1945 },
  { id: "zulte", name: "Zulte Waregem", shortName: "Zulte", leagueId: "pro-league", country: "Belgium", stadium: "Elindus Arena", capacity: 8500, reputation: 66, balance: 48000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 2001 },
  { id: "seraing", name: "RFC Seraing", shortName: "Seraing", leagueId: "pro-league", country: "Belgium", stadium: "Stade du Pairay", capacity: 6000, reputation: 62, balance: 35000000, primaryColor: "#990033", secondaryColor: "#FFFFFF", founded: 1904 },
  { id: "westerlo", name: "KVC Westerlo", shortName: "Westerlo", leagueId: "pro-league", country: "Belgium", stadium: "Het Kuipje", capacity: 8035, reputation: 63, balance: 38000000, primaryColor: "#FFD700", secondaryColor: "#0066B3", founded: 1933 },
  
  // Scottish Premiership (12 teams)
  { id: "celtic", name: "Celtic", shortName: "Celtic", leagueId: "scottish-premiership", country: "Scotland", stadium: "Celtic Park", capacity: 60411, reputation: 83, balance: 180000000, primaryColor: "#009246", secondaryColor: "#FFFFFF", founded: 1888 },
  { id: "rangers", name: "Rangers", shortName: "Rangers", leagueId: "scottish-premiership", country: "Scotland", stadium: "Ibrox Stadium", capacity: 50817, reputation: 82, balance: 170000000, primaryColor: "#0066B3", secondaryColor: "#E2001A", founded: 1872 },
  { id: "aberdeen", name: "Aberdeen", shortName: "Aberdeen", leagueId: "scottish-premiership", country: "Scotland", stadium: "Pittodrie Stadium", capacity: 20866, reputation: 73, balance: 75000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1903 },
  { id: "hearts", name: "Heart of Midlothian", shortName: "Hearts", leagueId: "scottish-premiership", country: "Scotland", stadium: "Tynecastle Park", capacity: 20099, reputation: 72, balance: 70000000, primaryColor: "#990033", secondaryColor: "#FFFFFF", founded: 1874 },
  { id: "hibernian", name: "Hibernian", shortName: "Hibs", leagueId: "scottish-premiership", country: "Scotland", stadium: "Easter Road", capacity: 20421, reputation: 71, balance: 68000000, primaryColor: "#009246", secondaryColor: "#FFFFFF", founded: 1875 },
  { id: "dundee-utd", name: "Dundee United", shortName: "Dundee Utd", leagueId: "scottish-premiership", country: "Scotland", stadium: "Tannadice Park", capacity: 14223, reputation: 69, balance: 58000000, primaryColor: "#F58220", secondaryColor: "#000000", founded: 1909 },
  { id: "kilmarnock", name: "Kilmarnock", shortName: "Kilmarnock", leagueId: "scottish-premiership", country: "Scotland", stadium: "Rugby Park", capacity: 18128, reputation: 68, balance: 54000000, primaryColor: "#0066B3", secondaryColor: "#FFFFFF", founded: 1869 },
  { id: "motherwell", name: "Motherwell", shortName: "Motherwell", leagueId: "scottish-premiership", country: "Scotland", stadium: "Fir Park", capacity: 13677, reputation: 67, balance: 50000000, primaryColor: "#FFD700", secondaryColor: "#990033", founded: 1886 },
  { id: "st-mirren", name: "St Mirren", shortName: "St Mirren", leagueId: "scottish-premiership", country: "Scotland", stadium: "SMiSA Stadium", capacity: 8023, reputation: 65, balance: 44000000, primaryColor: "#000000", secondaryColor: "#FFFFFF", founded: 1877 },
  { id: "ross-county", name: "Ross County", shortName: "Ross County", leagueId: "scottish-premiership", country: "Scotland", stadium: "Global Energy Stadium", capacity: 6541, reputation: 64, balance: 40000000, primaryColor: "#00308F", secondaryColor: "#E2001A", founded: 1929 },
  { id: "livingston", name: "Livingston", shortName: "Livingston", leagueId: "scottish-premiership", country: "Scotland", stadium: "Tony Macaroni Arena", capacity: 9713, reputation: 66, balance: 46000000, primaryColor: "#FFD700", secondaryColor: "#000000", founded: 1974 },
  { id: "st-johnstone", name: "St Johnstone", shortName: "St Johnstone", leagueId: "scottish-premiership", country: "Scotland", stadium: "McDiarmid Park", capacity: 10696, reputation: 67, balance: 48000000, primaryColor: "#0066B3", secondaryColor: "#FFFFFF", founded: 1884 },
  
  // Süper Lig (20 teams)
  { id: "galatasaray", name: "Galatasaray", shortName: "Galatasaray", leagueId: "super-lig", country: "Turkey", stadium: "Türk Telekom Stadium", capacity: 52280, reputation: 84, balance: 180000000, primaryColor: "#FFD700", secondaryColor: "#C8102E", founded: 1905 },
  { id: "fenerbahce", name: "Fenerbahçe", shortName: "Fenerbahçe", leagueId: "super-lig", country: "Turkey", stadium: "Şükrü Saracoğlu Stadium", capacity: 50509, reputation: 83, balance: 170000000, primaryColor: "#FFD700", secondaryColor: "#00308F", founded: 1907 },
  { id: "besiktas", name: "Beşiktaş", shortName: "Beşiktaş", leagueId: "super-lig", country: "Turkey", stadium: "Vodafone Park", capacity: 41903, reputation: 81, balance: 150000000, primaryColor: "#000000", secondaryColor: "#FFFFFF", founded: 1903 },
  { id: "trabzonspor", name: "Trabzonspor", shortName: "Trabzonspor", leagueId: "super-lig", country: "Turkey", stadium: "Şenol Güneş Stadium", capacity: 41461, reputation: 77, balance: 100000000, primaryColor: "#990033", secondaryColor: "#0066B3", founded: 1967 },
  { id: "basaksehir", name: "İstanbul Başakşehir", shortName: "Başakşehir", leagueId: "super-lig", country: "Turkey", stadium: "Başakşehir Fatih Terim Stadium", capacity: 17319, reputation: 74, balance: 80000000, primaryColor: "#F58220", secondaryColor: "#00308F", founded: 1990 },
  { id: "adana", name: "Adana Demirspor", shortName: "Adana", leagueId: "super-lig", country: "Turkey", stadium: "Yeni Adana Stadium", capacity: 33543, reputation: 72, balance: 70000000, primaryColor: "#0066B3", secondaryColor: "#F58220", founded: 1940 },
  { id: "konyaspor", name: "Konyaspor", shortName: "Konyaspor", leagueId: "super-lig", country: "Turkey", stadium: "Konya Büyükşehir Stadium", capacity: 42276, reputation: 71, balance: 65000000, primaryColor: "#009246", secondaryColor: "#FFFFFF", founded: 1922 },
  { id: "antalyaspor", name: "Antalyaspor", shortName: "Antalyaspor", leagueId: "super-lig", country: "Turkey", stadium: "New Antalya Stadium", capacity: 32537, reputation: 70, balance: 60000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1966 },
  { id: "sivasspor", name: "Sivasspor", shortName: "Sivasspor", leagueId: "super-lig", country: "Turkey", stadium: "Yeni 4 Eylül Stadium", capacity: 27532, reputation: 69, balance: 55000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1967 },
  { id: "alanyaspor", name: "Alanyaspor", shortName: "Alanyaspor", leagueId: "super-lig", country: "Turkey", stadium: "Bahçeşehir Okulları Stadium", capacity: 10128, reputation: 68, balance: 50000000, primaryColor: "#F58220", secondaryColor: "#009246", founded: 1948 },
  { id: "kasimpasa", name: "Kasımpaşa", shortName: "Kasımpaşa", leagueId: "super-lig", country: "Turkey", stadium: "Recep Tayyip Erdoğan Stadium", capacity: 13800, reputation: 67, balance: 48000000, primaryColor: "#00308F", secondaryColor: "#FFFFFF", founded: 1921 },
  { id: "gaziantep", name: "Gaziantep FK", shortName: "Gaziantep", leagueId: "super-lig", country: "Turkey", stadium: "Kalyon Stadium", capacity: 33502, reputation: 66, balance: 45000000, primaryColor: "#E2001A", secondaryColor: "#000000", founded: 1988 },
  { id: "hatayspor", name: "Hatayspor", shortName: "Hatayspor", leagueId: "super-lig", country: "Turkey", stadium: "Hatay Atatürk Stadium", capacity: 25000, reputation: 65, balance: 42000000, primaryColor: "#990033", secondaryColor: "#FFFFFF", founded: 1967 },
  { id: "kayserispor", name: "Kayserispor", shortName: "Kayserispor", leagueId: "super-lig", country: "Turkey", stadium: "Kadir Has Stadium", capacity: 32864, reputation: 68, balance: 52000000, primaryColor: "#E2001A", secondaryColor: "#FFD700", founded: 1966 },
  { id: "giresunspor", name: "Giresunspor", shortName: "Giresunspor", leagueId: "super-lig", country: "Turkey", stadium: "Giresun Atatürk Stadium", capacity: 21900, reputation: 64, balance: 38000000, primaryColor: "#009246", secondaryColor: "#E2001A", founded: 1967 },
  { id: "fatih-karagumruk", name: "Fatih Karagümrük", shortName: "Karagümrük", leagueId: "super-lig", country: "Turkey", stadium: "Atatürk Olympic Stadium", capacity: 76092, reputation: 66, balance: 44000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1926 },
  { id: "umraniyespor", name: "Ümraniyespor", shortName: "Ümraniyespor", leagueId: "super-lig", country: "Turkey", stadium: "Ümraniye Şehir Stadium", capacity: 3513, reputation: 63, balance: 36000000, primaryColor: "#FFD700", secondaryColor: "#E2001A", founded: 1990 },
  { id: "istanbulspor", name: "İstanbulspor", shortName: "İstanbulspor", leagueId: "super-lig", country: "Turkey", stadium: "Esenyurt Necmi Kadıoğlu Stadium", capacity: 3100, reputation: 62, balance: 34000000, primaryColor: "#FFD700", secondaryColor: "#000000", founded: 1926 },
  { id: "ankaraguc", name: "Ankaragücü", shortName: "Ankaragücü", leagueId: "super-lig", country: "Turkey", stadium: "Eryaman Stadium", capacity: 20560, reputation: 67, balance: 46000000, primaryColor: "#FFD700", secondaryColor: "#00308F", founded: 1911 },
  { id: "pendikspor", name: "Pendikspor", shortName: "Pendikspor", leagueId: "super-lig", country: "Turkey", stadium: "Pendik Stadium", capacity: 3600, reputation: 61, balance: 32000000, primaryColor: "#E2001A", secondaryColor: "#FFFFFF", founded: 1950 }
];

// Player name generator
function generatePlayerName(nationality: string): { firstName: string; lastName: string } {
  const namesByNationality: Record<string, { first: string[]; last: string[] }> = {
    "England": {
      first: ["Harry", "Jack", "Phil", "Raheem", "Marcus", "Mason", "Declan", "Bukayo", "Jude", "Callum", "James", "Luke", "Jordan", "John", "Trent"],
      last: ["Kane", "Grealish", "Foden", "Sterling", "Rashford", "Mount", "Rice", "Saka", "Bellingham", "Wilson", "Maddison", "Shaw", "Henderson", "Stones", "Alexander-Arnold"]
    },
    "Spain": {
      first: ["Sergio", "David", "Álvaro", "Marco", "Pablo", "Carlos", "Dani", "Isco", "Koke", "Pedri", "Gavi", "Ansu", "Ferran", "Pau", "Jordi"],
      last: ["Ramos", "Silva", "Morata", "Asensio", "Sarabia", "Soler", "Carvajal", "Alarcón", "Resurrección", "González", "Torres", "Fati", "Alba", "Busquets", "García"]
    },
    "Germany": {
      first: ["Thomas", "Manuel", "Joshua", "Timo", "Kai", "Leon", "Serge", "Marco", "Leroy", "Jonas", "İlkay", "Antonio", "Niklas", "Robin", "Jamal"],
      last: ["Müller", "Neuer", "Kimmich", "Werner", "Havertz", "Goretzka", "Gnabry", "Reus", "Sané", "Hofmann", "Gündogan", "Rüdiger", "Süle", "Gosens", "Musiala"]
    },
    "France": {
      first: ["Kylian", "Antoine", "Paul", "N'Golo", "Karim", "Ousmane", "Kingsley", "Raphaël", "Hugo", "Olivier", "Aurélien", "Jules", "Théo", "Benjamin", "Eduardo"],
      last: ["Mbappé", "Griezmann", "Pogba", "Kanté", "Benzema", "Dembélé", "Coman", "Varane", "Lloris", "Giroud", "Tchouaméni", "Koundé", "Hernández", "Pavard", "Camavinga"]
    },
    "Italy": {
      first: ["Giorgio", "Leonardo", "Ciro", "Lorenzo", "Marco", "Federico", "Nicolò", "Alessandro", "Gianluigi", "Andrea", "Jorginho", "Giovanni", "Domenico", "Gianluca", "Matteo"],
      last: ["Chiellini", "Bonucci", "Immobile", "Insigne", "Verratti", "Chiesa", "Barella", "Bastoni", "Donnarumma", "Belotti", "Frello", "Di Lorenzo", "Berardi", "Mancini", "Politano"]
    },
    "Portugal": {
      first: ["Cristiano", "Bruno", "Bernardo", "João", "Diogo", "Rúben", "Rafael", "Renato", "Gonçalo", "Pepe", "Rui", "José", "Nuno", "Pedro", "Ricardo"],
      last: ["Ronaldo", "Fernandes", "Silva", "Félix", "Jota", "Dias", "Leão", "Sanches", "Ramos", "Fonte", "Patrício", "Sá", "Mendes", "Neto", "Horta"]
    },
    "Netherlands": {
      first: ["Virgil", "Matthijs", "Frenkie", "Memphis", "Georginio", "Denzel", "Steven", "Daley", "Cody", "Jurriën", "Teun", "Donyell", "Luuk", "Wout", "Jasper"],
      last: ["van Dijk", "de Ligt", "de Jong", "Depay", "Wijnaldum", "Dumfries", "Bergwijn", "Blind", "Gakpo", "Timber", "Koopmeiners", "Malen", "de Jong", "Weghorst", "Cillessen"]
    },
    "Belgium": {
      first: ["Kevin", "Romelu", "Eden", "Thibaut", "Dries", "Youri", "Leandro", "Axel", "Yannick", "Thomas", "Toby", "Jan", "Michy", "Thorgan", "Timothy"],
      last: ["De Bruyne", "Lukaku", "Hazard", "Courtois", "Mertens", "Tielemans", "Trossard", "Witsel", "Carrasco", "Meunier", "Alderweireld", "Vertonghen", "Batshuayi", "Hazard", "Castagne"]
    },
    "Scotland": {
      first: ["Andrew", "John", "Scott", "Kieran", "Callum", "Ryan", "Stuart", "Lyndon", "Nathan", "Lewis", "Grant", "Aaron", "Craig", "Billy", "James"],
      last: ["Robertson", "McGinn", "McTominay", "Tierney", "McGregor", "Christie", "Armstrong", "Dykes", "Patterson", "Ferguson", "Hanley", "Hickey", "Gordon", "Gilmour", "Forrest"]
    },
    "Turkey": {
      first: ["Hakan", "Çağlar", "Merih", "Cengiz", "Kenan", "Okay", "Ozan", "Zeki", "Orkun", "Yunus", "Burak", "Enes", "Berkan", "Emre", "Kerem"],
      last: ["Çalhanoğlu", "Söyüncü", "Demiral", "Ünder", "Karaman", "Yokuşlu", "Kabak", "Çelik", "Kökçü", "Mallı", "Yılmaz", "Ünal", "Kutlu", "Mor", "Aktürkoğlu"]
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
      const nationality = Math.random() < 0.6 ? primaryNationality : 
        ["England", "Spain", "Germany", "France", "Italy", "Portugal", "Netherlands", "Belgium", "Scotland", "Turkey"][Math.floor(Math.random() * 10)];
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

    console.log('Starting comprehensive database seeding...');
    console.log(`Total teams to insert: ${allTeams.length}`);

    // 1. Insert leagues
    console.log('Inserting leagues...');
    const { error: leaguesError } = await supabase
      .from('leagues')
      .upsert(leagues, { onConflict: 'id' });
    
    if (leaguesError) throw leaguesError;
    console.log(`✓ Inserted ${leagues.length} leagues`);

    // 2. Insert teams
    console.log('Inserting teams...');
    const teamsToInsert = allTeams.map(t => ({
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
    console.log(`✓ Inserted ${allTeams.length} teams`);

    // 3. Generate and insert players for each team
    console.log('Generating players for all teams...');
    const allPlayers = [];
    
    for (const team of allTeams) {
      const primaryNationality = team.country;
      const squad = generateSquad(team.id, team.reputation, primaryNationality);
      allPlayers.push(...squad);
      console.log(`  Generated ${squad.length} players for ${team.name}`);
    }
    
    console.log(`✓ Generated ${allPlayers.length} total players`);
    console.log('Inserting players into database...');
    
    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < allPlayers.length; i += batchSize) {
      const batch = allPlayers.slice(i, i + batchSize);
      const { error: playersError } = await supabase
        .from('players')
        .upsert(batch, { onConflict: 'id' });
      
      if (playersError) throw playersError;
      console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allPlayers.length / batchSize)}`);
    }
    
    console.log('✓ Database seeding completed successfully!');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Complete European football database seeded successfully',
        stats: {
          leagues: leagues.length,
          teams: allTeams.length,
          players: allPlayers.length,
          averageSquadSize: Math.floor(allPlayers.length / allTeams.length)
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
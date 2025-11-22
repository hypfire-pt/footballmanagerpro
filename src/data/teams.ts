export interface Team {
  id: string;
  name: string;
  shortName: string;
  leagueId: string;
  country: string;
  founded: number;
  stadium: string;
  capacity: number;
  reputation: number;
  finances: number;
  colors: {
    primary: string;
    secondary: string;
  };
}

export const europeanTeams: Team[] = [
  // Premier League Teams
  {
    id: "man-city",
    name: "Manchester City",
    shortName: "Man City",
    leagueId: "premier-league",
    country: "England",
    founded: 1880,
    stadium: "Etihad Stadium",
    capacity: 55000,
    reputation: 95,
    finances: 500000000,
    colors: { primary: "#6CABDD", secondary: "#FFFFFF" }
  },
  {
    id: "arsenal",
    name: "Arsenal",
    shortName: "Arsenal",
    leagueId: "premier-league",
    country: "England",
    founded: 1886,
    stadium: "Emirates Stadium",
    capacity: 60704,
    reputation: 93,
    finances: 380000000,
    colors: { primary: "#EF0107", secondary: "#FFFFFF" }
  },
  {
    id: "liverpool",
    name: "Liverpool",
    shortName: "Liverpool",
    leagueId: "premier-league",
    country: "England",
    founded: 1892,
    stadium: "Anfield",
    capacity: 53394,
    reputation: 94,
    finances: 420000000,
    colors: { primary: "#C8102E", secondary: "#FFFFFF" }
  },
  {
    id: "man-utd",
    name: "Manchester United",
    shortName: "Man Utd",
    leagueId: "premier-league",
    country: "England",
    founded: 1878,
    stadium: "Old Trafford",
    capacity: 74879,
    reputation: 92,
    finances: 450000000,
    colors: { primary: "#DA291C", secondary: "#FFFFFF" }
  },
  {
    id: "chelsea",
    name: "Chelsea",
    shortName: "Chelsea",
    leagueId: "premier-league",
    country: "England",
    founded: 1905,
    stadium: "Stamford Bridge",
    capacity: 40834,
    reputation: 91,
    finances: 410000000,
    colors: { primary: "#034694", secondary: "#FFFFFF" }
  },
  {
    id: "tottenham",
    name: "Tottenham Hotspur",
    shortName: "Spurs",
    leagueId: "premier-league",
    country: "England",
    founded: 1882,
    stadium: "Tottenham Hotspur Stadium",
    capacity: 62850,
    reputation: 88,
    finances: 350000000,
    colors: { primary: "#132257", secondary: "#FFFFFF" }
  },
  {
    id: "newcastle",
    name: "Newcastle United",
    shortName: "Newcastle",
    leagueId: "premier-league",
    country: "England",
    founded: 1892,
    stadium: "St James' Park",
    capacity: 52305,
    reputation: 85,
    finances: 300000000,
    colors: { primary: "#241F20", secondary: "#FFFFFF" }
  },
  {
    id: "aston-villa",
    name: "Aston Villa",
    shortName: "Villa",
    leagueId: "premier-league",
    country: "England",
    founded: 1874,
    stadium: "Villa Park",
    capacity: 42682,
    reputation: 82,
    finances: 250000000,
    colors: { primary: "#95BFE5", secondary: "#670E36" }
  },

  // La Liga Teams
  {
    id: "real-madrid",
    name: "Real Madrid",
    shortName: "Real Madrid",
    leagueId: "la-liga",
    country: "Spain",
    founded: 1902,
    stadium: "Santiago Bernabéu",
    capacity: 81044,
    reputation: 98,
    finances: 600000000,
    colors: { primary: "#FFFFFF", secondary: "#00529F" }
  },
  {
    id: "barcelona",
    name: "FC Barcelona",
    shortName: "Barcelona",
    leagueId: "la-liga",
    country: "Spain",
    founded: 1899,
    stadium: "Camp Nou",
    capacity: 99354,
    reputation: 97,
    finances: 550000000,
    colors: { primary: "#A50044", secondary: "#004D98" }
  },
  {
    id: "atletico",
    name: "Atlético Madrid",
    shortName: "Atlético",
    leagueId: "la-liga",
    country: "Spain",
    founded: 1903,
    stadium: "Cívitas Metropolitano",
    capacity: 68456,
    reputation: 90,
    finances: 380000000,
    colors: { primary: "#CB3524", secondary: "#FFFFFF" }
  },
  {
    id: "sevilla",
    name: "Sevilla FC",
    shortName: "Sevilla",
    leagueId: "la-liga",
    country: "Spain",
    founded: 1890,
    stadium: "Ramón Sánchez Pizjuán",
    capacity: 43883,
    reputation: 85,
    finances: 280000000,
    colors: { primary: "#FFFFFF", secondary: "#F43333" }
  },
  {
    id: "villarreal",
    name: "Villarreal CF",
    shortName: "Villarreal",
    leagueId: "la-liga",
    country: "Spain",
    founded: 1923,
    stadium: "Estadio de la Cerámica",
    capacity: 23500,
    reputation: 83,
    finances: 240000000,
    colors: { primary: "#FFE667", secondary: "#005187" }
  },
  {
    id: "real-sociedad",
    name: "Real Sociedad",
    shortName: "Sociedad",
    leagueId: "la-liga",
    country: "Spain",
    founded: 1909,
    stadium: "Reale Arena",
    capacity: 39500,
    reputation: 81,
    finances: 220000000,
    colors: { primary: "#003D8F", secondary: "#FFFFFF" }
  },

  // Bundesliga Teams
  {
    id: "bayern",
    name: "Bayern Munich",
    shortName: "Bayern",
    leagueId: "bundesliga",
    country: "Germany",
    founded: 1900,
    stadium: "Allianz Arena",
    capacity: 75024,
    reputation: 96,
    finances: 520000000,
    colors: { primary: "#DC052D", secondary: "#0066B2" }
  },
  {
    id: "dortmund",
    name: "Borussia Dortmund",
    shortName: "Dortmund",
    leagueId: "bundesliga",
    country: "Germany",
    founded: 1909,
    stadium: "Signal Iduna Park",
    capacity: 81365,
    reputation: 89,
    finances: 360000000,
    colors: { primary: "#FDE100", secondary: "#000000" }
  },
  {
    id: "rb-leipzig",
    name: "RB Leipzig",
    shortName: "Leipzig",
    leagueId: "bundesliga",
    country: "Germany",
    founded: 2009,
    stadium: "Red Bull Arena",
    capacity: 47069,
    reputation: 84,
    finances: 310000000,
    colors: { primary: "#DD0741", secondary: "#FFFFFF" }
  },
  {
    id: "leverkusen",
    name: "Bayer Leverkusen",
    shortName: "Leverkusen",
    leagueId: "bundesliga",
    country: "Germany",
    founded: 1904,
    stadium: "BayArena",
    capacity: 30210,
    reputation: 85,
    finances: 290000000,
    colors: { primary: "#E32221", secondary: "#000000" }
  },
  {
    id: "frankfurt",
    name: "Eintracht Frankfurt",
    shortName: "Frankfurt",
    leagueId: "bundesliga",
    country: "Germany",
    founded: 1899,
    stadium: "Deutsche Bank Park",
    capacity: 51500,
    reputation: 82,
    finances: 250000000,
    colors: { primary: "#E1000F", secondary: "#000000" }
  },

  // Serie A Teams
  {
    id: "inter",
    name: "Inter Milan",
    shortName: "Inter",
    leagueId: "serie-a",
    country: "Italy",
    founded: 1908,
    stadium: "San Siro",
    capacity: 75923,
    reputation: 91,
    finances: 380000000,
    colors: { primary: "#0068A8", secondary: "#000000" }
  },
  {
    id: "ac-milan",
    name: "AC Milan",
    shortName: "Milan",
    leagueId: "serie-a",
    country: "Italy",
    founded: 1899,
    stadium: "San Siro",
    capacity: 75923,
    reputation: 90,
    finances: 370000000,
    colors: { primary: "#FB090B", secondary: "#000000" }
  },
  {
    id: "juventus",
    name: "Juventus",
    shortName: "Juventus",
    leagueId: "serie-a",
    country: "Italy",
    founded: 1897,
    stadium: "Allianz Stadium",
    capacity: 41507,
    reputation: 92,
    finances: 400000000,
    colors: { primary: "#000000", secondary: "#FFFFFF" }
  },
  {
    id: "napoli",
    name: "SSC Napoli",
    shortName: "Napoli",
    leagueId: "serie-a",
    country: "Italy",
    founded: 1926,
    stadium: "Stadio Diego Armando Maradona",
    capacity: 54726,
    reputation: 87,
    finances: 320000000,
    colors: { primary: "#007FFF", secondary: "#FFFFFF" }
  },
  {
    id: "roma",
    name: "AS Roma",
    shortName: "Roma",
    leagueId: "serie-a",
    country: "Italy",
    founded: 1927,
    stadium: "Stadio Olimpico",
    capacity: 70634,
    reputation: 86,
    finances: 300000000,
    colors: { primary: "#8B0304", secondary: "#F5A623" }
  },
  {
    id: "lazio",
    name: "SS Lazio",
    shortName: "Lazio",
    leagueId: "serie-a",
    country: "Italy",
    founded: 1900,
    stadium: "Stadio Olimpico",
    capacity: 70634,
    reputation: 84,
    finances: 280000000,
    colors: { primary: "#87CEEB", secondary: "#FFFFFF" }
  },

  // Ligue 1 Teams
  {
    id: "psg",
    name: "Paris Saint-Germain",
    shortName: "PSG",
    leagueId: "ligue-1",
    country: "France",
    founded: 1970,
    stadium: "Parc des Princes",
    capacity: 47929,
    reputation: 93,
    finances: 540000000,
    colors: { primary: "#004170", secondary: "#DA0812" }
  },
  {
    id: "marseille",
    name: "Olympique de Marseille",
    shortName: "Marseille",
    leagueId: "ligue-1",
    country: "France",
    founded: 1899,
    stadium: "Orange Vélodrome",
    capacity: 67394,
    reputation: 84,
    finances: 260000000,
    colors: { primary: "#2FAEE0", secondary: "#FFFFFF" }
  },
  {
    id: "lyon",
    name: "Olympique Lyonnais",
    shortName: "Lyon",
    leagueId: "ligue-1",
    country: "France",
    founded: 1950,
    stadium: "Groupama Stadium",
    capacity: 59186,
    reputation: 82,
    finances: 240000000,
    colors: { primary: "#DA020E", secondary: "#FFFFFF" }
  },
  {
    id: "monaco",
    name: "AS Monaco",
    shortName: "Monaco",
    leagueId: "ligue-1",
    country: "France",
    founded: 1924,
    stadium: "Stade Louis II",
    capacity: 18523,
    reputation: 83,
    finances: 270000000,
    colors: { primary: "#CB0101", secondary: "#FFFFFF" }
  },
  {
    id: "lille",
    name: "Lille OSC",
    shortName: "Lille",
    leagueId: "ligue-1",
    country: "France",
    founded: 1944,
    stadium: "Stade Pierre-Mauroy",
    capacity: 50186,
    reputation: 80,
    finances: 220000000,
    colors: { primary: "#D81E05", secondary: "#FFFFFF" }
  },

  // Portuguese Teams
  {
    id: "benfica",
    name: "SL Benfica",
    shortName: "Benfica",
    leagueId: "primeira-liga",
    country: "Portugal",
    founded: 1904,
    stadium: "Estádio da Luz",
    capacity: 64642,
    reputation: 87,
    finances: 290000000,
    colors: { primary: "#E30613", secondary: "#FFFFFF" }
  },
  {
    id: "porto",
    name: "FC Porto",
    shortName: "Porto",
    leagueId: "primeira-liga",
    country: "Portugal",
    founded: 1893,
    stadium: "Estádio do Dragão",
    capacity: 50033,
    reputation: 88,
    finances: 300000000,
    colors: { primary: "#003366", secondary: "#FFFFFF" }
  },
  {
    id: "sporting",
    name: "Sporting CP",
    shortName: "Sporting",
    leagueId: "primeira-liga",
    country: "Portugal",
    founded: 1906,
    stadium: "Estádio José Alvalade",
    capacity: 50095,
    reputation: 85,
    finances: 270000000,
    colors: { primary: "#009246", secondary: "#FFFFFF" }
  }
];

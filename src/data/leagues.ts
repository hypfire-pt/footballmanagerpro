export interface League {
  id: string;
  name: string;
  country: string;
  tier: number;
  confederation: string;
  reputation: number;
  founded: number;
}

export const europeanLeagues: League[] = [
  // England
  {
    id: "premier-league",
    name: "Premier League",
    country: "England",
    tier: 1,
    confederation: "UEFA",
    reputation: 98,
    founded: 1992
  },
  // Spain
  {
    id: "la-liga",
    name: "La Liga",
    country: "Spain",
    tier: 1,
    confederation: "UEFA",
    reputation: 97,
    founded: 1929
  },
  // Germany
  {
    id: "bundesliga",
    name: "Bundesliga",
    country: "Germany",
    tier: 1,
    confederation: "UEFA",
    reputation: 95,
    founded: 1963
  },
  // Italy
  {
    id: "serie-a",
    name: "Serie A",
    country: "Italy",
    tier: 1,
    confederation: "UEFA",
    reputation: 94,
    founded: 1898
  },
  // France
  {
    id: "ligue-1",
    name: "Ligue 1",
    country: "France",
    tier: 1,
    confederation: "UEFA",
    reputation: 90,
    founded: 1932
  },
  // Portugal
  {
    id: "primeira-liga",
    name: "Primeira Liga",
    country: "Portugal",
    tier: 1,
    confederation: "UEFA",
    reputation: 85,
    founded: 1934
  },
  // Netherlands
  {
    id: "eredivisie",
    name: "Eredivisie",
    country: "Netherlands",
    tier: 1,
    confederation: "UEFA",
    reputation: 83,
    founded: 1956
  },
  // Belgium
  {
    id: "pro-league",
    name: "Belgian Pro League",
    country: "Belgium",
    tier: 1,
    confederation: "UEFA",
    reputation: 80,
    founded: 1895
  },
  // Scotland
  {
    id: "scottish-premiership",
    name: "Scottish Premiership",
    country: "Scotland",
    tier: 1,
    confederation: "UEFA",
    reputation: 78,
    founded: 2013
  },
  // Turkey
  {
    id: "super-lig",
    name: "Süper Lig",
    country: "Turkey",
    tier: 1,
    confederation: "UEFA",
    reputation: 77,
    founded: 1959
  },
  // UEFA Competitions
  {
    id: "ucl",
    name: "UEFA Champions League",
    country: "Europe",
    tier: 0,
    confederation: "UEFA",
    reputation: 100,
    founded: 1955
  },
  {
    id: "uel",
    name: "UEFA Europa League",
    country: "Europe",
    tier: 0,
    confederation: "UEFA",
    reputation: 88,
    founded: 1971
  },
  {
    id: "uecl",
    name: "UEFA Conference League",
    country: "Europe",
    tier: 0,
    confederation: "UEFA",
    reputation: 75,
    founded: 2021
  }
];

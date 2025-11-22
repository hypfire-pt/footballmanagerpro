import { Player } from "@/types/game";

// Realistic player names by nationality
const playerNamesByNationality: Record<string, { first: string[]; last: string[] }> = {
  England: {
    first: ["Harry", "Jack", "James", "Marcus", "Phil", "Declan", "Bukayo", "Jordan", "Mason", "Raheem", "Trent", "Kyle", "John", "Ben", "Callum"],
    last: ["Kane", "Grealish", "Maddison", "Rashford", "Foden", "Rice", "Saka", "Henderson", "Mount", "Sterling", "Alexander-Arnold", "Walker", "Stones", "White", "Wilson"]
  },
  Spain: {
    first: ["Sergio", "David", "Álvaro", "Marco", "Pablo", "Iago", "Dani", "Pedro", "Carlos", "Alejandro", "Mikel", "Rodrigo", "Jordi", "Ferran", "Ansu"],
    last: ["García", "Silva", "Morata", "Asensio", "Sarabia", "Aspas", "Olmo", "González", "Soler", "Moreno", "Oyarzabal", "Hernández", "Alba", "Torres", "Fati"]
  },
  Germany: {
    first: ["Thomas", "Joshua", "Leon", "Kai", "Serge", "Timo", "Leroy", "Marco", "Julian", "Florian", "Jamal", "Ilkay", "Antonio", "Niklas", "David"],
    last: ["Müller", "Kimmich", "Goretzka", "Havertz", "Gnabry", "Werner", "Sané", "Reus", "Brandt", "Wirtz", "Musiala", "Gündogan", "Rüdiger", "Süle", "Raum"]
  },
  France: {
    first: ["Kylian", "Antoine", "Karim", "N'Golo", "Paul", "Ousmane", "Kingsley", "Eduardo", "Aurélien", "Jules", "Raphaël", "Theo", "Benjamin", "Adrien", "Olivier"],
    last: ["Mbappé", "Griezmann", "Benzema", "Kanté", "Pogba", "Dembélé", "Coman", "Camavinga", "Tchouaméni", "Koundé", "Varane", "Hernández", "Pavard", "Rabiot", "Giroud"]
  },
  Italy: {
    first: ["Lorenzo", "Federico", "Nicolò", "Marco", "Alessandro", "Leonardo", "Giacomo", "Matteo", "Davide", "Andrea", "Giovanni", "Gianluca", "Domenico", "Ciro", "Moise"],
    last: ["Insigne", "Chiesa", "Barella", "Verratti", "Bastoni", "Bonucci", "Raspadori", "Politano", "Frattesi", "Belotti", "Di Lorenzo", "Scamacca", "Berardi", "Immobile", "Kean"]
  },
  Portugal: {
    first: ["Cristiano", "Bruno", "Bernardo", "João", "Diogo", "Rafael", "Pedro", "Rúben", "Gonçalo", "André", "Renato", "Ricardo", "Nuno", "William", "Vitinha"],
    last: ["Ronaldo", "Fernandes", "Silva", "Félix", "Jota", "Leão", "Neto", "Dias", "Ramos", "Silva", "Sanches", "Horta", "Mendes", "Carvalho", "Ferreira"]
  },
  Brazil: {
    first: ["Neymar", "Vinícius", "Rodrygo", "Gabriel", "Casemiro", "Richarlison", "Raphinha", "Antony", "Bruno", "Fabinho", "Alisson", "Éder", "Lucas", "Roberto", "Fred"],
    last: ["Júnior", "Silva", "Goes", "Jesus", "Santos", "Andrade", "Dias", "Santos", "Guimarães", "Tavares", "Becker", "Militão", "Paquetá", "Firmino", "Rodrigues"]
  },
  Argentina: {
    first: ["Lionel", "Ángel", "Lautaro", "Paulo", "Julián", "Rodrigo", "Emiliano", "Alexis", "Cristian", "Giovani", "Lisandro", "Nicolás", "Alejandro", "Enzo", "Exequiel"],
    last: ["Messi", "Di María", "Martínez", "Dybala", "Álvarez", "De Paul", "Martínez", "Mac Allister", "Romero", "Lo Celso", "Martínez", "Otamendi", "Gómez", "Fernández", "Palacios"]
  },
  Netherlands: {
    first: ["Virgil", "Frenkie", "Memphis", "Cody", "Matthijs", "Denzel", "Steven", "Wout", "Daley", "Marten", "Ryan", "Jurriën", "Nathan", "Jeremie", "Xavi"],
    last: ["van Dijk", "de Jong", "Depay", "Gakpo", "de Ligt", "Dumfries", "Bergwijn", "Weghorst", "Blind", "de Roon", "Gravenberch", "Timber", "Aké", "Frimpong", "Simons"]
  },
  Belgium: {
    first: ["Kevin", "Romelu", "Eden", "Thibaut", "Youri", "Leandro", "Yannick", "Axel", "Dries", "Thomas", "Jérémy", "Timothy", "Amadou", "Charles", "Loïs"],
    last: ["De Bruyne", "Lukaku", "Hazard", "Courtois", "Tielemans", "Trossard", "Carrasco", "Witsel", "Mertens", "Meunier", "Doku", "Castagne", "Onana", "De Ketelaere", "Openda"]
  }
};

// Position-based attribute profiles
const positionProfiles: Record<string, { primary: string[]; secondary: string[] }> = {
  GK: {
    primary: ["reflexes", "positioning", "handling"],
    secondary: ["kicking", "command"]
  },
  CB: {
    primary: ["defending", "physical", "heading"],
    secondary: ["positioning", "passing"]
  },
  LB: {
    primary: ["pace", "defending", "stamina"],
    secondary: ["crossing", "dribbling"]
  },
  RB: {
    primary: ["pace", "defending", "stamina"],
    secondary: ["crossing", "dribbling"]
  },
  CDM: {
    primary: ["defending", "passing", "positioning"],
    secondary: ["stamina", "tackling"]
  },
  CM: {
    primary: ["passing", "stamina", "vision"],
    secondary: ["dribbling", "shooting"]
  },
  CAM: {
    primary: ["passing", "dribbling", "shooting"],
    secondary: ["vision", "flair"]
  },
  LW: {
    primary: ["pace", "dribbling", "crossing"],
    secondary: ["shooting", "stamina"]
  },
  RW: {
    primary: ["pace", "dribbling", "crossing"],
    secondary: ["shooting", "stamina"]
  },
  ST: {
    primary: ["shooting", "finishing", "positioning"],
    secondary: ["pace", "heading"]
  }
};

// Generate realistic attribute based on position and overall rating
function generateAttribute(position: string, attributeType: string, overall: number, isPrimary: boolean): number {
  const baseVariation = isPrimary ? 5 : 10;
  const variation = Math.floor(Math.random() * baseVariation) - (baseVariation / 2);
  const attribute = Math.max(40, Math.min(99, overall + variation + (isPrimary ? 5 : -5)));
  return attribute;
}

// Generate a realistic player
export function generatePlayer(
  teamId: string,
  nationality: string,
  position: string,
  targetOverall: number,
  age?: number
): Player {
  const namePool = playerNamesByNationality[nationality] || playerNamesByNationality["England"];
  const firstName = namePool.first[Math.floor(Math.random() * namePool.first.length)];
  const lastName = namePool.last[Math.floor(Math.random() * namePool.last.length)];
  
  const playerAge = age || Math.floor(Math.random() * 15) + 18; // 18-32
  const overall = targetOverall + Math.floor(Math.random() * 6) - 3;
  const potential = Math.min(99, overall + Math.floor(Math.random() * 15) + (playerAge < 23 ? 10 : 0));
  
  const profile = positionProfiles[position] || positionProfiles["CM"];
  
  // Generate attributes based on position
  const isPacePosition = ["LW", "RW", "ST", "LB", "RB"].includes(position);
  const isShootingPosition = ["ST", "CAM", "LW", "RW"].includes(position);
  const isDefendingPosition = ["CB", "LB", "RB", "CDM"].includes(position);
  
  const pace = isPacePosition 
    ? generateAttribute(position, "pace", overall, true)
    : generateAttribute(position, "pace", overall, false);
    
  const shooting = isShootingPosition
    ? generateAttribute(position, "shooting", overall, true)
    : generateAttribute(position, "shooting", overall, false);
    
  const passing = ["CM", "CAM", "CDM"].includes(position)
    ? generateAttribute(position, "passing", overall, true)
    : generateAttribute(position, "passing", overall, false);
    
  const defending = isDefendingPosition
    ? generateAttribute(position, "defending", overall, true)
    : generateAttribute(position, "defending", overall, false);
    
  const physical = ["CB", "CDM", "ST"].includes(position)
    ? generateAttribute(position, "physical", overall, true)
    : generateAttribute(position, "physical", overall, false);
    
  const technical = overall + Math.floor(Math.random() * 10) - 5;
  const mental = overall + Math.floor(Math.random() * 10) - 5;
  
  // Market value based on overall, age, and potential
  const baseValue = Math.pow(overall / 10, 3) * 100000;
  const ageMultiplier = playerAge < 23 ? 1.5 : playerAge < 27 ? 1.3 : playerAge < 30 ? 1.0 : 0.6;
  const potentialMultiplier = potential > overall + 10 ? 1.4 : 1.0;
  const marketValue = Math.floor(baseValue * ageMultiplier * potentialMultiplier);
  
  const wage = Math.floor(marketValue * 0.05); // Roughly 5% of market value per year
  
  return {
    id: `${teamId}-${firstName}-${lastName}-${Date.now()}-${Math.random()}`.toLowerCase().replace(/\s/g, '-'),
    name: `${firstName} ${lastName}`,
    position,
    nationality,
    age: playerAge,
    overall,
    pace,
    shooting,
    passing,
    defending,
    physical,
    technical,
    mental,
    potential,
    marketValue,
    wage,
    contract: `${new Date().getFullYear() + Math.floor(Math.random() * 4) + 1}`,
    fitness: Math.floor(Math.random() * 20) + 80,
    morale: Math.floor(Math.random() * 30) + 70,
    form: Math.floor(Math.random() * 3) + 6
  };
}

// Generate a squad for a team
export function generateSquad(teamId: string, teamReputation: number, primaryNationality: string): Player[] {
  const squad: Player[] = [];
  
  // Determine squad quality based on team reputation
  const baseOverall = Math.floor(teamReputation * 0.65) + 20; // 50-85 range
  
  // Squad composition
  const squadTemplate = [
    { position: "GK", count: 2, overall: baseOverall },
    { position: "CB", count: 4, overall: baseOverall },
    { position: "LB", count: 2, overall: baseOverall - 2 },
    { position: "RB", count: 2, overall: baseOverall - 2 },
    { position: "CDM", count: 2, overall: baseOverall + 1 },
    { position: "CM", count: 3, overall: baseOverall + 2 },
    { position: "CAM", count: 2, overall: baseOverall + 3 },
    { position: "LW", count: 2, overall: baseOverall + 1 },
    { position: "RW", count: 2, overall: baseOverall + 1 },
    { position: "ST", count: 3, overall: baseOverall + 4 }
  ];
  
  // Mix of nationalities (70% primary, 30% other)
  const otherNationalities = Object.keys(playerNamesByNationality).filter(n => n !== primaryNationality);
  
  squadTemplate.forEach(template => {
    for (let i = 0; i < template.count; i++) {
      const isLocal = Math.random() < 0.7;
      const nationality = isLocal 
        ? primaryNationality 
        : otherNationalities[Math.floor(Math.random() * otherNationalities.length)];
      
      const player = generatePlayer(teamId, nationality, template.position, template.overall);
      squad.push(player);
    }
  });
  
  return squad;
}

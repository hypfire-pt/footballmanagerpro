import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Real player data for major European teams (2024-25 season)
const REAL_PLAYER_DATA: Record<string, any[]> = {
  "arsenal": [
    { name: "David Raya", position: "GK", nationality: "Spain", overall: 85 },
    { name: "Aaron Ramsdale", position: "GK", nationality: "England", overall: 82 },
    { name: "Ben White", position: "RB", nationality: "England", overall: 83 },
    { name: "William Saliba", position: "CB", nationality: "France", overall: 86 },
    { name: "Gabriel Magalhães", position: "CB", nationality: "Brazil", overall: 85 },
    { name: "Jakub Kiwior", position: "CB", nationality: "Poland", overall: 78 },
    { name: "Oleksandr Zinchenko", position: "LB", nationality: "Ukraine", overall: 82 },
    { name: "Takehiro Tomiyasu", position: "RB", nationality: "Japan", overall: 81 },
    { name: "Thomas Partey", position: "CDM", nationality: "Ghana", overall: 83 },
    { name: "Declan Rice", position: "CDM", nationality: "England", overall: 87 },
    { name: "Jorginho", position: "CDM", nationality: "Italy", overall: 82 },
    { name: "Martin Ødegaard", position: "CAM", nationality: "Norway", overall: 87 },
    { name: "Kai Havertz", position: "CAM", nationality: "Germany", overall: 84 },
    { name: "Fabio Vieira", position: "CAM", nationality: "Portugal", overall: 79 },
    { name: "Bukayo Saka", position: "RW", nationality: "England", overall: 87 },
    { name: "Gabriel Martinelli", position: "LW", nationality: "Brazil", overall: 84 },
    { name: "Leandro Trossard", position: "LW", nationality: "Belgium", overall: 83 },
    { name: "Gabriel Jesus", position: "ST", nationality: "Brazil", overall: 83 },
    { name: "Eddie Nketiah", position: "ST", nationality: "England", overall: 78 }
  ],
  "liverpool": [
    { name: "Alisson Becker", position: "GK", nationality: "Brazil", overall: 89 },
    { name: "Caoimhín Kelleher", position: "GK", nationality: "Ireland", overall: 79 },
    { name: "Trent Alexander-Arnold", position: "RB", nationality: "England", overall: 87 },
    { name: "Virgil van Dijk", position: "CB", nationality: "Netherlands", overall: 89 },
    { name: "Ibrahima Konaté", position: "CB", nationality: "France", overall: 84 },
    { name: "Joe Gomez", position: "CB", nationality: "England", overall: 81 },
    { name: "Andy Robertson", position: "LB", nationality: "Scotland", overall: 85 },
    { name: "Konstantinos Tsimikas", position: "LB", nationality: "Greece", overall: 79 },
    { name: "Wataru Endō", position: "CDM", nationality: "Japan", overall: 80 },
    { name: "Alexis Mac Allister", position: "CM", nationality: "Argentina", overall: 84 },
    { name: "Dominik Szoboszlai", position: "CM", nationality: "Hungary", overall: 83 },
    { name: "Curtis Jones", position: "CM", nationality: "England", overall: 79 },
    { name: "Ryan Gravenberch", position: "CM", nationality: "Netherlands", overall: 80 },
    { name: "Mohamed Salah", position: "RW", nationality: "Egypt", overall: 89 },
    { name: "Luis Díaz", position: "LW", nationality: "Colombia", overall: 84 },
    { name: "Cody Gakpo", position: "LW", nationality: "Netherlands", overall: 83 },
    { name: "Darwin Núñez", position: "ST", nationality: "Uruguay", overall: 82 },
    { name: "Diogo Jota", position: "ST", nationality: "Portugal", overall: 84 }
  ],
  "manchester-city": [
    { name: "Ederson", position: "GK", nationality: "Brazil", overall: 88 },
    { name: "Stefan Ortega", position: "GK", nationality: "Germany", overall: 80 },
    { name: "Kyle Walker", position: "RB", nationality: "England", overall: 84 },
    { name: "John Stones", position: "CB", nationality: "England", overall: 85 },
    { name: "Rúben Dias", position: "CB", nationality: "Portugal", overall: 87 },
    { name: "Manuel Akanji", position: "CB", nationality: "Switzerland", overall: 83 },
    { name: "Nathan Aké", position: "CB", nationality: "Netherlands", overall: 82 },
    { name: "Josko Gvardiol", position: "LB", nationality: "Croatia", overall: 84 },
    { name: "Rodri", position: "CDM", nationality: "Spain", overall: 91 },
    { name: "Mateo Kovačić", position: "CM", nationality: "Croatia", overall: 84 },
    { name: "Bernardo Silva", position: "CM", nationality: "Portugal", overall: 88 },
    { name: "Phil Foden", position: "CAM", nationality: "England", overall: 87 },
    { name: "Kevin De Bruyne", position: "CAM", nationality: "Belgium", overall: 90 },
    { name: "Jack Grealish", position: "LW", nationality: "England", overall: 84 },
    { name: "Jérémy Doku", position: "RW", nationality: "Belgium", overall: 83 },
    { name: "Savinho", position: "RW", nationality: "Brazil", overall: 78 },
    { name: "Erling Haaland", position: "ST", nationality: "Norway", overall: 91 },
    { name: "Julián Álvarez", position: "ST", nationality: "Argentina", overall: 82 }
  ],
  "manchester-united": [
    { name: "André Onana", position: "GK", nationality: "Cameroon", overall: 84 },
    { name: "Altay Bayındır", position: "GK", nationality: "Turkey", overall: 77 },
    { name: "Diogo Dalot", position: "RB", nationality: "Portugal", overall: 81 },
    { name: "Lisandro Martínez", position: "CB", nationality: "Argentina", overall: 84 },
    { name: "Raphaël Varane", position: "CB", nationality: "France", overall: 85 },
    { name: "Harry Maguire", position: "CB", nationality: "England", overall: 81 },
    { name: "Luke Shaw", position: "LB", nationality: "England", overall: 82 },
    { name: "Tyrell Malacia", position: "LB", nationality: "Netherlands", overall: 77 },
    { name: "Casemiro", position: "CDM", nationality: "Brazil", overall: 85 },
    { name: "Kobbie Mainoo", position: "CM", nationality: "England", overall: 76 },
    { name: "Bruno Fernandes", position: "CAM", nationality: "Portugal", overall: 88 },
    { name: "Mason Mount", position: "CAM", nationality: "England", overall: 81 },
    { name: "Christian Eriksen", position: "CM", nationality: "Denmark", overall: 82 },
    { name: "Marcus Rashford", position: "LW", nationality: "England", overall: 85 },
    { name: "Alejandro Garnacho", position: "LW", nationality: "Argentina", overall: 77 },
    { name: "Antony", position: "RW", nationality: "Brazil", overall: 80 },
    { name: "Rasmus Højlund", position: "ST", nationality: "Denmark", overall: 79 },
    { name: "Anthony Martial", position: "ST", nationality: "France", overall: 79 }
  ],
  "chelsea": [
    { name: "Robert Sánchez", position: "GK", nationality: "Spain", overall: 80 },
    { name: "Đorđe Petrović", position: "GK", nationality: "Serbia", overall: 76 },
    { name: "Reece James", position: "RB", nationality: "England", overall: 84 },
    { name: "Axel Disasi", position: "CB", nationality: "France", overall: 80 },
    { name: "Thiago Silva", position: "CB", nationality: "Brazil", overall: 85 },
    { name: "Levi Colwill", position: "CB", nationality: "England", overall: 78 },
    { name: "Ben Chilwell", position: "LB", nationality: "England", overall: 81 },
    { name: "Marc Cucurella", position: "LB", nationality: "Spain", overall: 80 },
    { name: "Moisés Caicedo", position: "CDM", nationality: "Ecuador", overall: 82 },
    { name: "Enzo Fernández", position: "CM", nationality: "Argentina", overall: 84 },
    { name: "Conor Gallagher", position: "CM", nationality: "England", overall: 80 },
    { name: "Cole Palmer", position: "CAM", nationality: "England", overall: 84 },
    { name: "Raheem Sterling", position: "LW", nationality: "England", overall: 84 },
    { name: "Mykhailo Mudryk", position: "LW", nationality: "Ukraine", overall: 79 },
    { name: "Noni Madueke", position: "RW", nationality: "England", overall: 77 },
    { name: "Christopher Nkunku", position: "ST", nationality: "France", overall: 85 },
    { name: "Nicolas Jackson", position: "ST", nationality: "Senegal", overall: 78 }
  ],
  "real-madrid": [
    { name: "Thibaut Courtois", position: "GK", nationality: "Belgium", overall: 89 },
    { name: "Andriy Lunin", position: "GK", nationality: "Ukraine", overall: 79 },
    { name: "Dani Carvajal", position: "RB", nationality: "Spain", overall: 84 },
    { name: "Éder Militão", position: "CB", nationality: "Brazil", overall: 85 },
    { name: "Antonio Rüdiger", position: "CB", nationality: "Germany", overall: 87 },
    { name: "David Alaba", position: "CB", nationality: "Austria", overall: 85 },
    { name: "Ferland Mendy", position: "LB", nationality: "France", overall: 82 },
    { name: "Fran García", position: "LB", nationality: "Spain", overall: 78 },
    { name: "Eduardo Camavinga", position: "CDM", nationality: "France", overall: 84 },
    { name: "Aurélien Tchouaméni", position: "CDM", nationality: "France", overall: 85 },
    { name: "Federico Valverde", position: "CM", nationality: "Uruguay", overall: 87 },
    { name: "Luka Modrić", position: "CM", nationality: "Croatia", overall: 87 },
    { name: "Jude Bellingham", position: "CAM", nationality: "England", overall: 88 },
    { name: "Brahim Díaz", position: "CAM", nationality: "Morocco", overall: 81 },
    { name: "Vinícius Júnior", position: "LW", nationality: "Brazil", overall: 90 },
    { name: "Rodrygo", position: "RW", nationality: "Brazil", overall: 85 },
    { name: "Kylian Mbappé", position: "ST", nationality: "France", overall: 92 },
    { name: "Endrick", position: "ST", nationality: "Brazil", overall: 77 }
  ],
  "barcelona": [
    { name: "Marc-André ter Stegen", position: "GK", nationality: "Germany", overall: 88 },
    { name: "Iñaki Peña", position: "GK", nationality: "Spain", overall: 75 },
    { name: "Jules Koundé", position: "RB", nationality: "France", overall: 84 },
    { name: "Ronald Araújo", position: "CB", nationality: "Uruguay", overall: 85 },
    { name: "Andreas Christensen", position: "CB", nationality: "Denmark", overall: 82 },
    { name: "Iñigo Martínez", position: "CB", nationality: "Spain", overall: 83 },
    { name: "Alejandro Balde", position: "LB", nationality: "Spain", overall: 79 },
    { name: "Marcos Alonso", position: "LB", nationality: "Spain", overall: 80 },
    { name: "Frenkie de Jong", position: "CM", nationality: "Netherlands", overall: 87 },
    { name: "Gavi", position: "CM", nationality: "Spain", overall: 85 },
    { name: "Pedri", position: "CAM", nationality: "Spain", overall: 87 },
    { name: "İlkay Gündoğan", position: "CM", nationality: "Germany", overall: 85 },
    { name: "Fermín López", position: "CM", nationality: "Spain", overall: 76 },
    { name: "Raphinha", position: "RW", nationality: "Brazil", overall: 84 },
    { name: "Lamine Yamal", position: "RW", nationality: "Spain", overall: 81 },
    { name: "Ferran Torres", position: "LW", nationality: "Spain", overall: 82 },
    { name: "Robert Lewandowski", position: "ST", nationality: "Poland", overall: 90 },
    { name: "João Félix", position: "ST", nationality: "Portugal", overall: 83 }
  ],
  "bayern": [
    { name: "Manuel Neuer", position: "GK", nationality: "Germany", overall: 88 },
    { name: "Sven Ulreich", position: "GK", nationality: "Germany", overall: 79 },
    { name: "Joshua Kimmich", position: "RB", nationality: "Germany", overall: 88 },
    { name: "Dayot Upamecano", position: "CB", nationality: "France", overall: 84 },
    { name: "Kim Min-jae", position: "CB", nationality: "South Korea", overall: 86 },
    { name: "Matthijs de Ligt", position: "CB", nationality: "Netherlands", overall: 85 },
    { name: "Alphonso Davies", position: "LB", nationality: "Canada", overall: 84 },
    { name: "Leon Goretzka", position: "CDM", nationality: "Germany", overall: 85 },
    { name: "Konrad Laimer", position: "CDM", nationality: "Austria", overall: 82 },
    { name: "João Palhinha", position: "CDM", nationality: "Portugal", overall: 84 },
    { name: "Jamal Musiala", position: "CAM", nationality: "Germany", overall: 87 },
    { name: "Thomas Müller", position: "CAM", nationality: "Germany", overall: 85 },
    { name: "Leroy Sané", position: "RW", nationality: "Germany", overall: 86 },
    { name: "Serge Gnabry", position: "RW", nationality: "Germany", overall: 84 },
    { name: "Kingsley Coman", position: "LW", nationality: "France", overall: 84 },
    { name: "Michael Olise", position: "RW", nationality: "France", overall: 81 },
    { name: "Harry Kane", position: "ST", nationality: "England", overall: 90 },
    { name: "Mathys Tel", position: "ST", nationality: "France", overall: 77 }
  ],
  "psg": [
    { name: "Gianluigi Donnarumma", position: "GK", nationality: "Italy", overall: 88 },
    { name: "Keylor Navas", position: "GK", nationality: "Costa Rica", overall: 83 },
    { name: "Achraf Hakimi", position: "RB", nationality: "Morocco", overall: 86 },
    { name: "Marquinhos", position: "CB", nationality: "Brazil", overall: 87 },
    { name: "Milan Škriniar", position: "CB", nationality: "Slovakia", overall: 85 },
    { name: "Lucas Hernández", position: "CB", nationality: "France", overall: 84 },
    { name: "Nuno Mendes", position: "LB", nationality: "Portugal", overall: 81 },
    { name: "Warren Zaïre-Emery", position: "CM", nationality: "France", overall: 78 },
    { name: "Vitinha", position: "CM", nationality: "Portugal", overall: 83 },
    { name: "Fabián Ruiz", position: "CM", nationality: "Spain", overall: 84 },
    { name: "Lee Kang-in", position: "CAM", nationality: "South Korea", overall: 80 },
    { name: "Marco Asensio", position: "CAM", nationality: "Spain", overall: 83 },
    { name: "Ousmane Dembélé", position: "RW", nationality: "France", overall: 86 },
    { name: "Bradley Barcola", position: "LW", nationality: "France", overall: 77 },
    { name: "Randal Kolo Muani", position: "ST", nationality: "France", overall: 82 },
    { name: "Gonçalo Ramos", position: "ST", nationality: "Portugal", overall: 81 }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user is admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabaseAdmin.rpc('is_admin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get teams to update
    const { data: teams } = await supabaseAdmin
      .from('teams')
      .select('id, name')
      .order('name');

    if (!teams) {
      return new Response(JSON.stringify({ error: 'No teams found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let updated = 0;
    const errors: string[] = [];

    // Update players for teams we have real data for
    for (const team of teams) {
      const realPlayers = REAL_PLAYER_DATA[team.id];
      
      if (realPlayers) {
        // Delete existing players
        await supabaseAdmin
          .from('players')
          .delete()
          .eq('team_id', team.id);

        // Insert real players
        const playersToInsert = realPlayers.map((p, index) => ({
          id: `${team.id}-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
          team_id: team.id,
          name: p.name,
          position: p.position,
          nationality: p.nationality,
          age: 18 + Math.floor(Math.random() * 20), // Random age 18-37
          date_of_birth: new Date(2006 - Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)).toISOString().split('T')[0],
          overall: p.overall,
          potential: Math.min(99, p.overall + Math.floor(Math.random() * 8)),
          pace: Math.max(40, p.overall + Math.floor(Math.random() * 10) - 5),
          shooting: Math.max(40, p.overall + Math.floor(Math.random() * 10) - 5),
          passing: Math.max(40, p.overall + Math.floor(Math.random() * 10) - 5),
          defending: p.position.includes('B') || p.position === 'CDM' ? Math.max(60, p.overall + 5) : Math.max(40, p.overall - 10),
          physical: Math.max(40, p.overall + Math.floor(Math.random() * 10) - 5),
          technical: Math.max(40, p.overall + Math.floor(Math.random() * 10) - 5),
          mental: Math.max(40, p.overall + Math.floor(Math.random() * 10) - 5),
          height: 160 + Math.floor(Math.random() * 35), // 160-195 cm
          weight: 60 + Math.floor(Math.random() * 35), // 60-95 kg
          preferred_foot: Math.random() > 0.3 ? 'Right' : 'Left',
          market_value: Math.floor((p.overall - 50) * 1000000 * (1 + Math.random())),
          wage: Math.floor((p.overall - 50) * 10000 * (1 + Math.random())),
          contract_expiry: new Date(2026 + Math.floor(Math.random() * 4), 5, 30).toISOString().split('T')[0]
        }));

        const { error } = await supabaseAdmin
          .from('players')
          .insert(playersToInsert);

        if (error) {
          errors.push(`${team.name}: ${error.message}`);
        } else {
          updated++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated,
        totalTeams: teams.length,
        message: `Updated ${updated} teams with real player data`,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

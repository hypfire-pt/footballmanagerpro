import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchRequest {
  homeTeam: {
    name: string;
    players: any[];
    tactics: any;
  };
  awayTeam: {
    name: string;
    players: any[];
    tactics: any;
  };
  competition: string;
  matchday: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const matchData: MatchRequest = await req.json();
    console.log('[AI MATCH SIM] Starting simulation:', matchData.homeTeam.name, 'vs', matchData.awayTeam.name);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build detailed match context
    const systemPrompt = `You are an advanced football match simulator. Generate realistic match events, scores, and narratives based on team quality, tactics, and player attributes.

Your output must be valid JSON with this exact structure:
{
  "homeScore": number,
  "awayScore": number,
  "events": [
    {
      "minute": number (1-90),
      "type": "goal" | "yellow_card" | "red_card" | "substitution" | "injury" | "chance" | "save",
      "team": "home" | "away",
      "player": "player name",
      "description": "brief description of what happened"
    }
  ],
  "stats": {
    "possession": {"home": number, "away": number},
    "shots": {"home": number, "away": number},
    "shotsOnTarget": {"home": number, "away": number},
    "corners": {"home": number, "away": number},
    "fouls": {"home": number, "away": number},
    "passes": {"home": number, "away": number},
    "passAccuracy": {"home": number, "away": number}
  },
  "narrative": "2-3 sentence match summary"
}

Consider:
- Team strength and player ratings
- Tactical setup (formation, mentality, pressing)
- Realistic event distribution throughout 90 minutes
- Varied goal scorers (don't always use the same players)
- Realistic scorelines (most matches end 0-3 goals per team)
- Cards based on tackling/pressing intensity
- Momentum shifts during the match`;

    const userPrompt = `Simulate this match:

**${matchData.homeTeam.name}** (Home) vs **${matchData.awayTeam.name}** (Away)
Competition: ${matchData.competition} - Matchday ${matchData.matchday}

Home Team:
- Formation: ${matchData.homeTeam.tactics?.formation || '4-4-2'}
- Mentality: ${matchData.homeTeam.tactics?.mentality || 'balanced'}
- Top Players: ${matchData.homeTeam.players.slice(0, 5).map(p => `${p.name} (${p.overall})`).join(', ')}

Away Team:
- Formation: ${matchData.awayTeam.tactics?.formation || '4-4-2'}
- Mentality: ${matchData.awayTeam.tactics?.mentality || 'balanced'}
- Top Players: ${matchData.awayTeam.players.slice(0, 5).map(p => `${p.name} (${p.overall})`).join(', ')}

Generate a realistic match simulation with varied goal scorers and realistic events.`;

    console.log('[AI MATCH SIM] Calling AI Gateway...');

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8, // Higher for more variety in outcomes
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[AI MATCH SIM] AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    console.log('[AI MATCH SIM] AI Response received');
    
    let matchResult;
    try {
      matchResult = JSON.parse(content);
    } catch (parseError) {
      console.error('[AI MATCH SIM] Failed to parse AI response:', content);
      throw new Error("Invalid JSON response from AI");
    }

    console.log('[AI MATCH SIM] Match simulated:', matchResult.homeScore, '-', matchResult.awayScore);
    console.log('[AI MATCH SIM] Events generated:', matchResult.events?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        result: matchResult,
        homeTeam: matchData.homeTeam.name,
        awayTeam: matchData.awayTeam.name
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('[AI MATCH SIM] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

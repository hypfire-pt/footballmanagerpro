-- Update team logos for all European clubs
-- Using Wikipedia Commons and official sources

-- Premier League Teams
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg' WHERE name = 'Manchester City';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg' WHERE name = 'Liverpool';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg' WHERE name = 'Chelsea';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg' WHERE name = 'Arsenal';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg' WHERE name = 'Manchester United';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/6/6d/Tottenham_Hotspur.svg' WHERE name = 'Tottenham Hotspur';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/fc/Newcastle_United_Logo.svg' WHERE name = 'Newcastle United';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/e9/Brighton_%26_Hove_Albion_logo.svg' WHERE name = 'Brighton & Hove Albion';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/7/7c/Aston_Villa_FC_crest_%282016%29.svg' WHERE name = 'Aston Villa';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/2/2a/West_Ham_United_FC_logo.svg' WHERE name = 'West Ham United';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/c/c9/Brentford_FC_crest.svg' WHERE name = 'Brentford';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f4/Fulham_FC_%28shield%29.svg' WHERE name = 'Fulham';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/4/47/AFC_Bournemouth_%282013%29.svg' WHERE name = 'AFC Bournemouth';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/ff/Wolverhampton_Wanderers.svg' WHERE name = 'Wolverhampton Wanderers';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/8/8b/Everton_FC_logo.svg' WHERE name = 'Everton';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/4/4c/Nottingham_Forest_logo.svg' WHERE name = 'Nottingham Forest';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/0/02/Leicester_City_crest.svg' WHERE name = 'Leicester City';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/fc/Crystal_Palace_FC_logo.svg' WHERE name = 'Crystal Palace';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/7/77/Ipswich_Town.svg' WHERE name = 'Ipswich Town';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/fc/Southampton_FC_logo.svg' WHERE name = 'Southampton';

-- La Liga Teams
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg' WHERE name = 'Real Madrid';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' WHERE name = 'Barcelona';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg' WHERE name = 'Atlético Madrid';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/7/7a/Real_Sociedad_logo.svg' WHERE name = 'Real Sociedad';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/e3/Athletic_Bilbao.svg' WHERE name = 'Athletic Bilbao';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f1/Villarreal_CF_logo-en.svg' WHERE name = 'Villarreal';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a0/Real_Betis_logo.svg' WHERE name = 'Real Betis';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/6/68/Sevilla_FC_logo.svg' WHERE name = 'Sevilla';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a8/Valencia_CF_logo.svg' WHERE name = 'Valencia';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a7/Girona_FC_logo.svg' WHERE name = 'Girona';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/9/94/Getafe_logo.svg' WHERE name = 'Getafe';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/4/41/Real_Valladolid_Logo.svg' WHERE name = 'Real Valladolid';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/4/48/CA_Osasuna_logo.svg' WHERE name = 'Osasuna';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f2/Deportivo_Alaves_logo.svg' WHERE name = 'Alavés';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f6/RCD_Mallorca.svg' WHERE name = 'Mallorca';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/0/0c/Rayo_Vallecano_logo.svg' WHERE name = 'Rayo Vallecano';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/1/1f/Celta_Vigo_logo.svg' WHERE name = 'Celta Vigo';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/b6/Espanyol_logo.svg' WHERE name = 'Espanyol';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/b4/UD_Las_Palmas_logo.svg' WHERE name = 'Las Palmas';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/d/d4/CD_Legan%C3%A9s_logo.svg' WHERE name = 'Leganés';

-- Bundesliga Teams
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg' WHERE name = 'Bayern Munich';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Borussia_Dortmund_logo.svg' WHERE name = 'Borussia Dortmund';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/6/60/RB_Leipzig_2014_logo.svg' WHERE name = 'RB Leipzig';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Bayer_Leverkusen_Logo.svg' WHERE name = 'Bayer Leverkusen';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/e/e0/VfB_Stuttgart_1893_Logo.svg' WHERE name = 'VfB Stuttgart';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/6/67/Eintracht_Frankfurt_Logo.svg' WHERE name = 'Eintracht Frankfurt';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/d/da/SC_Freiburg_logo.svg' WHERE name = 'SC Freiburg';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Borussia_M%C3%B6nchengladbach_logo.svg' WHERE name = 'Borussia Mönchengladbach';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/9/9b/VfL_Wolfsburg_Logo.svg' WHERE name = 'VfL Wolfsburg';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Augsburg_logo.svg' WHERE name = 'FC Augsburg';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/ac/1._FSV_Mainz_05_logo.svg' WHERE name = 'Mainz 05';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/9/9b/FC_Union_Berlin_logo.svg' WHERE name = 'Union Berlin';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/6/69/TSG_1899_Hoffenheim_logo.svg' WHERE name = 'Hoffenheim';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/6/60/SV_Werder_Bremen_logo.svg' WHERE name = 'Werder Bremen';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/b/be/VfL_Bochum_logo.svg' WHERE name = 'VfL Bochum';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/0/04/FC_St._Pauli_logo.svg' WHERE name = 'St. Pauli';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f0/Holstein_Kiel_Logo.svg' WHERE name = 'Holstein Kiel';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/1/15/FC_Heidenheim_logo.svg' WHERE name = 'Heidenheim';

-- Serie A Teams
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/d/da/Juventus_Logo.svg' WHERE name = 'Juventus';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/5/5a/FC_Internazionale_Milano_2021.svg' WHERE name = 'Inter Milan';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg' WHERE name = 'AC Milan';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/5/53/SSC_Napoli_2024.svg' WHERE name = 'Napoli';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/6/6c/AS_Roma_logo_%282017%29.svg' WHERE name = 'AS Roma';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/c/c7/SS_Lazio_badge.svg' WHERE name = 'Lazio';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/6/66/ACF_Fiorentina.svg' WHERE name = 'Fiorentina';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f3/Atalanta_BC_logo.svg' WHERE name = 'Atalanta';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/e0/Bologna_FC_1909_logo.svg' WHERE name = 'Bologna';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/4/43/Torino_FC_Logo.svg' WHERE name = 'Torino';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/7/71/Hellas_Verona_FC_logo.svg' WHERE name = 'Hellas Verona';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/e8/Como_1907_logo.svg' WHERE name = 'Como';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/0/0c/Parma_Calcio_1913_logo.svg' WHERE name = 'Parma';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Cagliari_Calcio_1920_logo.svg' WHERE name = 'Cagliari';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/e2/Empoli_FC_logo.svg' WHERE name = 'Empoli';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/d/da/Logo_Udinese_Calcio_2024.svg' WHERE name = 'Udinese';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/8/85/UC_Sampdoria_logo.svg' WHERE name = 'Sampdoria';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/c/cf/US_Lecce_logo.svg' WHERE name = 'Lecce';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a6/Genoa_CFC_logo.svg' WHERE name = 'Genoa';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/1/1c/US_Salernitana_1919_logo.svg' WHERE name = 'Salernitana';

-- Ligue 1 Teams
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg' WHERE name = 'Paris Saint-Germain';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/c/c8/Olympique_de_Marseille_logo.svg' WHERE name = 'Marseille';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/1/1a/AS_Monaco_FC_Logo.svg' WHERE name = 'AS Monaco';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f2/Lille_OSC_%28logo%29.svg' WHERE name = 'Lille';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a5/Olympique_Lyonnais_logo.svg' WHERE name = 'Lyon';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/4/4f/Stade_Rennais_FC_logo.svg' WHERE name = 'Rennes';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/1/1d/RC_Lens_logo.svg' WHERE name = 'Lens';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/5/56/OGC_Nice_logo.svg' WHERE name = 'Nice';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Stade_Brestois_29_logo.svg' WHERE name = 'Brest';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/9/96/AJ_Auxerre_logo.svg' WHERE name = 'Auxerre';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/3/36/Angers_SCO_logo.svg' WHERE name = 'Angers';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/9/92/Stade_de_Reims_logo.svg' WHERE name = 'Reims';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/d/de/RC_Strasbourg_Alsace_logo.svg' WHERE name = 'Strasbourg';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/e6/Montpellier_HSC_logo.svg' WHERE name = 'Montpellier';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/5/53/FC_Nantes_logo.svg' WHERE name = 'Nantes';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/c/c0/Toulouse_FC_logo.svg' WHERE name = 'Toulouse';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f4/Le_Havre_AC_logo.svg' WHERE name = 'Le Havre';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/b6/AS_Saint-%C3%89tienne_logo.svg' WHERE name = 'Saint-Étienne';

-- Primeira Liga Teams
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg' WHERE name = 'Benfica';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg' WHERE name = 'Porto';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/1/1e/Sporting_Clube_de_Portugal_%28Logo%29.svg' WHERE name = 'Sporting CP';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Braga.svg' WHERE name = 'Braga';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/5/59/Vit%C3%B3ria_S.C._logo.svg' WHERE name = 'Vitória Guimarães';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a9/Moreirense_FC_logo.svg' WHERE name = 'Moreirense';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/5/5a/Rio_Ave_FC_logo.svg' WHERE name = 'Rio Ave';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/bd/FC_Famalic%C3%A3o_logo.svg' WHERE name = 'Famalicão';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a4/Casa_Pia_AC_logo.svg' WHERE name = 'Casa Pia';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/2/28/GD_Estoril_Praia_logo.svg' WHERE name = 'Estoril';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/2/2e/Boavista_FC_logo.svg' WHERE name = 'Boavista';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/9/9e/CD_Santa_Clara_logo.svg' WHERE name = 'Santa Clara';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/8/8d/Gil_Vicente_FC_logo.svg' WHERE name = 'Gil Vicente';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/9/91/CD_Nacional_logo.svg' WHERE name = 'Nacional';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/7/73/FC_Arouca_logo.svg' WHERE name = 'Arouca';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/b2/AVS_Futebol_SAD_logo.svg' WHERE name = 'AVS';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/4/4f/FC_Vizela_logo.svg' WHERE name = 'Vizela';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a8/Estrela_da_Amadora_logo.svg' WHERE name = 'Estrela da Amadora';

-- Eredivisie Teams
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg' WHERE name = 'Ajax';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg' WHERE name = 'PSV Eindhoven';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/c/c9/Feyenoord_logo.svg' WHERE name = 'Feyenoord';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/be/FC_Twente.svg' WHERE name = 'FC Twente';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/9/9c/AZ_Alkmaar_logo.svg' WHERE name = 'AZ Alkmaar';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/bd/FC_Utrecht.svg' WHERE name = 'FC Utrecht';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/bb/Go_Ahead_Eagles_logo.svg' WHERE name = 'Go Ahead Eagles';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a2/NEC_Nijmegen_logo.svg' WHERE name = 'NEC Nijmegen';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/f3/Fortuna_Sittard_logo.svg' WHERE name = 'Fortuna Sittard';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/6/6f/Heerenveen_logo.svg' WHERE name = 'Heerenveen';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/5/58/PEC_Zwolle.svg' WHERE name = 'PEC Zwolle';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/d/d5/FC_Groningen_logo.svg' WHERE name = 'FC Groningen';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/c/c3/Heracles_Almelo_logo.svg' WHERE name = 'Heracles Almelo';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/b7/NAC_Breda_logo.svg' WHERE name = 'NAC Breda';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/9/93/Willem_II_Tilburg_logo.svg' WHERE name = 'Willem II';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/8/8c/Sparta_Rotterdam_logo.svg' WHERE name = 'Sparta Rotterdam';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/3/3f/RKC_Waalwijk_logo.svg' WHERE name = 'RKC Waalwijk';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/aa/Almere_City_FC_logo.svg' WHERE name = 'Almere City';

-- Belgian Pro League Teams
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/9/94/Club_Brugge_KV_logo.svg' WHERE name = 'Club Brugge';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/a/a9/R.S.C._Anderlecht_logo.svg' WHERE name = 'Anderlecht';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/d/d6/KRC_Genk_logo.svg' WHERE name = 'Genk';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/6/67/Royal_Antwerp_FC_logo.svg' WHERE name = 'Royal Antwerp';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/3/3c/Standard_Li%C3%A8ge_logo.svg' WHERE name = 'Standard Liège';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/ec/K.A.A._Gent_logo.svg' WHERE name = 'KAA Gent';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/bd/Royale_Union_Saint-Gilloise_logo.svg' WHERE name = 'Union Saint-Gilloise';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/9/96/Sint-Truidense_VV_logo.svg' WHERE name = 'Sint-Truidense';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/1/17/K.V._Mechelen_logo.svg' WHERE name = 'KV Mechelen';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/f/fe/K.V._Kortrijk_logo.svg' WHERE name = 'KV Kortrijk';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/e5/Cercle_Brugge_K.S.V._logo.svg' WHERE name = 'Cercle Brugge';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/b/bd/OH_Leuven_logo.svg' WHERE name = 'OH Leuven';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/e/e8/K.V.C._Westerlo_logo.svg' WHERE name = 'Westerlo';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/1/10/Sporting_Charleroi_logo.svg' WHERE name = 'Charleroi';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/1/1f/FCV_Dender_EH_logo.svg' WHERE name = 'FCV Dender';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/5/5e/K.V._Oostende_logo.svg' WHERE name = 'KV Oostende';

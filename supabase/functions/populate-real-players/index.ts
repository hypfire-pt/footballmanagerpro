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
  ],
  "tottenham": [
    { name: "Guglielmo Vicario", position: "GK", nationality: "Italy", overall: 82 },
    { name: "Fraser Forster", position: "GK", nationality: "England", overall: 78 },
    { name: "Pedro Porro", position: "RB", nationality: "Spain", overall: 82 },
    { name: "Cristian Romero", position: "CB", nationality: "Argentina", overall: 85 },
    { name: "Micky van de Ven", position: "CB", nationality: "Netherlands", overall: 81 },
    { name: "Radu Drăgușin", position: "CB", nationality: "Romania", overall: 78 },
    { name: "Destiny Udogie", position: "LB", nationality: "Italy", overall: 78 },
    { name: "Ben Davies", position: "LB", nationality: "Wales", overall: 79 },
    { name: "Yves Bissouma", position: "CDM", nationality: "Mali", overall: 81 },
    { name: "Pape Matar Sarr", position: "CM", nationality: "Senegal", overall: 79 },
    { name: "Rodrigo Bentancur", position: "CM", nationality: "Uruguay", overall: 82 },
    { name: "James Maddison", position: "CAM", nationality: "England", overall: 84 },
    { name: "Dejan Kulusevski", position: "RW", nationality: "Sweden", overall: 83 },
    { name: "Brennan Johnson", position: "RW", nationality: "Wales", overall: 78 },
    { name: "Son Heung-min", position: "LW", nationality: "South Korea", overall: 87 },
    { name: "Timo Werner", position: "LW", nationality: "Germany", overall: 80 },
    { name: "Dominic Solanke", position: "ST", nationality: "England", overall: 79 },
    { name: "Richarlison", position: "ST", nationality: "Brazil", overall: 81 }
  ],
  "newcastle": [
    { name: "Nick Pope", position: "GK", nationality: "England", overall: 84 },
    { name: "Martin Dúbravka", position: "GK", nationality: "Slovakia", overall: 78 },
    { name: "Kieran Trippier", position: "RB", nationality: "England", overall: 83 },
    { name: "Sven Botman", position: "CB", nationality: "Netherlands", overall: 82 },
    { name: "Fabian Schär", position: "CB", nationality: "Switzerland", overall: 81 },
    { name: "Dan Burn", position: "CB", nationality: "England", overall: 79 },
    { name: "Lewis Hall", position: "LB", nationality: "England", overall: 75 },
    { name: "Tino Livramento", position: "RB", nationality: "England", overall: 77 },
    { name: "Bruno Guimarães", position: "CDM", nationality: "Brazil", overall: 86 },
    { name: "Sandro Tonali", position: "CDM", nationality: "Italy", overall: 84 },
    { name: "Joelinton", position: "CM", nationality: "Brazil", overall: 81 },
    { name: "Sean Longstaff", position: "CM", nationality: "England", overall: 76 },
    { name: "Anthony Gordon", position: "LW", nationality: "England", overall: 81 },
    { name: "Harvey Barnes", position: "LW", nationality: "England", overall: 79 },
    { name: "Miguel Almirón", position: "RW", nationality: "Paraguay", overall: 79 },
    { name: "Alexander Isak", position: "ST", nationality: "Sweden", overall: 85 },
    { name: "Callum Wilson", position: "ST", nationality: "England", overall: 80 }
  ],
  "aston-villa": [
    { name: "Emiliano Martínez", position: "GK", nationality: "Argentina", overall: 87 },
    { name: "Robin Olsen", position: "GK", nationality: "Sweden", overall: 76 },
    { name: "Ezri Konsa", position: "RB", nationality: "England", overall: 81 },
    { name: "Pau Torres", position: "CB", nationality: "Spain", overall: 83 },
    { name: "Diego Carlos", position: "CB", nationality: "Brazil", overall: 82 },
    { name: "Tyrone Mings", position: "CB", nationality: "England", overall: 79 },
    { name: "Lucas Digne", position: "LB", nationality: "France", overall: 81 },
    { name: "Matty Cash", position: "RB", nationality: "Poland", overall: 79 },
    { name: "Douglas Luiz", position: "CDM", nationality: "Brazil", overall: 83 },
    { name: "Boubacar Kamara", position: "CDM", nationality: "France", overall: 82 },
    { name: "John McGinn", position: "CM", nationality: "Scotland", overall: 81 },
    { name: "Youri Tielemans", position: "CM", nationality: "Belgium", overall: 82 },
    { name: "Leon Bailey", position: "RW", nationality: "Jamaica", overall: 81 },
    { name: "Moussa Diaby", position: "LW", nationality: "France", overall: 83 },
    { name: "Jacob Ramsey", position: "CM", nationality: "England", overall: 77 },
    { name: "Ollie Watkins", position: "ST", nationality: "England", overall: 85 },
    { name: "Jhon Durán", position: "ST", nationality: "Colombia", overall: 75 }
  ],
  "brighton": [
    { name: "Bart Verbruggen", position: "GK", nationality: "Netherlands", overall: 78 },
    { name: "Jason Steele", position: "GK", nationality: "England", overall: 74 },
    { name: "Tariq Lamptey", position: "RB", nationality: "Ghana", overall: 76 },
    { name: "Lewis Dunk", position: "CB", nationality: "England", overall: 81 },
    { name: "Jan Paul van Hecke", position: "CB", nationality: "Netherlands", overall: 77 },
    { name: "Igor Julio", position: "CB", nationality: "Brazil", overall: 76 },
    { name: "Pervis Estupiñán", position: "LB", nationality: "Ecuador", overall: 80 },
    { name: "Jack Hinshelwood", position: "RB", nationality: "England", overall: 73 },
    { name: "Mats Wieffer", position: "CDM", nationality: "Netherlands", overall: 78 },
    { name: "Carlos Baleba", position: "CDM", nationality: "Cameroon", overall: 76 },
    { name: "Billy Gilmour", position: "CM", nationality: "Scotland", overall: 77 },
    { name: "James Milner", position: "CM", nationality: "England", overall: 76 },
    { name: "Kaoru Mitoma", position: "LW", nationality: "Japan", overall: 82 },
    { name: "Simon Adingra", position: "RW", nationality: "Ivory Coast", overall: 76 },
    { name: "Julio Enciso", position: "CAM", nationality: "Paraguay", overall: 75 },
    { name: "João Pedro", position: "ST", nationality: "Brazil", overall: 80 },
    { name: "Danny Welbeck", position: "ST", nationality: "England", overall: 76 }
  ],
  "west-ham": [
    { name: "Alphonse Areola", position: "GK", nationality: "France", overall: 80 },
    { name: "Łukasz Fabiański", position: "GK", nationality: "Poland", overall: 77 },
    { name: "Vladimir Coufal", position: "RB", nationality: "Czech Republic", overall: 78 },
    { name: "Kurt Zouma", position: "CB", nationality: "France", overall: 80 },
    { name: "Max Kilman", position: "CB", nationality: "England", overall: 79 },
    { name: "Jean-Clair Todibo", position: "CB", nationality: "France", overall: 80 },
    { name: "Emerson Palmieri", position: "LB", nationality: "Italy", overall: 78 },
    { name: "Aaron Wan-Bissaka", position: "RB", nationality: "England", overall: 79 },
    { name: "Edson Álvarez", position: "CDM", nationality: "Mexico", overall: 82 },
    { name: "Tomáš Souček", position: "CDM", nationality: "Czech Republic", overall: 81 },
    { name: "Guido Rodríguez", position: "CDM", nationality: "Argentina", overall: 79 },
    { name: "Lucas Paquetá", position: "CAM", nationality: "Brazil", overall: 83 },
    { name: "Mohammed Kudus", position: "RW", nationality: "Ghana", overall: 81 },
    { name: "Jarrod Bowen", position: "RW", nationality: "England", overall: 83 },
    { name: "Crysencio Summerville", position: "LW", nationality: "Netherlands", overall: 77 },
    { name: "Niclas Füllkrug", position: "ST", nationality: "Germany", overall: 82 },
    { name: "Michail Antonio", position: "ST", nationality: "Jamaica", overall: 77 }
  ],
  "crystal-palace": [
    { name: "Dean Henderson", position: "GK", nationality: "England", overall: 79 },
    { name: "Sam Johnstone", position: "GK", nationality: "England", overall: 75 },
    { name: "Daniel Muñoz", position: "RB", nationality: "Colombia", overall: 76 },
    { name: "Marc Guéhi", position: "CB", nationality: "England", overall: 81 },
    { name: "Joachim Andersen", position: "CB", nationality: "Denmark", overall: 80 },
    { name: "Chris Richards", position: "CB", nationality: "USA", overall: 75 },
    { name: "Tyrick Mitchell", position: "LB", nationality: "England", overall: 76 },
    { name: "Nathaniel Clyne", position: "RB", nationality: "England", overall: 74 },
    { name: "Jefferson Lerma", position: "CDM", nationality: "Colombia", overall: 78 },
    { name: "Will Hughes", position: "CM", nationality: "England", overall: 75 },
    { name: "Adam Wharton", position: "CM", nationality: "England", overall: 74 },
    { name: "Eberechi Eze", position: "CAM", nationality: "England", overall: 82 },
    { name: "Michael Olise", position: "RW", nationality: "France", overall: 81 },
    { name: "Ismaïla Sarr", position: "RW", nationality: "Senegal", overall: 77 },
    { name: "Jordan Ayew", position: "LW", nationality: "Ghana", overall: 75 },
    { name: "Jean-Philippe Mateta", position: "ST", nationality: "France", overall: 78 },
    { name: "Odsonne Édouard", position: "ST", nationality: "France", overall: 76 }
  ],
  "fulham": [
    { name: "Bernd Leno", position: "GK", nationality: "Germany", overall: 82 },
    { name: "Marek Rodák", position: "GK", nationality: "Slovakia", overall: 74 },
    { name: "Kenny Tete", position: "RB", nationality: "Netherlands", overall: 77 },
    { name: "Issa Diop", position: "CB", nationality: "France", overall: 78 },
    { name: "Calvin Bassey", position: "CB", nationality: "Nigeria", overall: 77 },
    { name: "Tim Ream", position: "CB", nationality: "USA", overall: 76 },
    { name: "Antonee Robinson", position: "LB", nationality: "USA", overall: 80 },
    { name: "Sasa Lukić", position: "CDM", nationality: "Serbia", overall: 78 },
    { name: "João Palhinha", position: "CDM", nationality: "Portugal", overall: 84 },
    { name: "Harrison Reed", position: "CM", nationality: "England", overall: 74 },
    { name: "Tom Cairney", position: "CM", nationality: "Scotland", overall: 75 },
    { name: "Andreas Pereira", position: "CAM", nationality: "Brazil", overall: 80 },
    { name: "Harry Wilson", position: "RW", nationality: "Wales", overall: 77 },
    { name: "Willian", position: "RW", nationality: "Brazil", overall: 78 },
    { name: "Alex Iwobi", position: "LW", nationality: "Nigeria", overall: 78 },
    { name: "Raúl Jiménez", position: "ST", nationality: "Mexico", overall: 79 },
    { name: "Rodrigo Muniz", position: "ST", nationality: "Brazil", overall: 75 }
  ],
  "wolves": [
    { name: "José Sá", position: "GK", nationality: "Portugal", overall: 80 },
    { name: "Daniel Bentley", position: "GK", nationality: "England", overall: 73 },
    { name: "Nélson Semedo", position: "RB", nationality: "Portugal", overall: 80 },
    { name: "Max Kilman", position: "CB", nationality: "England", overall: 79 },
    { name: "Craig Dawson", position: "CB", nationality: "England", overall: 76 },
    { name: "Santiago Bueno", position: "CB", nationality: "Uruguay", overall: 75 },
    { name: "Rayan Aït-Nouri", position: "LB", nationality: "France", overall: 78 },
    { name: "Matt Doherty", position: "RB", nationality: "Ireland", overall: 75 },
    { name: "João Gomes", position: "CDM", nationality: "Brazil", overall: 79 },
    { name: "Mario Lemina", position: "CDM", nationality: "Gabon", overall: 78 },
    { name: "Tommy Doyle", position: "CM", nationality: "England", overall: 72 },
    { name: "Jean-Ricner Bellegarde", position: "CM", nationality: "France", overall: 75 },
    { name: "Pablo Sarabia", position: "CAM", nationality: "Spain", overall: 80 },
    { name: "Pedro Neto", position: "RW", nationality: "Portugal", overall: 81 },
    { name: "Hwang Hee-chan", position: "LW", nationality: "South Korea", overall: 78 },
    { name: "Matheus Cunha", position: "ST", nationality: "Brazil", overall: 81 },
    { name: "Sasa Kalajdzic", position: "ST", nationality: "Austria", overall: 76 }
  ],
  "bournemouth": [
    { name: "Neto", position: "GK", nationality: "Brazil", overall: 77 },
    { name: "Mark Travers", position: "GK", nationality: "Ireland", overall: 72 },
    { name: "Adam Smith", position: "RB", nationality: "England", overall: 74 },
    { name: "Illia Zabarnyi", position: "CB", nationality: "Ukraine", overall: 77 },
    { name: "Marcos Senesi", position: "CB", nationality: "Argentina", overall: 78 },
    { name: "Chris Mepham", position: "CB", nationality: "Wales", overall: 74 },
    { name: "Milos Kerkez", position: "LB", nationality: "Hungary", overall: 75 },
    { name: "Max Aarons", position: "RB", nationality: "England", overall: 74 },
    { name: "Lewis Cook", position: "CDM", nationality: "England", overall: 76 },
    { name: "Ryan Christie", position: "CM", nationality: "Scotland", overall: 75 },
    { name: "Tyler Adams", position: "CDM", nationality: "USA", overall: 77 },
    { name: "Philip Billing", position: "CM", nationality: "Denmark", overall: 76 },
    { name: "Marcus Tavernier", position: "LW", nationality: "England", overall: 76 },
    { name: "Luis Sinisterra", position: "LW", nationality: "Colombia", overall: 78 },
    { name: "Antoine Semenyo", position: "RW", nationality: "Ghana", overall: 76 },
    { name: "Dominic Solanke", position: "ST", nationality: "England", overall: 79 },
    { name: "Enes Ünal", position: "ST", nationality: "Turkey", overall: 76 }
  ],
  "nottingham-forest": [
    { name: "Matz Sels", position: "GK", nationality: "Belgium", overall: 76 },
    { name: "Matt Turner", position: "GK", nationality: "USA", overall: 74 },
    { name: "Neco Williams", position: "RB", nationality: "Wales", overall: 76 },
    { name: "Murillo", position: "CB", nationality: "Brazil", overall: 78 },
    { name: "Willy Boly", position: "CB", nationality: "Ivory Coast", overall: 77 },
    { name: "Scott McKenna", position: "CB", nationality: "Scotland", overall: 75 },
    { name: "Álex Moreno", position: "LB", nationality: "Spain", overall: 76 },
    { name: "Ola Aina", position: "RB", nationality: "Nigeria", overall: 75 },
    { name: "Danilo", position: "CDM", nationality: "Brazil", overall: 77 },
    { name: "Ibrahim Sangaré", position: "CDM", nationality: "Ivory Coast", overall: 79 },
    { name: "Ryan Yates", position: "CM", nationality: "England", overall: 74 },
    { name: "Nicolas Domínguez", position: "CM", nationality: "Argentina", overall: 76 },
    { name: "Morgan Gibbs-White", position: "CAM", nationality: "England", overall: 79 },
    { name: "Callum Hudson-Odoi", position: "LW", nationality: "England", overall: 77 },
    { name: "Anthony Elanga", position: "RW", nationality: "Sweden", overall: 76 },
    { name: "Chris Wood", position: "ST", nationality: "New Zealand", overall: 77 },
    { name: "Taiwo Awoniyi", position: "ST", nationality: "Nigeria", overall: 76 }
  ],
  "brentford": [
    { name: "Mark Flekken", position: "GK", nationality: "Netherlands", overall: 78 },
    { name: "Thomas Strakosha", position: "GK", nationality: "Albania", overall: 74 },
    { name: "Aaron Hickey", position: "RB", nationality: "Scotland", overall: 75 },
    { name: "Nathan Collins", position: "CB", nationality: "Ireland", overall: 77 },
    { name: "Ethan Pinnock", position: "CB", nationality: "Jamaica", overall: 76 },
    { name: "Ben Mee", position: "CB", nationality: "England", overall: 75 },
    { name: "Rico Henry", position: "LB", nationality: "England", overall: 76 },
    { name: "Kristoffer Ajer", position: "RB", nationality: "Norway", overall: 76 },
    { name: "Christian Nørgaard", position: "CDM", nationality: "Denmark", overall: 77 },
    { name: "Vitaly Janelt", position: "CM", nationality: "Germany", overall: 76 },
    { name: "Mathias Jensen", position: "CM", nationality: "Denmark", overall: 75 },
    { name: "Frank Onyeka", position: "CDM", nationality: "Nigeria", overall: 74 },
    { name: "Bryan Mbeumo", position: "RW", nationality: "Cameroon", overall: 80 },
    { name: "Yoane Wissa", position: "LW", nationality: "DR Congo", overall: 78 },
    { name: "Keane Lewis-Potter", position: "LW", nationality: "England", overall: 74 },
    { name: "Ivan Toney", position: "ST", nationality: "England", overall: 82 },
    { name: "Kevin Schade", position: "ST", nationality: "Germany", overall: 74 }
  ],
  "everton": [
    { name: "Jordan Pickford", position: "GK", nationality: "England", overall: 84 },
    { name: "João Virgínia", position: "GK", nationality: "Portugal", overall: 72 },
    { name: "Séamus Coleman", position: "RB", nationality: "Ireland", overall: 76 },
    { name: "James Tarkowski", position: "CB", nationality: "England", overall: 80 },
    { name: "Jarrad Branthwaite", position: "CB", nationality: "England", overall: 77 },
    { name: "Michael Keane", position: "CB", nationality: "England", overall: 76 },
    { name: "Vitalii Mykolenko", position: "LB", nationality: "Ukraine", overall: 75 },
    { name: "Ashley Young", position: "RB", nationality: "England", overall: 73 },
    { name: "Idrissa Gueye", position: "CDM", nationality: "Senegal", overall: 78 },
    { name: "Amadou Onana", position: "CDM", nationality: "Belgium", overall: 80 },
    { name: "James Garner", position: "CM", nationality: "England", overall: 75 },
    { name: "Abdoulaye Doucouré", position: "CM", nationality: "Mali", overall: 76 },
    { name: "Dwight McNeil", position: "LW", nationality: "England", overall: 77 },
    { name: "Jack Harrison", position: "RW", nationality: "England", overall: 76 },
    { name: "Iliman Ndiaye", position: "CAM", nationality: "Senegal", overall: 76 },
    { name: "Dominic Calvert-Lewin", position: "ST", nationality: "England", overall: 78 },
    { name: "Beto", position: "ST", nationality: "Portugal", overall: 75 }
  ],
  "leicester": [
    { name: "Mads Hermansen", position: "GK", nationality: "Denmark", overall: 74 },
    { name: "Danny Ward", position: "GK", nationality: "Wales", overall: 73 },
    { name: "James Justin", position: "RB", nationality: "England", overall: 77 },
    { name: "Wout Faes", position: "CB", nationality: "Belgium", overall: 76 },
    { name: "Jannik Vestergaard", position: "CB", nationality: "Denmark", overall: 75 },
    { name: "Caleb Okoli", position: "CB", nationality: "Italy", overall: 73 },
    { name: "Victor Kristiansen", position: "LB", nationality: "Denmark", overall: 74 },
    { name: "Ricardo Pereira", position: "RB", nationality: "Portugal", overall: 76 },
    { name: "Wilfred Ndidi", position: "CDM", nationality: "Nigeria", overall: 80 },
    { name: "Harry Winks", position: "CM", nationality: "England", overall: 76 },
    { name: "Boubakary Soumaré", position: "CM", nationality: "France", overall: 75 },
    { name: "Kiernan Dewsbury-Hall", position: "CM", nationality: "England", overall: 76 },
    { name: "Stephy Mavididi", position: "LW", nationality: "England", overall: 74 },
    { name: "Abdul Fatawu", position: "RW", nationality: "Ghana", overall: 73 },
    { name: "Bilal El Khannouss", position: "CAM", nationality: "Morocco", overall: 74 },
    { name: "Jamie Vardy", position: "ST", nationality: "England", overall: 77 },
    { name: "Patson Daka", position: "ST", nationality: "Zambia", overall: 75 }
  ],
  "ipswich": [
    { name: "Arijanet Muric", position: "GK", nationality: "Kosovo", overall: 72 },
    { name: "Christian Walton", position: "GK", nationality: "England", overall: 70 },
    { name: "Axel Tuanzebe", position: "RB", nationality: "England", overall: 73 },
    { name: "Luke Woolfenden", position: "CB", nationality: "England", overall: 71 },
    { name: "Cameron Burgess", position: "CB", nationality: "Australia", overall: 72 },
    { name: "Jacob Greaves", position: "CB", nationality: "England", overall: 72 },
    { name: "Leif Davis", position: "LB", nationality: "England", overall: 73 },
    { name: "Ben Johnson", position: "RB", nationality: "England", overall: 72 },
    { name: "Sam Morsy", position: "CDM", nationality: "Egypt", overall: 74 },
    { name: "Massimo Luongo", position: "CM", nationality: "Australia", overall: 72 },
    { name: "Kalvin Phillips", position: "CDM", nationality: "England", overall: 76 },
    { name: "Jens Cajuste", position: "CM", nationality: "Sweden", overall: 73 },
    { name: "Omari Hutchinson", position: "RW", nationality: "England", overall: 73 },
    { name: "Wes Burns", position: "RW", nationality: "Wales", overall: 71 },
    { name: "Nathan Broadhead", position: "LW", nationality: "Wales", overall: 72 },
    { name: "Liam Delap", position: "ST", nationality: "England", overall: 73 },
    { name: "George Hirst", position: "ST", nationality: "England", overall: 70 }
  ],
  "southampton": [
    { name: "Aaron Ramsdale", position: "GK", nationality: "England", overall: 82 },
    { name: "Alex McCarthy", position: "GK", nationality: "England", overall: 73 },
    { name: "Kyle Walker-Peters", position: "RB", nationality: "England", overall: 76 },
    { name: "Taylor Harwood-Bellis", position: "CB", nationality: "England", overall: 73 },
    { name: "Jan Bednarek", position: "CB", nationality: "Poland", overall: 75 },
    { name: "Jack Stephens", position: "CB", nationality: "England", overall: 72 },
    { name: "Ryan Manning", position: "LB", nationality: "Ireland", overall: 73 },
    { name: "James Bree", position: "RB", nationality: "England", overall: 72 },
    { name: "Flynn Downes", position: "CDM", nationality: "England", overall: 74 },
    { name: "Adam Lallana", position: "CM", nationality: "England", overall: 76 },
    { name: "Joe Aribo", position: "CM", nationality: "Nigeria", overall: 76 },
    { name: "Will Smallbone", position: "CM", nationality: "Ireland", overall: 72 },
    { name: "Mateus Fernandes", position: "CAM", nationality: "Portugal", overall: 73 },
    { name: "Samuel Edozie", position: "LW", nationality: "England", overall: 72 },
    { name: "Tyler Dibling", position: "RW", nationality: "England", overall: 71 },
    { name: "Cameron Archer", position: "ST", nationality: "England", overall: 73 },
    { name: "Adam Armstrong", position: "ST", nationality: "England", overall: 75 }
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized: missing token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: hasAdminRole, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (roleError || !hasAdminRole) {
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

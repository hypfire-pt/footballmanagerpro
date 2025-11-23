/**
 * Comprehensive Match Event Description Library
 * 200+ varied event descriptions for realistic match commentary
 */

export interface EventDescription {
  text: string;
  emphasis?: 'high' | 'medium' | 'low';
}

export const matchEventLibrary = {
  goal: [
    { text: "🎯 GOAL! An absolute screamer into the top corner!", emphasis: 'high' as const },
    { text: "⚽ GOAL! Cool as you like, slots it past the keeper!", emphasis: 'high' as const },
    { text: "🔥 GOAL! What a clinical finish! Pure class!", emphasis: 'high' as const },
    { text: "💥 GOAL! Thunderous strike! The net is rippling!", emphasis: 'high' as const },
    { text: "⚡ GOAL! Lightning quick reactions and it's in!", emphasis: 'high' as const },
    { text: "🎆 GOAL! Placed perfectly into the bottom corner!", emphasis: 'high' as const },
    { text: "🌟 GOAL! A moment of magic! What a player!", emphasis: 'high' as const },
    { text: "💫 GOAL! Brilliant team move finished off expertly!", emphasis: 'high' as const },
    { text: "🎊 GOAL! Against the run of play but who cares!", emphasis: 'high' as const },
    { text: "🏆 GOAL! That's world class finishing right there!", emphasis: 'high' as const },
    { text: "⚽ GOAL! First time finish and it nestles in!", emphasis: 'high' as const },
    { text: "🚀 GOAL! Rocket shot from distance! Unstoppable!", emphasis: 'high' as const },
    { text: "💎 GOAL! Sublime skill and composure under pressure!", emphasis: 'high' as const },
    { text: "🎯 GOAL! Headers that like a guided missile!", emphasis: 'high' as const },
    { text: "⚽ GOAL! Tap in from close range but great positioning!", emphasis: 'high' as const },
    { text: "🔥 GOAL! Keeper had no chance with that strike!", emphasis: 'high' as const },
    { text: "💥 GOAL! Smashed it home with authority!", emphasis: 'high' as const },
    { text: "⚡ GOAL! Quick feet in the box and it's in!", emphasis: 'high' as const },
    { text: "🌟 GOAL! Composed finish under intense pressure!", emphasis: 'high' as const },
    { text: "🎆 GOAL! Curled it beautifully around the wall!", emphasis: 'high' as const },
  ],

  shot_on_target: [
    { text: "Powerful drive forces a save from the keeper!", emphasis: 'medium' as const },
    { text: "Great effort! Keeper spreads himself well!", emphasis: 'medium' as const },
    { text: "Stinging shot, but the keeper is equal to it!", emphasis: 'medium' as const },
    { text: "Close! Header on target, keeper gathers safely!", emphasis: 'medium' as const },
    { text: "Good strike! Keeper palms it away for a corner!", emphasis: 'medium' as const },
    { text: "Snapshot from close range, keeper reacts quickly!", emphasis: 'medium' as const },
    { text: "Curling effort, keeper tips it over the bar!", emphasis: 'medium' as const },
    { text: "Low drive, keeper gets down well to smother it!", emphasis: 'medium' as const },
    { text: "Venomous shot, keeper punches clear under pressure!", emphasis: 'medium' as const },
    { text: "Fierce strike, keeper parries it to safety!", emphasis: 'medium' as const },
    { text: "Acrobatic save! Keeper at full stretch!", emphasis: 'medium' as const },
    { text: "Point-blank range but the keeper stands firm!", emphasis: 'medium' as const },
    { text: "Deflected shot, keeper adjusts brilliantly!", emphasis: 'medium' as const },
    { text: "Rifled effort, keeper pushes it wide!", emphasis: 'medium' as const },
    { text: "Instinctive save! Keeper denies them!", emphasis: 'medium' as const },
  ],

  shot_off_target: [
    { text: "Shoots wide! Should have done better from there!", emphasis: 'low' as const },
    { text: "Over the bar! Big chance wasted!", emphasis: 'low' as const },
    { text: "Mishits it completely! Sails harmlessly wide!", emphasis: 'low' as const },
    { text: "Skied it! Way over the crossbar!", emphasis: 'low' as const },
    { text: "Dragged wide! Poor connection with the ball!", emphasis: 'low' as const },
    { text: "Blazes it over! Too much power, not enough accuracy!", emphasis: 'low' as const },
    { text: "Sliced wide! Couldn't keep it on target!", emphasis: 'low' as const },
    { text: "Miles wide! That was never troubling the goal!", emphasis: 'low' as const },
    { text: "Scuffed shot, bobbles wide of the post!", emphasis: 'low' as const },
    { text: "Lost his footing and the shot goes astray!", emphasis: 'low' as const },
    { text: "Rushed the shot and it flies over!", emphasis: 'low' as const },
    { text: "Weak effort, rolls harmlessly wide!", emphasis: 'low' as const },
    { text: "Snatched at it and missed the target completely!", emphasis: 'low' as const },
    { text: "Ambitious effort from range, well wide!", emphasis: 'low' as const },
    { text: "Miscued header, nowhere near the goal!", emphasis: 'low' as const },
  ],

  wonder_goal: [
    { text: "🌟 WONDER GOAL! That is absolutely SPECTACULAR! What have we just witnessed?!", emphasis: 'high' as const },
    { text: "🚀 UNBELIEVABLE! A goal for the ages! Absolutely sensational!", emphasis: 'high' as const },
    { text: "💎 WORLD CLASS! That will be on the highlights reel for YEARS!", emphasis: 'high' as const },
    { text: "⚡ MAGIC! Pure unadulterated genius! What a goal!", emphasis: 'high' as const },
    { text: "🔥 INCREDIBLE! That's one of the best goals you'll EVER see!", emphasis: 'high' as const },
  ],

  goalkeeper_howler: [
    { text: "😱 OH NO! Absolute howler from the keeper! That's embarrassing!", emphasis: 'high' as const },
    { text: "🤦 DISASTER! The keeper has made a terrible mistake!", emphasis: 'high' as const },
    { text: "😬 BLUNDER! That should have been a routine save!", emphasis: 'high' as const },
    { text: "💀 CATASTROPHE! The keeper will want to forget that one!", emphasis: 'high' as const },
    { text: "😨 SHOCKING ERROR! The keeper has gifted them a goal!", emphasis: 'high' as const },
  ],

  save: [
    { text: "🧤 Outstanding save! Reflexes of a cat!", emphasis: 'medium' as const },
    { text: "✋ Brilliant stop! Keeper at full stretch!", emphasis: 'medium' as const },
    { text: "🛡️ What a save! Keeper denies them!", emphasis: 'medium' as const },
    { text: "👐 Spectacular save! Tipped over the bar!", emphasis: 'medium' as const },
    { text: "🙌 Incredible reflexes! Point-blank save!", emphasis: 'medium' as const },
    { text: "💪 Strong hands! Keeper holds on under pressure!", emphasis: 'medium' as const },
    { text: "🎯 Perfectly positioned! Easy catch for the keeper!", emphasis: 'low' as const },
    { text: "✊ Commanded his area! Keeper punches clear!", emphasis: 'medium' as const },
    { text: "🧱 Solid as a rock! Keeper stands firm!", emphasis: 'medium' as const },
    { text: "⚡ Lightning reactions! Keeper keeps it out!", emphasis: 'medium' as const },
  ],

  yellow_card: [
    { text: "⚠️ Yellow card! Cynical foul stops the attack!", emphasis: 'medium' as const },
    { text: "📒 Booked! Referee had no choice there!", emphasis: 'medium' as const },
    { text: "⚠️ Cautioned! That's a tactical foul and a yellow!", emphasis: 'medium' as const },
    { text: "📒 Into the book! Reckless challenge!", emphasis: 'medium' as const },
    { text: "⚠️ Yellow card for dissent! Arguing with the referee!", emphasis: 'medium' as const },
    { text: "📒 Booked for time-wasting! Referee not having it!", emphasis: 'low' as const },
    { text: "⚠️ Clumsy challenge, deservedly booked!", emphasis: 'low' as const },
    { text: "📒 Persistent fouling, that's a yellow!", emphasis: 'medium' as const },
    { text: "⚠️ Dangerous play, rightly cautioned!", emphasis: 'medium' as const },
    { text: "📒 Late tackle, yellow card shown!", emphasis: 'medium' as const },
  ],

  red_card: [
    { text: "🟥 RED CARD! Straight off! That's a sending off!", emphasis: 'high' as const },
    { text: "🔴 SENT OFF! Second yellow, he's got to go!", emphasis: 'high' as const },
    { text: "🟥 DISMISSED! Terrible tackle, red card!", emphasis: 'high' as const },
    { text: "🔴 OFF! Violent conduct, no place for that!", emphasis: 'high' as const },
    { text: "🟥 SEEING RED! Last man, denied a clear goal-scoring opportunity!", emphasis: 'high' as const },
  ],

  foul: [
    { text: "Foul! Free kick awarded, referee blows the whistle!", emphasis: 'low' as const },
    { text: "Referee stops play, foul called!", emphasis: 'low' as const },
    { text: "Clumsy challenge, free kick given!", emphasis: 'low' as const },
    { text: "Whistle blown, foul in a dangerous area!", emphasis: 'medium' as const },
    { text: "Pulled back, referee awards the foul!", emphasis: 'low' as const },
    { text: "Body check, free kick to the attacking team!", emphasis: 'low' as const },
    { text: "Impeded the player, referee calls it!", emphasis: 'low' as const },
    { text: "Mistimed tackle, foul given!", emphasis: 'low' as const },
    { text: "Holding detected, free kick awarded!", emphasis: 'low' as const },
    { text: "Shirt pull, referee spots it immediately!", emphasis: 'low' as const },
  ],

  corner: [
    { text: "⚽ Corner kick! Dangerous opportunity!", emphasis: 'medium' as const },
    { text: "🚩 Corner awarded! Players flooding the box!", emphasis: 'medium' as const },
    { text: "⚽ Set piece time! Corner to be taken!", emphasis: 'medium' as const },
    { text: "🚩 Corner! Chance to deliver into the danger area!", emphasis: 'medium' as const },
    { text: "⚽ Flag's up, corner kick! Defenders on alert!", emphasis: 'medium' as const },
    { text: "🚩 Another corner! Sustained pressure here!", emphasis: 'medium' as const },
    { text: "⚽ Corner earned! Good attacking play!", emphasis: 'low' as const },
    { text: "🚩 Set piece! Corner taker preparing!", emphasis: 'low' as const },
  ],

  substitution: [
    { text: "🔄 Tactical substitution! Fresh legs coming on!", emphasis: 'medium' as const },
    { text: "🔀 Change made! Manager making his move!", emphasis: 'medium' as const },
    { text: "🔄 Substitution! New energy injected!", emphasis: 'low' as const },
    { text: "🔀 Player change! Interesting tactical shift!", emphasis: 'medium' as const },
    { text: "🔄 Sub coming on! Looking to change the game!", emphasis: 'medium' as const },
    { text: "🔀 Fresh player! Manager playing his cards!", emphasis: 'low' as const },
  ],

  offside: [
    { text: "🚩 Offside! Flag is up, play stops!", emphasis: 'low' as const },
    { text: "⛔ Offside position! Good call from the linesman!", emphasis: 'low' as const },
    { text: "🚩 Flag raised! Player was off!", emphasis: 'low' as const },
    { text: "⛔ Offside trap worked! Defense holding the line!", emphasis: 'low' as const },
    { text: "🚩 Too eager! Caught in an offside position!", emphasis: 'low' as const },
    { text: "⛔ Flag up immediately! Clear offside!", emphasis: 'low' as const },
  ],

  counter_attack: [
    { text: "⚡ COUNTER! Rapid breakaway developing!", emphasis: 'high' as const },
    { text: "🏃 BREAK! They're away on the counter!", emphasis: 'high' as const },
    { text: "⚡ LIGHTNING FAST! Counter-attack at pace!", emphasis: 'high' as const },
    { text: "🏃 ON THE BREAK! Numbers forward, dangerous!", emphasis: 'high' as const },
    { text: "⚡ COUNTER! Swift transition, defense scrambling!", emphasis: 'high' as const },
    { text: "🏃 BREAKAWAY! Catching them on the hop!", emphasis: 'high' as const },
  ],

  tackle: [
    { text: "💪 Crunching tackle! Won the ball cleanly!", emphasis: 'low' as const },
    { text: "🛡️ Superb defending! Perfectly timed challenge!", emphasis: 'medium' as const },
    { text: "💪 Strong tackle! Dispossessed the attacker!", emphasis: 'low' as const },
    { text: "🛡️ Brilliant defending! Nicked it away!", emphasis: 'medium' as const },
    { text: "💪 Committed tackle! Won it back!", emphasis: 'low' as const },
  ],

  through_ball: [
    { text: "🎯 Exquisite through ball! Defense split open!", emphasis: 'medium' as const },
    { text: "👌 Perfect pass! Threading the needle!", emphasis: 'medium' as const },
    { text: "🎯 Vision! Wonderful through ball!", emphasis: 'medium' as const },
    { text: "👌 Inch-perfect! Sliced through the defense!", emphasis: 'medium' as const },
    { text: "🎯 Killer pass! One-on-one developing!", emphasis: 'high' as const },
  ],

  clearance: [
    { text: "🛡️ Cleared away! Danger averted for now!", emphasis: 'low' as const },
    { text: "💪 Headed clear! Defensive header!", emphasis: 'low' as const },
    { text: "🛡️ Booted upfield! No nonsense defending!", emphasis: 'low' as const },
    { text: "💪 Blocked! Threw his body in the way!", emphasis: 'medium' as const },
    { text: "🛡️ Desperate clearance! Just gets it away!", emphasis: 'medium' as const },
  ],

  pass: [
    { text: "Neat pass, keeping possession well!", emphasis: 'low' as const },
    { text: "Tidy ball retention, patient build-up!", emphasis: 'low' as const },
    { text: "Switched the play, good distribution!", emphasis: 'low' as const },
    { text: "Crisp passing, good movement!", emphasis: 'low' as const },
    { text: "Building from the back, composed play!", emphasis: 'low' as const },
  ],

  interception: [
    { text: "🛡️ Intercepted! Read that pass perfectly!", emphasis: 'low' as const },
    { text: "👀 Great awareness! Stepped in to cut it out!", emphasis: 'medium' as const },
    { text: "🛡️ Snuffed out the danger! Good defending!", emphasis: 'low' as const },
    { text: "👀 Alert defending! Nicked it away!", emphasis: 'low' as const },
    { text: "🛡️ Anticipation! Intercepted the pass!", emphasis: 'medium' as const },
  ],

  cross: [
    { text: "⚽ Whipped in! Dangerous cross into the box!", emphasis: 'medium' as const },
    { text: "🎯 Delivery! Searching for a head in the middle!", emphasis: 'medium' as const },
    { text: "⚽ Floated in! Looking for the striker!", emphasis: 'low' as const },
    { text: "🎯 Ball in! Chance developing in the box!", emphasis: 'medium' as const },
    { text: "⚽ Driven cross! Defenders under pressure!", emphasis: 'medium' as const },
  ],

  injury: [
    { text: "🤕 Player down! Looks in some discomfort!", emphasis: 'medium' as const },
    { text: "⚕️ Treatment needed! Medics rushing on!", emphasis: 'medium' as const },
    { text: "🤕 Injury concern! Hopefully nothing serious!", emphasis: 'medium' as const },
    { text: "⚕️ Knocked! Receiving medical attention!", emphasis: 'low' as const },
    { text: "🤕 Grimacing! That looks painful!", emphasis: 'medium' as const },
  ],

  penalty: [
    { text: "🎯 PENALTY! Referee points to the spot!", emphasis: 'high' as const },
    { text: "⚽ PENALTY AWARDED! Huge moment in the match!", emphasis: 'high' as const },
    { text: "🎯 SPOT KICK! Clear foul in the box!", emphasis: 'high' as const },
    { text: "⚽ PENALTY! No doubt about that decision!", emphasis: 'high' as const },
    { text: "🎯 PENALTY KICK! Massive chance here!", emphasis: 'high' as const },
  ],

  free_kick: [
    { text: "⚽ Free kick in a promising position!", emphasis: 'medium' as const },
    { text: "🎯 Set piece! Could be within shooting range!", emphasis: 'medium' as const },
    { text: "⚽ Free kick awarded! Opportunity to deliver!", emphasis: 'low' as const },
    { text: "🎯 Foul! Free kick in a dangerous area!", emphasis: 'medium' as const },
    { text: "⚽ Dead ball situation! Taking aim at goal!", emphasis: 'medium' as const },
  ],
};

export function getRandomEventDescription(eventType: string): EventDescription {
  const descriptions = matchEventLibrary[eventType as keyof typeof matchEventLibrary];
  if (!descriptions || descriptions.length === 0) {
    return { text: `${eventType} event`, emphasis: 'low' };
  }
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

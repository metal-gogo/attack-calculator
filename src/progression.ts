import {character} from './character';
import {sunBladeNegativeLevels} from './effects';
import {takeDamage} from './party';
import type {State,Weapon} from './calculator';
export type Energy='acid'|'cold'|'electricity'|'fire'|'sonic';
export type SurgeMode='off'|'strength'|'cmb'|'cmd';
export interface ProgressionState {
 lunge:boolean;longArm:boolean;turnPhase:'turn'|'offTurn';gambitHitConfirmed:boolean;gambitTurns:number;
 surgeUsed:boolean;surgeMode:SurgeMode;rageRoundsSpent:number;bluffOther:number;cmbOther:number;
 slot1Spent:number;slot2Spent:number;slot3Spent:number;
 returningRounds:number;returningWeapon:Weapon;wingedRounds:number;wingedWeapon:Weapon;protectionRounds:number;protectionSpent:number;protectionType:Energy;
}
export const progressionDefaults:ProgressionState={lunge:false,longArm:false,turnPhase:'turn',gambitHitConfirmed:false,gambitTurns:0,surgeUsed:false,surgeMode:'off',rageRoundsSpent:0,bluffOther:0,cmbOther:0,slot1Spent:0,slot2Spent:0,slot3Spent:0,returningRounds:0,returningWeapon:'flail',wingedRounds:0,wingedWeapon:'flail',protectionRounds:0,protectionSpent:0,protectionType:'fire'};
export const abilityMod=(n:number)=>Math.floor((n-10)/2);
export const rageRoundsPerDay=()=>4+abilityMod(character.con)+2*(character.bloodragerLevel-1);
export const casterLevel=(s:State)=>Math.max(1,character.casterLevel-sunBladeNegativeLevels(s));
export function spellSlots(level:1|2|3){
 // Bloodrager 12: 2/2/1 base. Bonus spells require an unlocked spell level.
 const base=([2,2,1] as const)[level-1],cha=abilityMod(character.cha);
 const bonus=cha>=level?1+Math.floor((cha-level)/4):0;
 return {base,bonus,total:base+bonus};
}
export function progression(s:State){
 const negative=sunBladeNegativeLevels(s),baseReach=s.enlarge?10:5,aooReach=baseReach+(s.longArm?5:0);
 const bluffParts:[string,number][]=[['Ranks',character.bluffRanks],['Class skill',character.bluffClassSkill&&character.bluffRanks>0?3:0],['Charisma',abilityMod(character.cha)],['Hermit background',character.bluffMisc],['Other modifiers',s.bluffOther],['Heroism (morale)',s.heroism?2:0],['Sun Blade negative level',-negative]];
 return {gambitTargetAttackBonus:s.gambitTurns>0?2:0,gambitTargetDamageBonus:s.gambitTurns>0?2:0,bluff:bluffParts.reduce((n,[,v])=>n+v,0),bluffParts,gambitQualified:character.bluffRanks>=5,
  aooReach,reach:aooReach+(s.lunge&&s.turnPhase==='turn'?5:0),lungeQualified:character.bab[0]>=6,
  strengthSurge:s.rage&&s.surgeMode!=='off'?character.bloodragerLevel:0,
  rageRemaining:Math.max(0,rageRoundsPerDay()-s.rageRoundsSpent),casterLevel:casterLevel(s),
  winged:s.wingedRounds>0&&s.wingedWeapon===s.weapon,returning:s.returningRounds>0&&s.returningWeapon===s.weapon,
  protectionRemaining:s.protectionRounds>0?Math.max(0,Math.min(120,12*casterLevel(s))-s.protectionSpent):0};
}
export type SpellId='returning'|'winged'|'protection';
export const newSpells={
 returning:{name:'Returning Weapon',level:1,minutesPerLevel:1,description:'One weapon that can be thrown gains returning. It returns just before the wielder’s next turn, not after every attack. Catching it is free; it falls at the original throwing square if it cannot return to the original hand.'},
 winged:{name:'Winged Sword',level:2,minutesPerLevel:10,description:'One melee weapon gains throwing (10-foot range increment). This does not make the weapon a dancing weapon or grant independent attacks.'},
 protection:{name:'Protection from Energy',level:3,minutesPerLevel:10,description:'Absorbs one selected energy type: 12 HP/caster level, capped at 120. Expires when its duration or pool is exhausted. It overlaps Resist Energy; do not add both reductions to the same hit.'},
} as const;
export function castSpell(s:State,id:SpellId):State{
 const spell=newSpells[id],level=spell.level,key=`slot${level}Spent` as 'slot1Spent'|'slot2Spent'|'slot3Spent';
 if(character.cha<10+level)throw new Error('Charisma is too low for this spell level.');
 if(s[key]>=spellSlots(level).total)throw new Error(`No level ${level} spell slots remain.`);
 if(id==='returning'&&s.weapon!=='dagger'&&!(s.wingedRounds>0&&s.wingedWeapon===s.weapon))throw new Error('Returning Weapon needs a throwable weapon. Cast Winged Sword on this weapon first, or select the dagger.');
 const rounds=spell.minutesPerLevel*casterLevel(s)*10;
 return {...s,[key]:s[key]+1,...(id==='returning'?{returningRounds:rounds,returningWeapon:s.weapon}:id==='winged'?{wingedRounds:rounds,wingedWeapon:s.weapon}:{protectionRounds:rounds,protectionSpent:0})};
}
export function useStrengthSurge(s:State,mode:Exclude<SurgeMode,'off'>):State{
 if(!s.rage)throw new Error('Strength Surge requires Bloodrage.');
 if(s.flatFooted||s.unconscious)throw new Error('An immediate action is unavailable while flat-footed or unconscious.');
 if(s.surgeUsed)throw new Error('Strength Surge has already been used this rage.');
 return {...s,surgeMode:mode,surgeUsed:true};
}
export function triggerGambit(s:State):State{
 if(character.bluffRanks<5)throw new Error('Broken Wing Gambit requires Bluff 5 ranks.');
 if(!s.gambitHitConfirmed)throw new Error('Confirm a successful melee hit first.');
 return {...s,gambitTurns:s.turnPhase==='turn'?2:1,gambitHitConfirmed:false};
}
export const endTurn=(s:State):State=>({...s,turnPhase:'offTurn',brutality:false,gambitHitConfirmed:false,gambitTurns:Math.max(0,s.gambitTurns-1)});
export function advanceTurn(s:State):State{
 const ended=s.turnPhase==='turn'?endTurn(s):s;
 const spent=Math.min(rageRoundsPerDay(),s.rageRoundsSpent+(s.rage?1:0));
 return {...ended,turnPhase:'turn',lunge:false,charge:false,brutality:false,surgeMode:'off',rageRoundsSpent:spent,rage:s.rage&&spent<rageRoundsPerDay(),returningRounds:Math.max(0,s.returningRounds-1),wingedRounds:Math.max(0,s.wingedRounds-1),protectionRounds:Math.max(0,s.protectionRounds-1)};
}
export function spendBrutality(s:State):State{
 if(!s.rage||!s.power)throw new Error('Raging Brutality requires Bloodrage and Power Attack.');
 if(progression(s).rageRemaining<4)throw new Error('Need 3 additional rounds plus this round of Bloodrage.');
 return {...s,brutality:true,rageRoundsSpent:s.rageRoundsSpent+3};
}

export function absorbEnergyDamage(s:State,amount:number,energy:Energy):State{
 const hit=Math.max(0,Math.min(99999,Math.trunc(amount))),remaining=progression(s).protectionRemaining;
 const absorbed=energy===s.protectionType?Math.min(remaining,hit):0;
 const hp=takeDamage({damageTaken:s.damageTaken,tempHP:s.tempHP,nonlethal:s.nonlethal},hit-absorbed);
 const spent=s.protectionSpent+absorbed;
 return {...s,...hp,protectionSpent:spent,...(absorbed>0&&spent>=Math.min(120,12*casterLevel(s))?{protectionRounds:0}:{})};
}

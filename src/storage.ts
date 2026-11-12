import {defaults,normalize,State,weapons} from './calculator';
import {calculateDefense} from './defense';
import {sunBladeNegativeLevels} from './effects';
import {character} from './character';
export const COMBAT_STORAGE='hapi-combat-v1';
export const PROGRESSION_VERSION=1;
export function readCombat(serialized:string|null):State{
 if(!serialized)return {...defaults};
 const raw:unknown=JSON.parse(serialized);
 if(!raw||typeof raw!=='object')return {...defaults};
 const data=raw as Record<string,unknown>,clean={...defaults};
 for(const key of Object.keys(defaults) as (keyof State)[]){const v=data[key];if(typeof v===typeof defaults[key]){const limit=['damageTaken','nonlethal','returningRounds','wingedRounds','protectionRounds'].includes(key)?99999:key==='tempHP'?9999:1000;if(typeof v==='number'&&(!Number.isFinite(v)||Math.abs(v)>limit))continue;Object.assign(clean,{[key]:v});}}
 const version=Number(data.equipmentVersion)||0;
 if(version<2){if(data.armor===0)clean.armor=defaults.armor;if(data.shield===0)clean.shield=defaults.shield;if(data.naturalArmor===0)clean.naturalArmor=defaults.naturalArmor;if(data.maxDex===99)clean.maxDex=defaults.maxDex;if(data.provisionalAC===true)clean.provisionalAC=false;}
 if(version<3&&data.maxDex===4)clean.maxDex=defaults.maxDex;
 if(!Object.hasOwn(weapons,clean.weapon))clean.weapon='flail';
 const s=normalize(clean);
 // Older saves track wounds rather than current HP. Preserve the actual in-combat
 // value on level-up; unwounded records receive the new confirmed full HP.
 if(Number(data.progressionVersion||0)<PROGRESSION_VERSION&&(s.damageTaken>0||s.tempHP>0||s.nonlethal>0)){
  const con=character.con+(s.rage?8:0)+(s.seraphelExtra?2:0),conMod=Math.floor((con-10)/2);
  const oldMax=251+20*(conMod-8)-5*sunBladeNegativeLevels(s),oldCurrent=oldMax-s.damageTaken;
  const next=calculateDefense(s,{strength:0,dexterity:0,constitution:conMod,con,wis:character.wis});
  s.damageTaken=Math.max(0,next.maxHP-oldCurrent);
 }
 return normalize(s);
}

export function applyCombatPatch(old:State,patch:Partial<State>):State{return normalize({...old,...patch,...(!old.rage&&patch.rage===true?{surgeUsed:false,surgeMode:"off" as const}:{})});}

import {character,equipment} from './character';
import type {State} from './calculator';
import {sunBladeNegativeLevels} from './effects';
export type Modifier = [source:string,value:number];
const sum=(parts:Modifier[])=>parts.reduce((n,[,v])=>n+v,0);
export function calculateDefense(s:State, abilities:{strength:number;dexterity:number;constitution:number;con:number;wis:number}) {
 const {strength,dexterity,constitution,con,wis}=abilities;
 const negativeLevels=sunBladeNegativeLevels(s);
 const baselineConMod=Math.floor((character.con-10)/2);
 const hpParts:Modifier[]=[['Base HP (includes CON 26)',character.baseHP],['Constitution change × character level',(constitution-baselineConMod)*character.level],['Sun Blade negative level (5 HP each)',-5*negativeLevels]];
 const maxHP=sum(hpParts),currentHP=maxHP-s.damageTaken;
 const dead=currentHP<=-con;
 const unconscious=s.unconscious||currentHP<0||s.nonlethal>currentHP;
 const staggered=!unconscious&&currentHP>0&&s.nonlethal===currentHP;
 const saveDex=unconscious?-5:dexterity;
 const dexAC=unconscious?-5:Math.min(dexterity,s.maxDex);
 const penalties:Modifier[]=[['Greater Bloodrage',s.rage?-2:0],['Reckless Abandon',s.reckless?-3:0],['Charge',s.charge?-2:0]];
 const unverifiedRemainder=character.provisionalAC-10-5-equipment.ringDeflection;
 const shieldActive=s.shieldEquipped&&(s.weapon==='dagger'||(s.weapon==='sun'&&!s.sunTwoHanded));
 const shieldBonus=shieldActive?s.shield:0;
 const acParts:Modifier[]=[['Base',10],['Dexterity (helpless DEX 0 if unconscious)',dexAC],['Ring of Protection / deflection override',s.deflection],['Provisional equipment remainder (normal AC only)',s.provisionalAC?unverifiedRemainder-s.armor-s.armorSpecialization-shieldBonus-s.naturalArmor-s.otherAC-s.dodge+5-s.deflection:0],['Radiant Mithral Full Plate +2',s.armor],['Armor Specialization (Full Plate)',s.armorSpecialization],['Mithral Heavy Shield +1',shieldBonus],['Amulet of Natural Armor +3',s.naturalArmor],['Other dodge',unconscious?0:s.dodge],['Other normal AC (manual)',s.otherAC],['Enlarge Person (size)',s.enlarge?-1:0],['Haste (dodge)',s.haste&&!unconscious?1:0],...penalties];
 const touchParts=acParts.filter(([name])=>!['Provisional equipment remainder (normal AC only)','Radiant Mithral Full Plate +2','Armor Specialization (Full Plate)','Mithral Heavy Shield +1','Amulet of Natural Armor +3','Other normal AC (manual)'].includes(name));
 const flatAdjust=(parts:Modifier[]):Modifier[]=>parts.map(([source,value])=>{
  if(source.startsWith('Dexterity'))return [source,Math.min(0,value)];
  if((source==='Haste (dodge)'||source==='Other dodge'))return [source,0];
  return [source,value];
 });
 const flatParts=flatAdjust(acParts.filter(([name])=>!['Provisional equipment remainder (normal AC only)','Other normal AC (manual)'].includes(name)));
 const flatTouchParts=flatAdjust(touchParts);
 const cmdParts:Modifier[]=[['Sun Blade negative level',-negativeLevels],['Base',10],['Base attack bonus',character.bab[0]],['Strength',strength],['Dexterity (helpless DEX 0 if unconscious)',saveDex],['Ring of Protection / deflection override',s.deflection],['Other dodge',unconscious?0:s.dodge],['Enlarge Person (maneuver size)',s.enlarge?1:0],['Haste (dodge)',s.haste&&!unconscious?1:0],...penalties,['Other CMD (manual)',s.otherCMD]];
 const moraleWill=Math.max(s.rage?3:0,s.heroism?2:0);
 const saveParts={
  fortitude:[['Base Fortitude',character.saves.fortitude],['Constitution',constitution],['Cloak of Resistance',equipment.cloakResistance],['Heroism (morale)',s.heroism?2:0]] as Modifier[],
  reflex:[['Base Reflex',character.saves.reflex],['Dexterity',saveDex],['Cloak of Resistance',equipment.cloakResistance],['Heroism (morale)',s.heroism?2:0],['Haste (dodge Reflex bonus)',s.haste&&!unconscious&&!s.flatFooted?1:0]] as Modifier[],
  will:[['Base Will',character.saves.will],['Wisdom',Math.floor((wis-10)/2)],['Cloak of Resistance',equipment.cloakResistance],[s.rage?'Greater Bloodrage (morale; overlaps Heroism)':'Heroism (morale)',moraleWill]] as Modifier[],
 };
 for(const parts of Object.values(saveParts)){parts.push(['Blood Sanctuary (allied spell/effect only)',s.bloodSanctuary&&s.allySpell?2:0]);parts.push(['Sun Blade negative level',-negativeLevels]);}
 const fortitude=sum(saveParts.fortitude),reflex=sum(saveParts.reflex),will=sum(saveParts.will);
 const fearParts:Modifier[]=[...saveParts.will,['Bravery (fear only)',character.bravery]];
 const flatCMDParts=flatAdjust(cmdParts);
 const flatCMD=sum(flatCMDParts);
 const conditions=[...(negativeLevels?['Sun Blade: 1 negative level']:[]),...(s.rage?['Bloodraging','Raging Vitality (automatic)','Darkvision while Bloodraging']:[]),...(s.bootsActive?['Flying (Winged Boots; track duration)']:[]),...(s.reckless?['Reckless Abandon']:[]),...(s.enlarge?['Enlarged']:[]),...(s.haste?['Hasted']:[]),...(s.heroism?['Heroism']:[]),...(s.charge?['Charging']:[]),...(s.flatFooted?['Flat-footed']:[]),...(staggered?['Staggered (nonlethal equals current HP)']:[]),...(dead?['Dead']:unconscious?['Unconscious / helpless']:currentHP===0?['Disabled']:[])];
 return {shieldActive,shieldBonus,hpParts,maxHP,currentHP,tempHP:s.tempHP,nonlethal:s.nonlethal,staggered,deathThreshold:-con,dead,unconscious,conditions,
  acParts,touchParts,flatParts,flatTouchParts,activeTouchParts:s.flatFooted?flatTouchParts:touchParts,activeTouch:s.flatFooted?sum(flatTouchParts):sum(touchParts),cmdParts,ac:sum(acParts),touch:sum(touchParts),flatFooted:sum(flatParts),cmd:sum(cmdParts),
  activeAC:s.flatFooted?sum(flatParts):sum(acParts),saveParts,fearParts,fortitude,reflex,will,fear:sum(fearParts),
  flatCMDParts,activeCMDParts:s.flatFooted?flatCMDParts:cmdParts,flatCMD,activeCMD:s.flatFooted?flatCMD:sum(cmdParts),
  verified:!s.provisionalAC,dr:s.ownDR,drBypass:s.drBypass,
  innerFortitude:{damage:Math.max(0,s.abilityDamage-(s.innerFortitude?equipment.greaterInnerFortitude.damage:0)),drain:Math.max(0,s.abilityDrain-(s.innerFortitude?equipment.greaterInnerFortitude.drain:0)),penalty:Math.max(0,s.abilityPenalty-(s.innerFortitude?equipment.greaterInnerFortitude.penalty:0))},resistances:s.resistanceNotes.trim()?[s.resistanceNotes.trim()]:[],
  immunities:[...(s.sleepImmunity?['Sleep — Leaf Green Faith Bond (sheet record)']:[]),...(s.immunityNotes.trim()?[s.immunityNotes.trim()]:[])],
 };
}

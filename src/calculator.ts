import {character,defensiveEquipment} from './character';
import {calculateDefense} from './defense';
export {character} from './character';
export const weapons = {
 flail:{name:'Heavy Flail',subtitle:'+3 · Disruption',die:'1d10',large:'2d8',enhancement:3,focus:2,specialization:2,training:0,threat:17,hands:2},
 sun:{name:'Sun Blade',subtitle:'+2 · Heavy blades',die:'1d10',large:'2d8',enhancement:2,focus:0,specialization:0,training:2,threat:19,hands:2},
 dagger:{name:'Masterwork Dagger',subtitle:'Masterwork · Light blade',die:'1d4',large:'1d6',enhancement:0,focus:0,specialization:0,training:0,threat:19,hands:1},
} as const;
export type Weapon = keyof typeof weapons;
export const toggleLabels = {rage:'Greater Bloodrage',reckless:'Reckless Abandon',power:'Power Attack',brutality:'Raging Brutality',enlarge:'Enlarge Person',haste:'Haste',heroism:'Heroism',charge:'Charge',flanking:'Flanking',outflank:'Outflank',bond:"Freebooter’s Bond",bane:"Freebooter’s Bane",spirit:'Warrior Spirit',paired:'Paired Opportunists'};
export type Toggle = keyof typeof toggleLabels;
export type State = Record<Toggle,boolean> & {vitality:boolean;weapon:Weapon;evil:boolean;undead:boolean;incorporeal:boolean;creature:string;dr:number;drBypassed:boolean;baneBonus:number;spiritBonus:number;armor:number;otherAC:number;otherCMD:number;damageTaken:number;tempHP:number;nonlethal:number;provisionalAC:boolean;uncannyDodge:boolean;flatFooted:boolean;unconscious:boolean;resistanceNotes:string;immunityNotes:string;shield:number;naturalArmor:number;deflection:number;dodge:number;ownDR:number;drBypass:string;improvedUncannyDodge:boolean;bloodSanctuary:boolean;allySpell:boolean;innerFortitude:boolean;abilityDamage:number;abilityDrain:number;abilityPenalty:number;maxDex:number;armorSpecialization:number;shieldEquipped:boolean;sunTwoHanded:boolean;manualExtra:boolean;seraphelExtra:boolean;sleepImmunity:boolean;bootsUses:number;bootsActive:boolean;gogglesUses:number;talismanUses:number};
export const defaults:State={weapon:'flail',rage:true,vitality:true,reckless:true,power:true,brutality:false,enlarge:false,haste:false,heroism:false,charge:false,flanking:false,outflank:false,bond:false,bane:false,spirit:false,paired:false,evil:false,undead:false,incorporeal:false,creature:'Humanoid',dr:0,drBypassed:false,baneBonus:2,spiritBonus:2,armor:defensiveEquipment.armor.armor,otherAC:0,otherCMD:0,damageTaken:0,tempHP:0,nonlethal:0,provisionalAC:false,uncannyDodge:true,flatFooted:false,unconscious:false,resistanceNotes:'',immunityNotes:'',shield:defensiveEquipment.shield.bonus,naturalArmor:defensiveEquipment.amulet.bonus,deflection:5,dodge:0,ownDR:2,drBypass:'— (not bypassed by weapon material or alignment)',improvedUncannyDodge:true,bloodSanctuary:true,allySpell:false,innerFortitude:true,abilityDamage:0,abilityDrain:0,abilityPenalty:0,maxDex:defensiveEquipment.armor.maxDex,armorSpecialization:defensiveEquipment.armor.specialization,shieldEquipped:true,sunTwoHanded:true,manualExtra:false,seraphelExtra:false,sleepImmunity:true,bootsUses:3,bootsActive:false,gogglesUses:1,talismanUses:2};
export const mod=(n:number)=>Math.floor((n-10)/2);
export const signed=(n:number)=>`${n>=0?'+':''}${n}`;
export function normalize(input:State):State {
 const s={...input};
 for(const key of ['armor','shield','naturalArmor','deflection','dodge','ownDR','abilityDamage','abilityDrain','abilityPenalty'] as const)s[key]=Math.max(0,Math.min(1000,Math.trunc(s[key])));
 s.maxDex=Math.max(0,Math.min(99,Math.trunc(s.maxDex)));
 s.drBypass=s.drBypass.slice(0,180);
 s.resistanceNotes=s.resistanceNotes.slice(0,500);
 s.immunityNotes=s.immunityNotes.slice(0,500);
 s.nonlethal=Math.min(99999,Math.max(0,Math.trunc(s.nonlethal)));
 s.damageTaken=Math.min(99999,Math.max(0,Math.trunc(s.damageTaken)));
 s.tempHP=Math.min(9999,Math.max(0,Math.trunc(s.tempHP)));
 // Raging Vitality is a permanent feat: its effect always accompanies Bloodrage.
 s.vitality=s.rage;
 for(const key of ['armorSpecialization','bootsUses','gogglesUses','talismanUses'] as const)s[key]=Math.max(0,Math.trunc(s[key]));
 s.bootsUses=Math.min(defensiveEquipment.boots.uses,s.bootsUses);
 s.gogglesUses=Math.min(defensiveEquipment.goggles.uses,s.gogglesUses);
 s.talismanUses=Math.min(defensiveEquipment.talisman.uses,s.talismanUses);
 if(!s.rage){s.vitality=false;s.reckless=false;s.brutality=false;}
 if(!s.power)s.brutality=false;
 if(!s.flanking)s.outflank=false;
 if(s.weapon!=='sun')s.spirit=false;
 return s;
}
export function calculate(input:State){
 const s=normalize(input);
 const w={...weapons[s.weapon],hands:s.weapon==='sun'?(s.sunTwoHanded?2:1):weapons[s.weapon].hands};
 // Confirmed by the user: belt +6 and headband +4 are already included.
 const str=character.str+(s.manualExtra?3:0)+(s.rage?6:0)+(s.enlarge?2:0),dex=character.dex-(s.enlarge?2:0),con=character.con+(s.seraphelExtra?2:0)+(s.rage?8:0);
 const wis=character.wis;
 const strength=mod(str),dexterity=mod(dex),constitution=mod(con);
 const enhancement=w.enhancement+(s.weapon==='sun'&&s.evil?2:0)+(s.spirit?Math.min(s.spiritBonus,5-w.enhancement-(s.evil?2:0)):0);
 const attackParts:[string,number][]=[['Strength',strength],['Enhancement / masterwork',s.weapon==='dagger'?1:enhancement],['Weapon Focus + Greater Focus',w.focus],['Heavy Blades training',w.training],['Reckless Abandon',s.reckless?3:0],['Size',s.enlarge?-1:0],['Haste',s.haste?1:0],['Heroism (morale)',s.heroism?2:0],['Charge · charge attack only',s.charge?2:0],['Flanking',s.flanking?(s.outflank?4:2):0],["Freebooter’s Bond · while flanking",s.bond&&s.flanking?2:0],["Freebooter’s Bane",s.bane?s.baneBonus:0]];
 const base=attackParts.reduce((a,[,v])=>a+v,0), penalty=s.power?-6:0;
 // Furious Focus requires a two-handed weapon or a one-handed weapon wielded in two hands.
 const furious=s.power&&w.hands===2;
 const fullAttack=character.bab.map((bab,i)=>bab+base+(i===0&&furious?0:penalty)-(s.charge?2:0));
 if(s.haste)fullAttack.splice(1,0,20+base+penalty-(s.charge?2:0));
 const single=20+base+(furious?0:penalty);
 const aoo=20+base+penalty-(s.charge?2:0)+(s.paired?4:0);
 const damageParts:[string,number][]=[['Strength',Math.floor(strength*(w.hands===2?1.5:1))],['Enhancement',enhancement],['Weapon Specialization',w.specialization],['Heavy Blades training',w.training],['Power Attack',s.power?(w.hands===2?18:12):0],["Freebooter’s Bane",s.bane?s.baneBonus:0]];
 const flat=damageParts.reduce((a,[,v])=>a+v,0),brutality=s.brutality?Math.floor(constitution*(w.hands===2?1.5:1)):0;
 const undeadSun=s.weapon==='sun'&&s.undead, normalMultiplier=undeadSun?2:1,critBase=undeadSun?3:2;
 const critMultiplier=critBase;
 const die=s.enlarge?w.large:w.die;
 const expression=(mult:number)=>mult===1
  ? `${die} ${signed(flat+brutality)}`
  : `(${die} ${signed(flat)}) ×${mult}${brutality?` ${signed(brutality)}`:''}`;
 const defense=calculateDefense(s,{strength,dexterity,constitution,con,wis});
 const {acParts}=defense;
 const cmd=defense.activeCMD;
 const ac=defense.activeAC;
 const warnings:string[]=[];
 if(s.provisionalAC)warnings.push('AC 36 is provisional. Confirm separate armor, shield, natural armor, deflection, and dodge components in Defense. Touch AC, flat-footed AC, and CMD remain unverified until then.');
 if(defense.unconscious)warnings.push('Hapi is unconscious and helpless: cannot attack or take attacks of opportunity; DEX is treated as 0 for defenses. Melee attackers also gain +4 against a helpless target (not included in displayed AC). Raging Vitality sustains active Bloodrage, not consciousness.');
 if(defense.staggered)warnings.push('Hapi is staggered from nonlethal damage equal to current HP: normally only one standard or move action each turn, not a full attack.');
 if(!s.rage&&s.damageTaken>character.baseHP)warnings.push('Ending Bloodrage removes Constitution-derived HP, not temporary HP. Track fatigue and stabilization at the table.');
 if(s.weapon==='dagger'&&s.power)warnings.push('House-rule confirmation: the requested one-handed Power Attack +12 is applied to the dagger. Pathfinder normally excludes light weapons from Power Attack bonus damage; disable Power Attack or confirm this override with your GM.');

 if(s.spirit)warnings.push('Warrior Spirit: enhancement only; Heavy Blades training +2 supplies a +2 budget, capped at +5 total. Ability requires activation and daily-use tracking at the table.');
 if(s.bond)warnings.push('Freebooter’s Bond: +2 attack while flanking with the freebooter or another affected ally. The freebooter activates it as a move action; affected allies must be within 30 feet and able to see or hear the freebooter when granted.');
 if(s.bane)warnings.push('Freebooter’s Bane assumes the designated enemy and ally requirements are met; confirm its bonus with your GM.');
 if(s.incorporeal)warnings.push('Incorporeal target: magical attacks normally deal half damage; the nonmagical dagger normally cannot harm it. Ghost touch and other exceptions require GM adjudication. Shown damage is before this reduction.');
 if(s.charge)warnings.push('Charge applies +2 only to the single charge attack and −2 AC/CMD. The full-attack sequence and AoO exclude its attack bonus.');
 if(s.undead&&s.weapon==='flail')warnings.push('Disruption: qualifying undead struck must make a DC 14 Will save or be destroyed. Confirm eligibility and immunity with your GM.');
 return {defense,s,w,str,dex,con,wis,strength,dexterity,constitution,enhancement,attackParts,damageParts,acParts,fullAttack,single,aoo,ac,cmd,brutality,normal:expression(normalMultiplier),critical:expression(critMultiplier),critMultiplier,critBase,furious,warnings,aoos:defense.unconscious?0:1+Math.max(0,dexterity)};
}
export function summary(s:State){const c=calculate(s);return `Hapi — ${c.w.name}\nFull attack: ${c.fullAttack.map(signed).join(' / ')}\nSingle${s.charge?' charge':''}: ${signed(c.single)}; AoO: ${signed(c.aoo)}\nDamage: ${c.normal}; critical ${c.w.threat}–20/×${c.critBase}: ${c.critical}\nAC ${c.ac}${c.defense.verified?'':' (provisional / incomplete)'} (touch ${c.defense.verified?c.defense.activeTouch:'unverified'}, flat-footed ${c.defense.verified?c.defense.flatFooted:'unverified'}); CMD ${c.cmd}\nHP ${c.defense.currentHP}/${c.defense.maxHP}; temporary HP ${c.defense.tempHP}; nonlethal ${c.defense.nonlethal}; death ${c.defense.deathThreshold}\nFort ${signed(c.defense.fortitude)}; Ref ${signed(c.defense.reflex)}; Will ${signed(c.defense.will)}; fear ${signed(c.defense.fear)}\nActive: ${(Object.keys(toggleLabels) as Toggle[]).filter(k=>c.s[k]).map(k=>toggleLabels[k]).join(', ')}\nTable rule: roll damage once, then multiply; Raging Brutality is added afterward.\nDamage before DR ${s.dr} and incorporeal reductions. Raging Brutality added once; first qualifying attack uses Furious Focus.\n${c.warnings.join('\n')}`;}

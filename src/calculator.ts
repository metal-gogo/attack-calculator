export const character = { name: 'Hapi', ancestry: 'Human', classes: 'Bloodrager 11 / Fighter 9', bab: [20,15,10,5], str:28, dex:20, con:26, training:2 };
export const weapons = {
 flail:{name:'Heavy Flail',subtitle:'+3 · Disruption',die:'1d10',large:'2d8',enhancement:3,focus:2,specialization:2,training:0,threat:17,hands:2},
 sun:{name:'Sun Blade',subtitle:'+2 · Heavy blades',die:'1d10',large:'2d8',enhancement:2,focus:0,specialization:0,training:2,threat:19,hands:2},
 dagger:{name:'Masterwork Dagger',subtitle:'Masterwork · Light blade',die:'1d4',large:'1d6',enhancement:0,focus:0,specialization:0,training:0,threat:19,hands:1},
} as const;
export type Weapon = keyof typeof weapons;
export const toggleLabels = {rage:'Greater Bloodrage',vitality:'Raging Vitality',reckless:'Reckless Abandon',power:'Power Attack',brutality:'Raging Brutality',enlarge:'Enlarge Person',haste:'Haste',heroism:'Heroism',charge:'Charge',flanking:'Flanking',outflank:'Outflank',bond:"Freebooter’s Bond",bane:"Freebooter’s Bane",spirit:'Warrior Spirit',paired:'Paired Opportunists'};
export type Toggle = keyof typeof toggleLabels;
export type State = Record<Toggle,boolean> & {weapon:Weapon;evil:boolean;undead:boolean;incorporeal:boolean;creature:string;dr:number;drBypassed:boolean;baneBonus:number;spiritBonus:number;armor:number;otherAC:number;otherCMD:number;sunSequential:boolean};
export const defaults:State={weapon:'flail',rage:true,vitality:true,reckless:true,power:true,brutality:false,enlarge:false,haste:false,heroism:false,charge:false,flanking:false,outflank:false,bond:false,bane:false,spirit:false,paired:false,evil:false,undead:false,incorporeal:false,creature:'Humanoid',dr:0,drBypassed:false,baneBonus:2,spiritBonus:2,armor:0,otherAC:0,otherCMD:0,sunSequential:false};
export const mod=(n:number)=>Math.floor((n-10)/2);
export const signed=(n:number)=>`${n>=0?'+':''}${n}`;
export function normalize(input:State):State {
 const s={...input};
 if(!s.rage){s.vitality=false;s.reckless=false;s.brutality=false;}
 if(!s.power)s.brutality=false;
 if(!s.flanking)s.outflank=false;
 if(s.weapon!=='sun')s.spirit=false;
 return s;
}
export function calculate(input:State){
 const s=normalize(input), w=weapons[s.weapon];
 const str=character.str+(s.rage?6:0)+(s.enlarge?2:0),dex=character.dex-(s.enlarge?2:0),con=character.con+(s.rage?6:0)+(s.vitality?2:0);
 const strength=mod(str),dexterity=mod(dex),constitution=mod(con);
 const enhancement=w.enhancement+(s.weapon==='sun'&&s.evil?2:0)+(s.spirit?Math.min(s.spiritBonus,5-w.enhancement-(s.evil?2:0)):0);
 const attackParts:[string,number][]=[['Strength',strength],['Enhancement / masterwork',s.weapon==='dagger'?1:enhancement],['Weapon Focus + Greater Focus',w.focus],['Heavy Blades training',w.training],['Reckless Abandon',s.reckless?3:0],['Size',s.enlarge?-1:0],['Haste',s.haste?1:0],['Heroism (morale)',s.heroism?2:0],['Charge · charge attack only',s.charge?2:0],['Flanking',s.flanking?(s.outflank?4:2):0],["Freebooter’s Bond · while flanking",s.bond&&s.flanking?3:0],["Freebooter’s Bane",s.bane?s.baneBonus:0]];
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
 const critMultiplier=undeadSun?(s.sunSequential?6:4):critBase;
 const die=s.enlarge?w.large:w.die;
 const expression=(mult:number)=>`${Number(die.split('d')[0])*mult}d${die.split('d')[1]} ${signed(flat*mult+brutality)}`;
 const acParts:[string,number][]=[['Base',10],['Armor / shield',s.armor],['Dexterity',dexterity],['Size',s.enlarge?-1:0],['Bloodrage',s.rage?-2:0],['Reckless Abandon',s.reckless?-3:0],['Haste (dodge)',s.haste?1:0],['Charge',s.charge?-2:0],['Other AC',s.otherAC]];
 const ac=acParts.reduce((a,[,v])=>a+v,0);
 const cmd=10+20+strength+dexterity+(s.enlarge?1:0)+(s.rage?-2:0)+(s.reckless?-3:0)+(s.haste?1:0)+(s.charge?-2:0)+s.otherCMD;
 const warnings=['Armor, shield, and other defensive bonuses were not supplied. Enter them to obtain a complete AC and CMD.'];
 if(s.weapon==='dagger'&&s.power)warnings.push('House-rule confirmation: the requested one-handed Power Attack +12 is applied to the dagger. Pathfinder normally excludes light weapons from Power Attack bonus damage; disable Power Attack or confirm this override with your GM.');
 if(s.weapon==='sun')warnings.push('GM ruling: Sun Blade doubling and critical multiplication are ambiguous. Default uses combined multipliers (×4 vs undead); sequential ×6 is available below. Raging Brutality is added once in both cases.');
 if(s.spirit)warnings.push('Warrior Spirit: enhancement only; Heavy Blades training +2 supplies a +2 budget, capped at +5 total. Ability requires activation and daily-use tracking at the table.');
 if(s.bond)warnings.push('Freebooter’s Bond uses your requested +3 while flanking. Confirm this value and ally eligibility with your GM.');
 if(s.bane)warnings.push('Freebooter’s Bane assumes the designated enemy and ally requirements are met; confirm its bonus with your GM.');
 if(s.incorporeal)warnings.push('Incorporeal target: magical attacks normally deal half damage; the nonmagical dagger normally cannot harm it. Ghost touch and other exceptions require GM adjudication. Shown damage is before this reduction.');
 if(s.charge)warnings.push('Charge applies +2 only to the single charge attack and −2 AC/CMD. The full-attack sequence and AoO exclude its attack bonus.');
 if(s.undead&&s.weapon==='flail')warnings.push('Disruption: qualifying undead struck must make a DC 14 Will save or be destroyed. Confirm eligibility and immunity with your GM.');
 return {s,w,str,dex,con,strength,dexterity,constitution,enhancement,attackParts,damageParts,acParts,fullAttack,single,aoo,ac,cmd,brutality,normal:expression(normalMultiplier),critical:expression(critMultiplier),critMultiplier,critBase,furious,warnings,aoos:1+Math.max(0,dexterity)};
}
export function summary(s:State){const c=calculate(s);return `Hapi — ${c.w.name}\nFull attack: ${c.fullAttack.map(signed).join(' / ')}\nSingle${s.charge?' charge':''}: ${signed(c.single)}; AoO: ${signed(c.aoo)}\nDamage: ${c.normal}; critical ${c.w.threat}–20/×${c.critBase}: ${c.critical}\nAC ${c.ac}; CMD ${c.cmd}\nActive: ${(Object.keys(toggleLabels) as Toggle[]).filter(k=>c.s[k]).map(k=>toggleLabels[k]).join(', ')}\nDamage before DR ${s.dr} and incorporeal reductions. Raging Brutality added once; first qualifying attack uses Furious Focus.\n${c.warnings.join('\n')}`;}

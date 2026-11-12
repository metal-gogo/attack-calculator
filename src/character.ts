// Permanent character data; base HP already includes baseline Constitution.
export const character = {
 name:'Hapi', ancestry:'Human', evilAligned:true, classes:'Primalist Bloodrager 12 / Fighter 10',
 level:22, bloodragerLevel:12, fighterLevel:10, casterLevel:12, bab:[22,17,12,7],
 str:28, dex:20, con:26, wis:18, cha:14, bluffRanks:22, bluffClassSkill:true, bluffMisc:2, training:2, trainingGroup:'Flails',
 baseHP:278, provisionalAC:36, bravery:3,
 saves:{fortitude:15,reflex:7,will:7},
};

export const equipment = {cloakResistance:5,ringDeflection:5,greaterInnerFortitude:{damage:6,drain:3,penalty:6}};

// Sheet equipment records. Ability items are included in confirmed totals by default.
export const defensiveEquipment = {
 armor:{name:'Radiant Mithral Full Plate +2',armor:11,specialization:2,maxDex:5,checkPenalty:-2},
 shield:{name:'Mithral Heavy Shield +1',bonus:3,weight:7.5},
 amulet:{name:'Amulet of Natural Armor +3',bonus:3},
 belt:{name:'Belt of Physical Perfection +6',bonus:6},
 headband:{name:'Headband of Inspired Wisdom +4',bonus:4},
 boots:{name:'Winged Boots',uses:3,minutes:5},
 goggles:{name:'Lesser Goggles of True Seeing',uses:1},
 talisman:{name:'Talisman of Life’s Breath',uses:2},
};

export const confirmedPartyHP = [{id:"party-wick",name:"Wick (Brimwick)",maxHP:339,aliases:/\b(wick|brimwick)\b/i},{id:"party-ty",name:"Ty (Tyjeri)",maxHP:213,aliases:/\b(ty|tyjeri)\b/i}];

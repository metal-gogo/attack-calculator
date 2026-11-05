// Permanent character data; base HP already includes baseline Constitution.
export const character = {
 name:'Hapi', ancestry:'Human', classes:'Bloodrager 11 / Fighter 9',
 level:20, bloodragerLevel:11, bab:[20,15,10,5],
 str:28, dex:20, con:26, wis:18, training:2,
 baseHP:251, provisionalAC:36, bravery:2,
 saves:{fortitude:13,reflex:6,will:6},
};

export const equipment = {cloakResistance:5,ringDeflection:5,greaterInnerFortitude:{damage:6,drain:3,penalty:6}};

// Sheet equipment records. Ability items are included in confirmed totals by default.
export const defensiveEquipment = {
 armor:{name:'Radiant Mithral Full Plate +2',armor:11,specialization:2,maxDex:4,checkPenalty:-2},
 shield:{name:'Mithral Heavy Shield +1',bonus:3,weight:7.5},
 amulet:{name:'Amulet of Natural Armor +3',bonus:3},
 belt:{name:'Belt of Physical Perfection +6',bonus:6},
 headband:{name:'Headband of Inspired Wisdom +4',bonus:4},
 boots:{name:'Winged Boots',uses:3,minutes:5},
 goggles:{name:'Lesser Goggles of True Seeing',uses:1},
 talisman:{name:'Talisman of Life’s Breath',uses:2},
};

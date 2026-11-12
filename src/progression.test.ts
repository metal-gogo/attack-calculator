import {describe,it,expect} from 'vitest';
import {calculate,defaults,normalize,State} from './calculator';
import {character} from './character';
import {absorbEnergyDamage,advanceTurn,castSpell,endTurn,progression,rageRoundsPerDay,spellSlots,spendBrutality,triggerGambit,useStrengthSurge} from './progression';
import {applyCombatPatch,readCombat} from './storage';
import {currentHP,migratePartyHP,PartyMember} from './party';
const state=(patch:Partial<State>={}):State=>normalize({...defaults,...patch});
describe('level 22 progression and new abilities',()=>{
 it('uses confirmed progression without generating Hit Dice HP',()=>{
  expect([character.level,character.bloodragerLevel,character.fighterLevel,character.casterLevel]).toEqual([22,12,10,12]);expect(character.bab).toEqual([22,17,12,7]);expect(character.saves).toEqual({fortitude:15,reflex:7,will:7});expect(character.bravery).toBe(3);expect(calculate(state({rage:false})).defense.maxHP).toBe(278);expect(calculate(state()).defense.maxHP).toBe(366);
 });
 it('calculates Bluff ranks, class skill, CHA, Hermit and temporary effects',()=>{
  expect(progression(state({rage:false})).bluff).toBe(29);expect(progression(state({heroism:true})).bluff).toBe(31);expect(progression(state({weapon:'sun'})).bluff).toBe(28);expect(progression(state({bluffOther:3})).bluff).toBe(32);expect(progression(state()).gambitQualified).toBe(true);
 });
 it('adds Dodge once to normal/touch/CMD and removes it when DEX is denied',()=>{
  const c=calculate(state({rage:false,reckless:false}));expect([c.ac,c.defense.touch,c.defense.flatFooted,c.cmd]).toEqual([37,21,31,52]);expect(c.defense.acParts.filter(([s])=>s==='Dodge feat (dodge)')).toEqual([['Dodge feat (dodge)',1]]);const flat=calculate(state({rage:false,reckless:false,flatFooted:true}));expect([flat.ac,flat.cmd]).toEqual([31,46]);
 });
 it('keeps Lunge on-turn reach separate from AoO reach and AC duration',()=>{
  const s=state({rage:false,reckless:false,enlarge:true,longArm:true,lunge:true});const c=calculate(s);expect([progression(state()).reach,progression(state({enlarge:true})).reach]).toEqual([5,10]);expect([c.tactical.reach,c.tactical.aooReach,c.ac]).toEqual([20,15,33]);const off=calculate(endTurn(s));expect([off.tactical.reach,off.tactical.aooReach,off.ac]).toEqual([15,15,33]);const next=calculate(advanceTurn(endTurn(s)));expect([next.tactical.reach,next.ac]).toEqual([15,35]);
 });
 it('only grants fear immunity during Bloodrage',()=>{
  expect(calculate(state()).defense.immunities).toContain('Shaken and frightened — Fearless Rage');expect(calculate(state({rage:false})).defense.immunities).not.toContain('Shaken and frightened — Fearless Rage');
 });
 it('validates Gambit activation and buffs the target without granting Hapi attacks',()=>{
  expect(()=>triggerGambit(state())).toThrow('successful melee');expect(triggerGambit(state({gambitHitConfirmed:true,turnPhase:'offTurn'})).gambitTurns).toBe(1);const before=calculate(state()),g=triggerGambit(state({gambitHitConfirmed:true})),after=calculate(g);expect(after.tactical.gambitTargetAttackBonus).toBe(2);expect(after.tactical.gambitTargetDamageBonus).toBe(2);expect(after.fullAttack).toEqual(before.fullAttack);expect(after.aoos).toBe(before.aoos);expect(after.aoo).toBe(before.aoo);expect(after.normal).toBe(before.normal);expect(advanceTurn(g).gambitTurns).toBe(1);expect(endTurn(advanceTurn(g)).gambitTurns).toBe(0);
 });
 it('applies Strength Surge to only the selected check and spends it once per rage',()=>{
  const base=state(),cmd=useStrengthSurge(base,'cmd'),cmb=useStrengthSurge(base,'cmb');expect(calculate(cmd).cmd).toBe(calculate(base).cmd+12);expect(calculate(cmd).cmb).toBe(calculate(base).cmb);expect(calculate(cmb).cmb).toBe(calculate(base).cmb+12);expect(calculate(cmb).cmd).toBe(calculate(base).cmd);expect(()=>useStrengthSurge({...cmd,surgeMode:'off'},'strength')).toThrow('already');expect(()=>useStrengthSurge(state({rage:false}),'cmb')).toThrow('requires');expect(()=>useStrengthSurge(state({flatFooted:true}),'cmd')).toThrow('immediate');const ended=applyCombatPatch(cmd,{rage:false}),fresh=applyCombatPatch(ended,{rage:true});expect(fresh.surgeUsed).toBe(false);expect(fresh.surgeMode).toBe('off');
 });
 it('calculates general CMB using BAB/STR/size and applicable attack penalties',()=>{
  expect(calculate(state({rage:false,power:false})).cmb).toBe(31);expect(calculate(state({rage:false,power:true})).cmb).toBe(25);expect(calculate(state({rage:false,power:false,enlarge:true})).cmb).toBe(33);expect(calculate(state({cmbOther:7})).cmb).toBe(calculate(state()).cmb+7);
 });
 it('tracks 34 daily bloodrage rounds and extra Brutality costs without refunding them',()=>{
  expect(rageRoundsPerDay()).toBe(34);expect(progression(state()).rageRemaining).toBe(34);const activated=spendBrutality(state());expect(activated.rageRoundsSpent).toBe(3);expect(advanceTurn(activated).rageRoundsSpent).toBe(4);expect(endTurn(activated).brutality).toBe(false);expect(()=>spendBrutality(state({rageRoundsSpent:31}))).toThrow('Need');expect(advanceTurn(state({rageRoundsSpent:33})).rage).toBe(false);
 });
});
describe('new spell effects and resources',()=>{
 it('uses level-12 slots plus CHA 14 bonus slots and full caster level',()=>{expect([spellSlots(1).total,spellSlots(2).total,spellSlots(3).total]).toEqual([3,3,1]);expect(progression(state()).casterLevel).toBe(12);expect(progression(state({weapon:'sun'})).casterLevel).toBe(11);});
 it('requires a throwable weapon for Returning Weapon and spends no slot on invalid casts',()=>{const s=state();expect(()=>castSpell(s,'returning')).toThrow('throwable');expect(s.slot1Spent).toBe(0);const dagger=castSpell(state({weapon:'dagger'}),'returning');expect(dagger.returningRounds).toBe(120);expect(dagger.returningWeapon).toBe('dagger');expect(dagger.slot1Spent).toBe(1);});
 it('applies Winged Sword throwing to its target, enabling Returning Weapon',()=>{const winged=castSpell(state(),'winged');expect(winged.wingedRounds).toBe(1200);expect(winged.slot2Spent).toBe(1);expect(progression(winged).winged).toBe(true);const both=castSpell(winged,'returning');expect(both.returningRounds).toBe(120);expect(progression(both).returning).toBe(true);expect(progression({...both,weapon:'sun'}).winged).toBe(false);expect(progression({...both,weapon:'sun'}).returning).toBe(false);expect(calculate(winged).fullAttack).toEqual(calculate(state()).fullAttack);});
 it('captures durations at cast time and honors the active negative-level caster penalty',()=>{const cast=castSpell(state({weapon:'sun'}),'winged');expect(cast.wingedRounds).toBe(1100);expect({...cast,weapon:'flail'}.wingedRounds).toBe(1100);expect(advanceTurn(cast).wingedRounds).toBe(1099);});
 it('blocks casts when the corresponding daily slots are spent',()=>{expect(()=>castSpell(state({slot2Spent:3}),'winged')).toThrow('No level 2');const p=castSpell(state(),'protection');expect(p.protectionRounds).toBe(1200);expect(p.slot3Spent).toBe(1);expect(()=>castSpell(p,'protection')).toThrow('No level 3');});
 it('caps Protection from Energy at 120 and applies only its selected energy',()=>{const s=castSpell(state({tempHP:10}),'protection');expect(progression(s).protectionRemaining).toBe(120);expect(calculate(s).defense.resistances.join(' ')).toContain('fire): 120 absorption');const resisted=absorbEnergyDamage(s,50,'fire');expect(progression(resisted).protectionRemaining).toBe(70);expect(resisted.damageTaken).toBe(0);expect(resisted.tempHP).toBe(10);const overflow=absorbEnergyDamage(s,150,'fire');expect(overflow.protectionRounds).toBe(0);expect(overflow.tempHP).toBe(0);expect(overflow.damageTaken).toBe(20);expect(calculate(overflow).defense.resistances.join(' ')).not.toContain('Protection from Energy');const other=absorbEnergyDamage(s,30,'cold');expect(other.protectionSpent).toBe(0);expect(other.damageTaken).toBe(20);});
 it('expires spell effects without refunding daily slots',()=>{const s=state({returningRounds:1,wingedRounds:1,protectionRounds:1,slot1Spent:1,slot2Spent:1,slot3Spent:1});const next=advanceTurn(s);expect([next.returningRounds,next.wingedRounds,next.protectionRounds]).toEqual([0,0,0]);expect([next.slot1Spent,next.slot2Spent,next.slot3Spent]).toEqual([1,1,1]);});
});
describe('confirmed HP migrations',()=>{
 it('seeds Wick and Ty with confirmed HP and no invented Constitution',()=>{const p=migratePartyHP([]);expect(p.map(m=>[m.name,m.maxHP,currentHP(m),m.constitution])).toEqual([['Wick (Brimwick)',339,339,null],['Ty (Tyjeri)',213,213,null]]);});
 it('updates aliases and maximums while preserving in-combat HP and unrelated members',()=>{const m:PartyMember={id:'saved-wick',name:'Brimwick',maxHP:300,damageTaken:50,tempHP:7,nonlethal:8,constitution:18};const other={...m,id:'other',name:'Other Ally'};const p=migratePartyHP([m,other]);expect(p[0].id).toBe('saved-wick');expect(p[0].maxHP).toBe(339);expect(currentHP(p[0])).toBe(250);expect([p[0].tempHP,p[0].nonlethal,p[0].constitution]).toEqual([7,8,18]);expect(p[1]).toEqual(other);expect(p.filter(m=>/wick/i.test(m.name))).toHaveLength(1);});
 it('does not reapply snapshots or recreate deleted members after migration',()=>{expect(migratePartyHP([],1)).toEqual([]);const p=migratePartyHP([]);const next=p.map(m=>({...m,maxHP:500}));expect(migratePartyHP(next,1)).toEqual(next);});
 it('preserves combat settings, equipment, and actual HP across Hapi level-up',()=>{const s=readCombat(JSON.stringify({equipmentVersion:3,rage:false,damageTaken:20,weapon:'dagger',shieldEquipped:false,heroism:true,armor:12,tempHP:7,nonlethal:8}));const c=calculate(s);expect(c.defense.maxHP).toBe(278);expect(c.defense.currentHP).toBe(231);expect([s.weapon,s.shieldEquipped,s.heroism,s.armor,s.tempHP,s.nonlethal]).toEqual(['dagger',false,true,12,7,8]);const again=readCombat(JSON.stringify({...s,equipmentVersion:3,progressionVersion:1}));expect(again.damageTaken).toBe(s.damageTaken);});
 it('keeps prior active rage while preserving recent current HP',()=>{const s=readCombat(JSON.stringify({equipmentVersion:3,rage:true,damageTaken:20}));expect(s.rage).toBe(true);expect(calculate(s).defense.maxHP).toBe(366);expect(calculate(s).defense.currentHP).toBe(311);});
 it('uses confirmed full HP for unwounded records and never adds new Hit Dice HP',()=>{expect(calculate(readCombat(JSON.stringify({rage:false}))).defense.currentHP).toBe(278);expect(calculate(readCombat(null)).defense.maxHP).toBe(366);});
});

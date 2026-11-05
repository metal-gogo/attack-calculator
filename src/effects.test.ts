import {describe,it,expect} from 'vitest';
import {calculate,defaults,State,summary} from './calculator';
const calc=(changes:Partial<State>={})=>calculate({...defaults,weapon:'sun',wielderEvil:false,rage:false,reckless:false,...changes});
describe('Sun Blade evil-wielder negative level',()=>{
 it('uses wielder alignment independently from target alignment',()=>{
  for(const evil of [false,true]){expect(calc({evil,wielderEvil:false}).negativeLevels).toBe(0);expect(calc({evil,wielderEvil:true}).negativeLevels).toBe(1);}
 });
 it('penalizes every attack including haste and AoO exactly once',()=>{
  const normal=calc({haste:true}),evil=calc({haste:true,wielderEvil:true});expect(evil.fullAttack).toEqual(normal.fullAttack.map(n=>n-1));expect(evil.single).toBe(normal.single-1);expect(evil.aoo).toBe(normal.aoo-1);
 });
 it('reduces all saves, fear saves and CMD without changing AC',()=>{
  const a=calc(),b=calc({wielderEvil:true});for(const key of ['fortitude','reflex','will','fear','activeCMD','flatCMD'] as const)expect(b.defense[key]).toBe(a.defense[key]-1);expect(b.ac).toBe(a.ac);expect(b.defense.touch).toBe(a.defense.touch);
 });
 it('removes 5 current/max HP, preserving wounds, temporary HP, CON and death threshold',()=>{
  const a=calc({damageTaken:20,tempHP:10}),b=calc({wielderEvil:true,damageTaken:20,tempHP:10});expect(b.defense.maxHP).toBe(246);expect(b.defense.currentHP).toBe(226);expect(b.defense.currentHP).toBe(a.defense.currentHP-5);expect(b.defense.tempHP).toBe(10);expect(b.con).toBe(26);expect(b.defense.deathThreshold).toBe(-26);
 });
 it('uses actual 20 levels for Constitution HP changes, not effective 19',()=>{
  const c=calc({wielderEvil:true,rage:true});expect(c.effectiveLevel).toBe(19);expect(c.defense.maxHP).toBe(326);expect(c.con).toBe(34);expect(c.defense.deathThreshold).toBe(-34);
 });
 it('does not penalize damage, ability scores, BAB progression or AoO count',()=>{
  const a=calc({brutality:true,rage:true}),b=calc({brutality:true,rage:true,wielderEvil:true});expect(b.normal).toBe(a.normal);expect(b.critical).toBe(a.critical);expect([b.str,b.dex,b.con,b.wis]).toEqual([a.str,a.dex,a.con,a.wis]);expect(b.fullAttack.length).toBe(a.fullAttack.length);expect(b.aoos).toBe(a.aoos);
 });
 it('disappears when switching to another weapon even when wielder alignment remains evil',()=>{
  for(const weapon of ['flail','dagger'] as const){const c=calc({weapon,wielderEvil:true});expect(c.negativeLevels).toBe(0);expect(c.defense.maxHP).toBe(251);expect(c.effectiveLevel).toBe(20);expect(c.warnings.join(' ')).not.toContain('restoration');}
 });
 it('recalculates nonlethal unconsciousness from the reduced HP',()=>{
  expect(calc({nonlethal:247}).defense.unconscious).toBe(false);expect(calc({nonlethal:247,wielderEvil:true}).defense.unconscious).toBe(true);
 });
 it('shows the source in attack, saves, HP, CMD, conditions and copied summary',()=>{
  const c=calc({wielderEvil:true});expect(c.attackParts).toContainEqual(['Sun Blade negative level',-1]);expect(c.defense.cmdParts).toContainEqual(['Sun Blade negative level',-1]);expect(c.defense.saveParts.will).toContainEqual(['Sun Blade negative level',-1]);expect(c.defense.hpParts).toContainEqual(['Sun Blade negative level (5 HP each)',-5]);expect(c.defense.conditions).toContain('Sun Blade: 1 negative level');expect(summary({...defaults,weapon:'sun',wielderEvil:true})).toContain('Negative levels: 1; effective level 19');
 });
});

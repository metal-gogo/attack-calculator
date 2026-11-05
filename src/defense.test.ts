import {describe,it,expect} from 'vitest';
import {calculate,defaults,State,normalize} from './calculator';
const defense=(changes:Partial<State>={})=>calculate({...defaults,rage:false,vitality:false,reckless:false,...changes}).defense;
describe('defenses',()=>{
 it('uses corrected base HP and baseline saving throws',()=>{
  const d=defense();expect(d.maxHP).toBe(251);expect([d.fortitude,d.reflex,d.will,d.fear]).toEqual([26,16,15,17]);expect(d.deathThreshold).toBe(-26);
 });
 it('changes actual HP, not temporary HP, for Constitution at all 20 levels',()=>{
  expect(defense({rage:true}).maxHP).toBe(311);const d=defense({rage:true,vitality:true,tempHP:12,damageTaken:50});expect(d.maxHP).toBe(331);expect(d.currentHP).toBe(281);expect(d.tempHP).toBe(12);expect(d.deathThreshold).toBe(-34);expect([d.fortitude,d.reflex,d.will,d.fear]).toEqual([30,16,18,20]);
 });
 it('preserves wounds and removes Constitution HP when rage ends',()=>{
  expect(defense({rage:true,vitality:true,damageTaken:260}).currentHP).toBe(71);expect(defense({damageTaken:260}).currentHP).toBe(-9);
 });
 it('handles Enlarge AC, CMD, Reflex and no HP change',()=>{
  const normal=defense(),d=defense({enlarge:true});expect(d.maxHP).toBe(normal.maxHP);expect(d.ac).toBe(normal.ac-2);expect(d.cmd).toBe(normal.cmd+1);expect(d.reflex).toBe(15);
 });
 it('applies Haste to AC, CMD and Reflex only',()=>{
  const a=defense(),b=defense({haste:true});expect([b.ac-a.ac,b.cmd-a.cmd,b.reflex-a.reflex]).toEqual([1,1,1]);expect(b.will).toBe(a.will);expect(b.fortitude).toBe(a.fortitude);
 });
 it('does not stack morale Will bonuses but stacks fear-specific Bravery',()=>{
  const d=defense({rage:true,vitality:true,heroism:true,haste:true});expect([d.fortitude,d.reflex,d.will,d.fear]).toEqual([32,19,18,20]);expect(defense({heroism:true}).will).toBe(17);
 });
 it('applies rage, Reckless Abandon, and Charge AC penalties to CMD',()=>{
  const d=defense({rage:true,reckless:true,charge:true});expect(d.ac).toBe(29);expect(d.cmd).toBe(45);
 });
 it('never derives touch or flat-footed from provisional AC',()=>{
  const d=defense();expect(d.verified).toBe(false);expect(d.ac).toBe(36);expect(d.touchParts.some(([name])=>name.includes('remainder'))).toBe(false);expect(d.flatParts.some(([name])=>name.includes('remainder'))).toBe(false);expect(d.touch).toBe(20);expect(d.flatFooted).toBe(20);
 });
 it('computes all AC types from verified components and keeps armor out of CMD',()=>{
  const d=defense({provisionalAC:false,armor:10,shield:2,naturalArmor:4,dodge:1,uncannyDodge:false,haste:true});expect(d.ac).toBe(38);expect(d.touch).toBe(22);expect(d.flatFooted).toBe(31);expect(d.cmd).toBe(51);expect(d.flatCMD).toBe(44);
 });
 it('retains DEX/dodge with Uncanny Dodge and loses them when absent',()=>{
  const a=defense({provisionalAC:false,haste:true,dodge:2});expect(a.flatFooted).toBe(a.ac);const b=defense({provisionalAC:false,haste:true,dodge:2,uncannyDodge:false,flatFooted:true});expect(b.flatFooted).toBe(15);expect(b.activeCMD).toBe(44);
 });
 it('uses explicit armor maximum DEX for AC but not saves/CMD',()=>{
  const d=defense({provisionalAC:false,armor:10,maxDex:2});expect(d.ac).toBe(27);expect(d.touch).toBe(17);expect(d.reflex).toBe(16);expect(d.cmd).toBe(49);
 });
 it('ends rage when unconscious without Vitality and sustains it with Vitality',()=>{
  const ended=calculate({...defaults,vitality:false,unconscious:true});expect(ended.s.rage).toBe(false);expect(ended.defense.maxHP).toBe(251);const c=calculate({...defaults,unconscious:true});expect(c.s.rage).toBe(true);expect(c.defense.maxHP).toBe(331);expect(c.defense.unconscious).toBe(true);expect(c.defense.reflex).toBe(6);expect(c.aoos).toBe(0);
 });
 it('loses the Haste dodge Reflex bonus when helpless or flat-footed without Uncanny Dodge',()=>{
  expect(defense({haste:true,unconscious:true}).reflex).toBe(6);expect(defense({haste:true,flatFooted:true,uncannyDodge:false}).reflex).toBe(16);expect(defense({haste:true,flatFooted:true,uncannyDodge:true}).reflex).toBe(17);
 });
 it('handles HP-triggered unconsciousness and death precisely',()=>{
  expect(defense({damageTaken:251}).conditions).toContain('Disabled');expect(defense({damageTaken:252}).unconscious).toBe(true);expect(defense({damageTaken:276}).dead).toBe(false);expect(defense({damageTaken:277}).dead).toBe(true);expect(normalize({...defaults,vitality:false,damageTaken:312}).rage).toBe(false);
 });
 it('applies Blood Sanctuary only in its qualifying context',()=>{
  expect(defense().will).toBe(15);expect(defense({allySpell:true}).will).toBe(17);expect(defense({allySpell:true,bloodSanctuary:false}).will).toBe(15);
 });
 it('does not invent bonuses from Improved Uncanny Dodge or Inner Fortitude',()=>{
  const d=defense({innerFortitude:true,abilityDamage:8,abilityDrain:4,abilityPenalty:5});expect(d.innerFortitude).toEqual({damage:2,drain:1,penalty:0});expect(d.will).toBe(15);expect(d.ac).toBe(36);expect(defense({improvedUncannyDodge:false}).ac).toBe(d.ac);expect(defense({innerFortitude:false,abilityDamage:8}).innerFortitude.damage).toBe(8);
 });
 it('keeps personal DR separate from target DR and does not invent resistance',()=>{
  const d=defense({ownDR:5,dr:20,drBypass:'adamantine'});expect(d.dr).toBe(5);expect(d.drBypass).toBe('adamantine');expect(d.resistances).toEqual([]);expect(defense({resistanceNotes:'Cold 10 — GM-verified equipment'}).resistances).toEqual(['Cold 10 — GM-verified equipment']);expect(defense({immunityNotes:'Sleep — verified source'}).immunities).toEqual(['Sleep — verified source']);expect(d.immunities).toEqual([]);
 });
 it('covers all combinations of shared defensive combat effects',()=>{
  for(let mask=0;mask<128;mask++){
   const [rage,vitality,reckless,enlarge,haste,heroism,charge]=Array.from({length:7},(_,i)=>Boolean(mask&(1<<i)));
   const r=calculate({...defaults,rage,vitality,reckless,enlarge,haste,heroism,charge});const d=r.defense;
   const conBonus=r.s.rage?(r.s.vitality?4:3):0;
   expect(d.maxHP).toBe(251+conBonus*20);expect(d.fortitude).toBe(26+conBonus+(heroism?2:0));expect(d.reflex).toBe(16-(enlarge?1:0)+(haste?1:0)+(heroism?2:0));expect(d.will).toBe(15+Math.max(r.s.rage?3:0,heroism?2:0));expect(d.ac).toBe(36-(enlarge?2:0)+(haste?1:0)-(r.s.rage?2:0)-(r.s.reckless?3:0)-(charge?2:0));
  }
 });
});

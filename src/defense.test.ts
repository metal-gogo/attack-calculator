import {describe,it,expect} from 'vitest';
import {calculate,defaults,State,normalize} from './calculator';
const defense=(changes:Partial<State>={})=>calculate({...defaults,rage:false,reckless:false,...changes}).defense;
describe('equipment-derived defenses',()=>{
 it('preserves confirmed ability totals with belt/headband included exactly once',()=>{
  const c=calculate({...defaults,rage:false});expect([c.str,c.dex,c.con,c.wis]).toEqual([28,20,26,18]);expect(c.defense.maxHP).toBe(251);expect([c.defense.fortitude,c.defense.reflex,c.defense.will,c.defense.fear]).toEqual([26,16,15,17]);
 });
 it('always enables Vitality with rage, even for stale saved vitality=false',()=>{
  const c=calculate({...defaults,vitality:false});expect(c.s.vitality).toBe(true);expect(c.con).toBe(34);expect(c.defense.maxHP).toBe(331);expect(c.defense.deathThreshold).toBe(-34);expect(normalize({...defaults,rage:false}).vitality).toBe(false);
 });
 it('tracks actual Constitution HP separately from temporary HP',()=>{
  const d=defense({rage:true,tempHP:12,damageTaken:50});expect(d.maxHP).toBe(331);expect(d.currentHP).toBe(281);expect(d.tempHP).toBe(12);expect([d.fortitude,d.reflex,d.will,d.fear]).toEqual([30,16,18,20]);expect(defense({damageTaken:260}).currentHP).toBe(-9);
 });
 it('calculates normal, touch and flat-footed AC from equipment, not provisional 36',()=>{
  const d=defense();expect(d.verified).toBe(true);expect(d.ac).toBe(36);expect(d.touch).toBe(20);expect(d.flatFooted).toBe(31);expect(d.cmd).toBe(49);expect(d.acParts.filter(([source])=>source.includes('Full Plate')).map(([,value])=>value)).toEqual([11,2]);
 });
 it('gates shield AC by equipped state and the active weapon grip',()=>{
  expect(defense().shieldBonus).toBe(0);expect(defense({weapon:'sun'}).shieldBonus).toBe(0);expect(defense({weapon:'dagger'}).shieldBonus).toBe(3);expect(defense({weapon:'dagger'}).ac).toBe(39);expect(defense({weapon:'dagger',shieldEquipped:false}).ac).toBe(36);expect(defense({weapon:'sun',sunTwoHanded:false}).ac).toBe(39);
 });
 it('synchronizes one-handed Sun Blade attacks, damage and shield use',()=>{
  const c=calculate({...defaults,weapon:'sun',sunTwoHanded:false});expect(c.w.hands).toBe(1);expect(c.furious).toBe(false);expect(c.normal).toBe('1d10 +26');expect(c.defense.shieldBonus).toBe(3);expect(c.fullAttack[0]).toBe(30);
 });
 it('never adds armor, shield or natural armor to touch AC or CMD',()=>{
  const a=defense({weapon:'dagger'}),b=defense({weapon:'dagger',armor:20,armorSpecialization:4,shield:10,naturalArmor:12});expect(a.touch).toBe(b.touch);expect(a.cmd).toBe(b.cmd);expect(b.ac-a.ac).toBe(27);
 });
 it('uses full Dexterity for CMD, including when the armor cap is lower',()=>{
 const baseline=defense({maxDex:4});expect(baseline.cmd).toBe(49);expect(baseline.cmdParts.find(([source])=>source.startsWith('Dexterity'))?.[1]).toBe(5);expect(defense({rage:true,reckless:true}).activeCMD).toBe(47);
 });
 it('enforces maximum DEX for AC/touch, but not Reflex/CMD',()=>{
  const d=defense({maxDex:2});expect(d.ac).toBe(33);expect(d.touch).toBe(17);expect(d.reflex).toBe(16);expect(d.cmd).toBe(49);
 });
 it('handles Enlarge size and DEX without double-counting the armor cap',()=>{
  const d=defense({enlarge:true});expect(d.maxHP).toBe(251);expect(d.ac).toBe(34);expect(d.touch).toBe(18);expect(d.cmd).toBe(50);expect(d.reflex).toBe(15);
 });
 it('stacks Haste dodge bonuses but not competing morale Will bonuses',()=>{
  const d=defense({rage:true,heroism:true,haste:true});expect([d.fortitude,d.reflex,d.will,d.fear]).toEqual([32,19,18,20]);expect(d.ac).toBe(35);expect(d.cmd).toBe(51);expect(defense({heroism:true}).will).toBe(17);
 });
 it('applies rage, Reckless Abandon and Charge AC penalties to CMD',()=>{
  const d=defense({rage:true,reckless:true,charge:true});expect(d.ac).toBe(29);expect(d.cmd).toBe(45);
 });
 it('removes DEX and dodge from flat-footed values regardless of Uncanny Dodge',()=>{
  const d=defense({haste:true,dodge:2});expect(d.flatFooted).toBe(31);const e=defense({haste:true,dodge:2,uncannyDodge:false,flatFooted:true});expect(e.flatFooted).toBe(31);expect(e.flatCMD).toBe(44);expect(e.reflex).toBe(16);
 });
 it('makes flat-footed a manual DEX-denial override with Uncanny Dodge as reference only',()=>{
 const normal=defense();for(const uncannyDodge of [true,false]){const flat=defense({flatFooted:true,uncannyDodge});expect(normal.activeAC).toBe(36);expect(flat.activeAC).toBe(31);expect(flat.activeTouch).toBe(15);expect(flat.activeCMD).toBe(44);expect(flat.ac).toBe(36);expect(flat.activeCMDParts.reduce((n,[,v])=>n+v,0)).toBe(44);}
 });
 it('sustains rage while unconscious and disables actions',()=>{
  const c=calculate({...defaults,vitality:false,unconscious:true,haste:true});expect(c.s.rage).toBe(true);expect(c.s.vitality).toBe(true);expect(c.defense.maxHP).toBe(331);expect(c.defense.reflex).toBe(6);expect(c.aoos).toBe(0);
 });
 it('synchronizes nonlethal unconsciousness, staggered, and rage-dependent HP',()=>{const d=defense({nonlethal:252});expect(d.currentHP).toBe(251);expect(d.unconscious).toBe(true);expect(d.reflex).toBe(6);expect(defense({nonlethal:251}).staggered).toBe(true);expect(defense({nonlethal:250}).unconscious).toBe(false);const c=calculate({...defaults,nonlethal:260});expect(c.defense.unconscious).toBe(false);expect(calculate({...defaults,rage:false,nonlethal:260}).aoos).toBe(0);});
 it('handles unconsciousness and Constitution death thresholds',()=>{
  expect(defense({damageTaken:251}).conditions).toContain('Disabled');expect(defense({damageTaken:252}).unconscious).toBe(true);expect(defense({damageTaken:276}).dead).toBe(false);expect(defense({damageTaken:277}).dead).toBe(true);expect(defense({rage:true,damageTaken:364}).dead).toBe(false);expect(defense({rage:true,damageTaken:365}).dead).toBe(true);
 });
 it('applies Blood Sanctuary only against qualifying spells',()=>{
  expect(defense().will).toBe(15);expect(defense({allySpell:true}).will).toBe(17);expect(defense({allySpell:true,bloodSanctuary:false}).will).toBe(15);
 });
 it('does not invent AC bonuses from Improved Uncanny Dodge or the ring',()=>{
  const d=defense({abilityDamage:8,abilityDrain:4,abilityPenalty:5,damageTaken:20});expect(d.innerFortitude).toEqual({damage:2,drain:1,penalty:0});expect(d.currentHP).toBe(231);expect(d.ac).toBe(36);expect(defense({improvedUncannyDodge:false}).ac).toBe(d.ac);expect(defense({innerFortitude:false,abilityDamage:8}).innerFortitude.damage).toBe(8);
 });
 it('shares confirmed additional Seraphel CON across HP, Fortitude and Brutality',()=>{
  const c=calculate({...defaults,seraphelExtra:true,brutality:true});expect(c.con).toBe(36);expect(c.defense.maxHP).toBe(351);expect(c.defense.fortitude).toBe(31);expect(c.defense.deathThreshold).toBe(-36);expect(c.brutality).toBe(19);
 });
 it('applies a confirmed used manual as a permanent inherent adjustment only',()=>{
  const c=calculate({...defaults,rage:false,manualExtra:true});expect(c.str).toBe(31);expect(c.defense.cmd).toBe(50);expect(c.con).toBe(26);
 });
 it('records sleep immunity, no blanket undead immunity, and raging darkvision',()=>{
  expect(defense().immunities).toEqual(['Sleep — Leaf Green Faith Bond (sheet record)']);expect(defense({sleepImmunity:false}).immunities).toEqual([]);expect(defense().conditions.some(s=>s.includes('Darkvision'))).toBe(false);expect(defense({rage:true}).conditions).toContain('Darkvision while Bloodraging');
 });
 it('keeps personal DR separate from target DR and treats manual protections as notes',()=>{
  const d=defense({ownDR:5,dr:20,drBypass:'adamantine'});expect(d.dr).toBe(5);expect(d.drBypass).toBe('adamantine');expect(d.resistances).toEqual([]);expect(defense({resistanceNotes:'Cold 10 — verified source'}).resistances).toEqual(['Cold 10 — verified source']);
 });
 it('bounds limited-use counters and gives flight no invented numerical defenses',()=>{
  const s=normalize({...defaults,bootsUses:10,gogglesUses:-2,talismanUses:5});expect([s.bootsUses,s.gogglesUses,s.talismanUses]).toEqual([3,0,2]);expect(defense({bootsActive:true}).ac).toBe(defense().ac);expect(defense({bootsActive:true}).conditions).toContain('Flying (Winged Boots; track duration)');
 });
 it('keeps legacy provisional mode isolated from touch and flat-footed components',()=>{
  const d=defense({provisionalAC:true});expect(d.verified).toBe(false);expect(d.touchParts.some(([source])=>source.includes('remainder'))).toBe(false);expect(d.flatParts.some(([source])=>source.includes('remainder'))).toBe(false);
 });
 it('covers every combination of shared defensive effects',()=>{
  for(let mask=0;mask<64;mask++){
   const [rage,reckless,enlarge,haste,heroism,charge]=Array.from({length:6},(_,i)=>Boolean(mask&(1<<i)));
   const r=calculate({...defaults,rage,reckless,enlarge,haste,heroism,charge}),d=r.defense;
   expect(d.maxHP).toBe(251+(rage?80:0));expect(d.fortitude).toBe(26+(rage?4:0)+(heroism?2:0));expect(d.reflex).toBe(16-(enlarge?1:0)+(haste?1:0)+(heroism?2:0));expect(d.will).toBe(15+Math.max(rage?3:0,heroism?2:0));expect(d.ac).toBe(36-(enlarge?2:0)+(haste?1:0)-(rage?2:0)-(r.s.reckless?3:0)-(charge?2:0));
  }
 });
});

import {describe,it,expect} from 'vitest';
import {calculate,defaults,normalize,summary,State} from './calculator';
const calc=(changes:Partial<State>={})=>calculate({...defaults,...changes});
describe('Hapi attack calculator',()=>{
 it('calculates the raging heavy flail and first-attack Furious Focus',()=>{
 const c=calc();expect(c.fullAttack).toEqual([40,29,24,19]);expect(c.aoo).toBe(34);expect(c.normal).toBe('1d10 +41');expect(c.critical).toBe('(1d10 +41) ×2');expect(c.ac).toBe(30);expect(c.cmd).toBe(47);
 });
 it('uses the actual first attack only for Furious Focus with Haste',()=>{
 const c=calc({haste:true});expect(c.fullAttack).toEqual([41,35,30,25,20]);
 });
 it('does not grant heavy-blades training to flails or daggers',()=>{
 expect(calc().w.training).toBe(0);expect(calc({weapon:'dagger'}).w.training).toBe(0);expect(calc({weapon:'sun'}).w.training).toBe(2);
 });
 it('keeps the dagger one handed with masterwork attack but no enhancement damage',()=>{
 const c=calc({weapon:'dagger'});expect(c.fullAttack).toEqual([30,25,20,15]);expect(c.normal).toBe('1d4 +24');expect(c.furious).toBe(false);
 });
 it('enlarges ability scores, size attack, and weapon dice',()=>{
 const c=calc({enlarge:true});expect([c.str,c.dex,c.con]).toEqual([36,18,34]);expect(c.normal).toBe('2d8 +42');expect(c.fullAttack[0]).toBe(40);expect(calc({weapon:'dagger',enlarge:true}).normal).toBe('1d6 +25');
 });
 it('requires rage and Power Attack for Raging Brutality',()=>{
 expect(normalize({...defaults,rage:false,brutality:true}).brutality).toBe(false);expect(normalize({...defaults,power:false,brutality:true}).brutality).toBe(false);expect(calc({rage:false}).con).toBe(26);
 });
 it('adds Raging Brutality once to normal and critical damage',()=>{
 const c=calc({brutality:true});expect(c.brutality).toBe(18);expect(c.normal).toBe('1d10 +59');expect(c.critical).toBe('(1d10 +41) ×2 +18');
 });
 it('applies Sun Blade evil enhancement and undead damage without multiplying Brutality',()=>{
 const c=calc({weapon:'sun',evil:true,undead:true,brutality:true});expect(c.enhancement).toBe(4);expect(c.normal).toBe('(1d10 +42) ×2 +18');expect(c.critical).toBe('(1d10 +42) ×3 +18');expect(c.critBase).toBe(3);expect(c.critMultiplier).toBe(3);expect(calc({weapon:'sun',undead:false}).critMultiplier).toBe(2);
 });
 it('restricts Warrior Spirit to Heavy Blades and caps enhancement at +5',()=>{
 expect(calc({spirit:true}).s.spirit).toBe(false);expect(calc({weapon:'sun',spirit:true}).enhancement).toBe(4);expect(calc({weapon:'sun',evil:true,spirit:true}).enhancement).toBe(5);
 });
 it('replaces normal flanking with Outflank and conditions Bond on flanking',()=>{
 expect(calc({flanking:true}).single).toBe(42);expect(calc({flanking:true,outflank:true}).single).toBe(44);expect(calc({flanking:true,outflank:true,bond:true}).single).toBe(47);expect(calc({bond:true}).single).toBe(40);
 });
 it('limits charge to the single attack and Paired Opportunists to AoO',()=>{
 const c=calc({charge:true,paired:true});expect(c.single).toBe(42);expect(c.fullAttack).toEqual(calc().fullAttack);expect(c.aoo).toBe(38);expect(c.ac).toBe(28);expect(c.cmd).toBe(45);
 });
 it('separates armor from CMD and accounts for dexterity Combat Reflexes',()=>{
 const c=calc({armor:12,otherAC:2,otherCMD:3,provisionalAC:false,naturalArmor:0,armorSpecialization:0,maxDex:99});expect(c.ac).toBe(29);expect(c.cmd).toBe(50);expect(c.aoos).toBe(6);expect(calc({enlarge:true}).aoos).toBe(5);
 });
 it('retains larger weapon dice inside the multiplier and copies the table rule',()=>{
 const c=calc({enlarge:true,brutality:true});expect(c.critical).toBe('(2d8 +42) ×2 +18');expect(summary({...defaults,enlarge:true,brutality:true})).toContain('(2d8 +42) ×2 +18');expect(summary(defaults)).toContain('roll damage once, then multiply');
 });
 it('includes configurable Bane in attack and damage',()=>{
 const c=calc({bane:true,baneBonus:3});expect(c.single).toBe(43);expect(c.normal).toBe('1d10 +44');
 });
 it('exposes reduction warnings rather than silently ignoring target traits',()=>{
 expect(calc({incorporeal:true}).warnings.join(' ')).toContain('half damage');expect(summary({...defaults,dr:10})).toContain('DR 10');
 });
});

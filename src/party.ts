export interface HitPoints {damageTaken:number;tempHP:number;nonlethal:number}
export interface PartyMember extends HitPoints {id:string;name:string;maxHP:number}
export const PARTY_STORAGE='hapi-party-v1';
const integer=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(value)?Math.trunc(value):min));
export function takeDamage<T extends HitPoints>(pool:T,amount:number):T {
 const damage=integer(amount,0,99999);
 return {...pool,tempHP:Math.max(0,pool.tempHP-damage),damageTaken:integer(pool.damageTaken+Math.max(0,damage-pool.tempHP),0,99999)};
}
export function healDamage<T extends HitPoints>(pool:T,amount:number):T {
 return {...pool,damageTaken:Math.max(0,pool.damageTaken-integer(amount,0,99999))};
}
export function setCurrentHP<T extends PartyMember>(member:T,current:number):T {
 return {...member,damageTaken:integer(member.maxHP-integer(current,member.maxHP-99999,member.maxHP),0,99999)};
}
export const currentHP=(member:PartyMember)=>member.maxHP-member.damageTaken;
export function hpStatus(member:PartyMember){
 const hp=currentHP(member);
 return hp<0||member.nonlethal>hp?'Unconscious':hp>0&&member.nonlethal===hp?'Staggered':hp===0?'At zero':hp<=member.maxHP/2?'Low HP':hp<member.maxHP?'Wounded':'Full HP';
}
// Invalid records are skipped; valid records and stable identities survive reloads.
export function decodeParty(serialized:string|null):PartyMember[]{
 if(!serialized)return [];
 const data:unknown=JSON.parse(serialized);
 if(!data||typeof data!=='object'||!('version' in data)||data.version!==1||!('members' in data)||!Array.isArray(data.members))throw new Error('Unsupported party data');
 const ids=new Set<string>();
 return data.members.filter((value):value is PartyMember=>{
  if(!value||typeof value!=='object')return false;
  const m=value as Partial<PartyMember>;
  if(typeof m.id!=='string'||!m.id||m.id==='hapi'||m.id.length>100||ids.has(m.id)||typeof m.name!=='string'||!m.name.trim()||![m.maxHP,m.damageTaken,m.tempHP].every(n=>typeof n==='number'&&Number.isFinite(n)))return false;
  if(m.nonlethal!==undefined&&(typeof m.nonlethal!=='number'||!Number.isFinite(m.nonlethal)))return false;
  ids.add(m.id);return true;
 }).map(m=>({...m,name:m.name.trim().slice(0,60),maxHP:integer(m.maxHP,1,9999),damageTaken:integer(m.damageTaken,0,99999),tempHP:integer(m.tempHP,0,9999),nonlethal:integer(m.nonlethal??0,0,99999)}));
}

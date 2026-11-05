import type {Weapon} from './calculator';

/** Decorative weapon silhouettes; the adjacent weapon names provide accessible labels. */
export function WeaponIcon({weapon}:{weapon:Weapon}){
 return <svg className={`weapon-type-icon weapon-type-${weapon}`} viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
  {weapon==='flail'&&<>
   <path d="m9 57 13-24 6 3-13 25Z" fill="currentColor" fillOpacity=".16"/>
   <path d="m12 51 5 3m-2-9 5 3m-2-9 5 3"/>
   <ellipse cx="27" cy="30" rx="2.4" ry="4.4" transform="rotate(20 27 30)"/>
   <ellipse cx="31" cy="22" rx="2.4" ry="4.4" transform="rotate(40 31 22)"/>
   <ellipse cx="38" cy="20" rx="2.4" ry="4.4" transform="rotate(90 38 20)"/>
   <ellipse cx="44" cy="25" rx="2.4" ry="4.4" transform="rotate(140 44 25)"/>
   <circle cx="49" cy="36" r="9" fill="currentColor" fillOpacity=".16"/>
   <path d="M49 23v4m0 18v4M36 36h4m18 0h4M40 27l3 3m12 12 3 3M58 27l-3 3m-15 15 3-3"/>
   <path d="m45 33 4-2 4 3m-7 5 4 2" strokeWidth="1.5"/>
  </>}
  {weapon==='sun'&&<>
   <circle cx="32" cy="23" r="13" strokeOpacity=".3" strokeWidth="1.5"/>
   <path d="M28 38V14l4-10 4 10v24Z" fill="currentColor" fillOpacity=".18"/>
   <path d="M32 14v20M21 41q11-7 22 0M29 42v11h6V42m-6 4h6m-6 4h6"/>
   <circle cx="32" cy="58" r="3.5" fill="currentColor" fillOpacity=".2"/>
   <path d="M10 23h5m34 0h5M16 7l4 4m24 0 4-4M16 38l4-4m24 0 4 4"/>
  </>}
  {weapon==='dagger'&&<>
   <path d="m24 36 26-24-7 22-10 10Z" fill="currentColor" fillOpacity=".18"/>
   <path d="m30 38 20-26M20 34l16 15M23 42l5 5-11 11-5-5Zm-5 6 5 5M10 54l6 6"/>
  </>}
 </svg>;
}

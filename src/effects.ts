import type {State} from './calculator';
// Equipment penalty is derived, never stored as a removable condition.
export function sunBladeNegativeLevels(state:Pick<State,'weapon'|'wielderEvil'>){
 return state.weapon==='sun'&&state.wielderEvil?1:0;
}

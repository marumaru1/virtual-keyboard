/* eslint-disable import/extensions */
import create from './utils/create.js';

export default class Key {
    constructor({ small, shift, code }){
this.code = code;
this.small = small;
this.shift = shift;
this.isFnKey = Boolean(small.match(/ctrl|arr|Alt|Shift|Tab|Back|Del|Enter|Caps|Win/));

if (shift && shift.match(/[^a-zA-Za-яА-ЯёЁ0-9]/)){
    this.sub = create('div', 'sub', this.shift);
} else {
    this.sub = create('div', 'sub', '');
}

this.letter = create('div', 'letter', small);
this.div = create('div', 'keyboard__key', [this.sub, this.letter], null, ['code', this.code], []);
    }
}
// new Key({});


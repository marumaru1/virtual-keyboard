/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable import/extensions */
import * as storage from './Storage.js';
import create from './utils/create.js';
import language from './layouts/index.js';
import Key from './Key.js';

const main = create('main', '',
  [create('h1', 'title', 'My Virtual Keyboard  ^_^')]);

export default class Keyboard {
  constructor(rowsOrder) {
    this.rowsOrder = rowsOrder;
    this.keysPressed = {};
    this.isCaps = false;
  }

  init(code) {
    this.keyBase = language[code];
    this.output = create('textarea', 'output', null, main,
      ['placeholder', 'Write something here my friend. For change language press "left Ctrl + Alt"'],
      ['rows', 5],
      ['cols', 60],
      ['spellcheck', false],
      ['autocorrect', 'off']);
    this.container = create('div', 'keyboard', null, main, ['language', code]);
    document.body.prepend(main);
    return this;
  }

  generateLayout() {
    this.keyButtons = [];
    if (!this.rowsOrder.length) throw Error('Can\'t generate layout! Check buttons layout template!');

    this.rowsOrder.forEach((row, i) => {
      const rowElement = create('div', 'keyboard__row', null, this.container, ['row', i + 1]);
      rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
      row.forEach((code) => {
        const keyObj = this.keyBase.find((key) => key.code === code);
        if (keyObj) {
          const keyButton = new Key(keyObj);
          this.keyButtons.push(keyButton);
          rowElement.appendChild(keyButton.div);
        }
      });
    });
  
  document.addEventListener('keydown', this.handleEvent);
  document.addEventListener('keyup', this.handleEvent);
  }

  handleEvent = (e) => {
   if (e.stopPropagation) e.stopPropagation();
   const { code, type } = e;
   const keyObj = this.keyButtons.find((key) => key.code === code);
   if (!keyObj) return;
   

   if(type.match(/keydown|mousedown/)) {
     if (type.match(/key/)) e.preventDefault();

     if (code.match(/Shift/)) this.shiftKey = true;

     keyObj.div.classList.add('active');


//lang
if (code.match(/Control/)) this.ctrlKey = true;
if (code.match(/Alt/)) this.altKey = true;

if (code.match(/Control/) && this.altKey) this.switchLanguage();
if (code.match(/Alt/) && this.ctrlKey) this.switchLanguage();

if (!this.isCaps) {
  this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
} else if (this.isCaps) {
  if (this.shiftKey) {
    this.printToOutput(keyObj, keyObj.sub.innerHTML ? keyObj.small : keyObj.small);
  }else {
    this.printToOutput(keyObj, !keyObj.sub.innerHTML ? keyObj.small : keyObj.small);
  }
  }

//button
   } else if (type.match(/keyup|mouseup/)){
    keyObj.div.classList.remove('active');

    if (code.match(/Shift/)) this.shiftKey = false;

    if (code.match(/Control/)) this.ctrlKey = false;
    if (code.match(/Alt/)) this.altKey = false;

   }
  }

  switchLanguage = () => {
    const langAbbr = Object.keys(language); 
    let langIdx = langAbbr.indexOf(this.container.dataset.language);
    this.keyBase = langIdx + 1 < langAbbr.length ? language[langAbbr[langIdx += 1]]
    : language[langAbbr[langIdx -= langIdx]];

    this.container.dataset.language = langAbbr[langIdx];
    storage.set('kbLang', langAbbr[langIdx]);

    this.keyButtons.forEach((button) => {
const keyObj = this.keyBase.find((key) => key.code === button.code);
if (!keyObj) return;
button.shift = keyObj.shift;
button.small = keyObj.small;
if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)) {
  button.sub.innerHTML = keyObj.shift;
} else {
  button.sub.innerHTML = '';
}
button.letter.innerHTML = keyObj.small;
    });
  }



  printToOutput (keyObj, symbol) {
 let cursorPos = this.output.selectionStart;
 const left = this.output.value.slice(0, cursorPos);
 const right = this.output.value.slice(cursorPos);

 const fnButtonsHandler = {
   Tab: () => {
     this.output.value = `${left}\t${right}`;
   },
   ArrowLeft: () => {
     cursorPos = cursorPos - 1 >= 0 ? cursorPos -1 : 0;
   },
   ArrowRight: () => {
    cursorPos += 1;
  },
  ArrowUp: () => {
    const positionFromLeft = this.output.value.slice(0, cursorPos).match(/(\n).*$(?!\1)/g) || [[1]];
    cursorPos -= positionFromLeft[0].length;
  },
  ArrowDown: () => {
    const positionFromLeft = this.output.value.slice(cursorPos).match(/^.*(\n).*(?!\1)/) || [[1]];
    cursorPos += positionFromLeft[0].length + 1;
  },

  Enter: () => {
    this.output.value = `${left}\n${right}`;
    cursorPos += 1;
  },

  Delete: () => {
    this.output.value = `${left}${right.slice(1)}`;
  },

  Backspace: () => {
    this.output.value = `${left.slice(0, -1)}${right}`;
    cursorPos -= 1;
  },
  Space: () => {
    this.output.value = `${left} ${right}`;
    cursorPos += 1;
  },
 }

 if (fnButtonsHandler[keyObj.code]) fnButtonsHandler[keyObj.code]();
 else if (!keyObj.isFnKey) {
   cursorPos += 1;
   this.output.value = `${left}${symbol || ''}${right}`;
 }
 this.output.setSelectionRange(cursorPos, cursorPos);
  }
}

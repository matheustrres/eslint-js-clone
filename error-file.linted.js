var text = 'abc123' + 'cde9982';
const neverReassigned = {};
neverReassigned.name = 'erick wendel';
const tobeReassined = {};
tobeReassined = {
  name: 'ana'
};
tobeReassined.name = 1;
tobeReassined = 0;
tobeReassined = {
  name: 'ana'
};
let result = text.split(',').map(letter => {
  return letter.toUpperCase();
}).join('.');
console.log(result);

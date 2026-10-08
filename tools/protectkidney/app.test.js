const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(__dirname + '/app.js', 'utf8');
const sandbox = { document: { querySelector() { return { addEventListener() {}, innerHTML: '', value: '', textContent: '', hidden: false }; }, querySelectorAll() { return []; } } };
vm.createContext(sandbox);
vm.runInContext(source.replace(/render\(\);\s*$/, ';globalThis.__foods=foods;globalThis.__descriptions=descriptions;'), sandbox);

assert.equal(typeof sandbox.description, 'function', '食物简介函数应存在');
const chicken = sandbox.__foods.find(food => food.name === '鸡胸肉');
assert.match(sandbox.description(chicken), /蛋白质/, '鸡胸肉应有包含营养特点的简短简介');
for (const name of ['鸡胸肉', '火鸡肉', '鳕鱼', '白开水', '柠檬水']) {
  assert.ok(sandbox.__descriptions[name].startsWith(`${name}，`), `${name}的专属简介应以食物名称开头`);
  assert.match(sandbox.__descriptions[name], /[，。]/, `${name}应有轻松易读的专属简介`);
  assert.match(sandbox.__descriptions[name], /餐桌|搭配|清爽|家常|上桌/, `${name}的专属简介应保持轻松的餐桌语气`);
}
assert.ok(sandbox.__foods.every(food => sandbox.description(food).trim()), '每种食物均应有简短简介');
assert.equal(Object.keys(sandbox.__descriptions).length, sandbox.__foods.length, '每种食物都应配置独立简介');
assert.ok(sandbox.__foods.every(food => Object.hasOwn(sandbox.__descriptions, food.name)), '不应依赖分类通用简介');

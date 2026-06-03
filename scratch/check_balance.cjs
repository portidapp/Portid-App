const fs = require('fs');
const content = fs.readFileSync('c:/Users/HP/Documents/web projects/touch-and-go-profiles-main/src/pages/EditProfile.tsx', 'utf8');

function checkBalance(str) {
  const stack = [];
  const pairs = { '{': '}', '(': ')', '[': ']' };
  const openers = Object.keys(pairs);
  const closers = Object.values(pairs);

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (openers.includes(char)) {
      stack.push({ char, line: str.substring(0, i).split('\n').length });
    } else if (closers.includes(char)) {
      const last = stack.pop();
      if (!last || pairs[last.char] !== char) {
        console.log(`Mismatch: expected ${last ? pairs[last.char] : 'nothing'}, found ${char} at line ${str.substring(0, i).split('\n').length}`);
        return false;
      }
    }
  }
  if (stack.length > 0) {
    stack.forEach(s => console.log(`Unclosed ${s.char} from line ${s.line}`));
    return false;
  }
  console.log('Balanced!');
  return true;
}

checkBalance(content);

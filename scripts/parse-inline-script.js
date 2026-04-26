const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('<script>') + 8;
const end = html.lastIndexOf('</script>');
const script = html.slice(start, end);

try {
  new vm.Script(script, { filename: 'inline-script.js' });
  console.log('SCRIPT_OK');
} catch (error) {
  console.log('MESSAGE=' + error.message);
  if (error.stack) console.log(error.stack);
  const line = error.lineNumber || error.line;
  const column = error.columnNumber || error.column;
  if (line) {
    const lines = script.split(/\r?\n/);
    for (let i = Math.max(0, line - 3); i < Math.min(lines.length, line + 2); i += 1) {
      console.log(`${i + 1}:${lines[i]}`);
    }
    console.log('COLUMN=' + column);
  }
  process.exit(1);
}
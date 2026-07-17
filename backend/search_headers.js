const fs = require('fs');

const content = fs.readFileSync('c:\\Users\\muham\\Desktop\\Soliqly\\api lists.md', 'utf8');

// Find all occurrences of headers or anything with "X-"
const matches = [];
const regex = /header|x-|bypass|force|ignore|simulate|debug|test/gi;
let match;
while ((match = regex.exec(content)) !== null) {
  const segment = content.slice(Math.max(0, match.index - 100), Math.min(content.length, match.index + 300));
  matches.push(segment);
}

console.log(`Found ${matches.length} header/bypass matches:`);
for (let i = 0; i < Math.min(10, matches.length); i++) {
  console.log(`--- Match ${i+1} ---`);
  console.log(matches[i]);
}

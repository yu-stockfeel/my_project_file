const fs = require('fs');
const pdf = require('pdf-parse');

async function test() {
  const file = fs.readFileSync('test.pdf');
  try {
    const data = await pdf(file);
    console.log("Success:", data.text);
  } catch(e) {
    console.error("Local Error:", e);
  }
}

test();

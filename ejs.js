const ejs = require('ejs');
const http = require('http');
const fs = require('fs');

function getDynamicData() {
    return {
      pageTitle: 'My Page',
      headingText: 'My List',
      items: ['Item 1', 'Item 2', 'Item 3']
    };
  }

  
  const template = fs.readFileSync('template.ejs', 'utf-8');

  const data = getDynamicData();
const html = ejs.render(template, data);

console.log(html)

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
  
  server.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
  
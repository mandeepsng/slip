const pdf = require('html-pdf');
const fs = require('fs');

const html = fs.readFileSync('output.html', 'utf8');
const options = {
    format: 'Letter',
    border: {
      top: '1px',
      right: '1px',
      bottom: '1px',
      left: '1px'
    },
    footer: {
      height: '15mm',
      
    }
  };

pdf.create(html, options).toFile('name.pdf', (err, res) => {
  if (err) return console.log(err);
  console.log(res); // { filename: '/app/businesscard.pdf' }
});

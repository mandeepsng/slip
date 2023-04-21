const express = require('express');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const handlebars = require('handlebars');
const bodyParser = require('body-parser')
const { convert, compile } = require('html-to-text');
const PDFDoc = require("pdfkit-table");

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.get('/read', (req, res) => {
  const results = [];

  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.send(results);
    });
});


const data = [
    ['Name', 'Age', 'Gender'],
    ['John', '25', 'Male'],
    ['Jane', '30', 'Female'],
    ['Bob', '40', 'Male'],
  ];

  app.get('/generate-pdf', (req, res) => {
    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    doc.pipe(res);
  
    doc.fontSize(16).text('Table Example', { align: 'center' });
    doc.moveDown();
  
    doc.table(data, {
      headers: true,
      columnWidths: [150, 50, 50],
      // add more options as needed
    });
  
    doc.end();
  });


  app.get('/download-pdf', (req, res) => {
    const templatePath = path.join(__dirname, 'views', 'sample.hbs');
    const template = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(template);
  
    const data = {
      name: 'John',
      age: 25,
      hobbies: ['Reading', 'Gardening', 'Traveling'],
    };
  
    const doc = new PDFDocument();
    const filename = 'sample.pdf';
  
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');
  
    doc.text('Template Example');
    doc.moveDown();
  
    const html = compiledTemplate(data);
    const text = convert(html, {
      wordwrap: 130
    });
    doc.text(text);
  
    doc.pipe(res);
    doc.end();
  });


app.get('/test', (req, res) => {
    // start pdf document
    let doc = new PDFDoc({ margin: 30, size: 'A4' });
    // load json file
    const json = require("./table.json");

    const filename = 'sample.pdf';
  
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    
    // to save on server
    doc.pipe(fs.createWriteStream("./document-json.pdf"));
    
    // if json file is array
    Array.isArray(json) ? 
    // any tables
    json.forEach( table => doc.table( table, table.options || {} ) ) : 
    // one table
    doc.table( json, json.options || {} ) ;
    
    // done
    doc.end();
    doc.text('Template Example');
    doc.moveDown();
} )




app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

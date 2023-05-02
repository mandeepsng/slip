const wkhtmltopdf = require('wkhtmltopdf');
const fs = require('fs');

// Set the options for wkhtmltopdf
const options = {
    pageSize: 'letter',
    marginTop: '0.75in',
    marginBottom: '0.75in',
    marginLeft: '0.75in',
    marginRight: '0.75in'
};

// Set the input and output file paths
const inputPath = 'output.html';
const outputPath = 'name.pdf';

// Convert the HTML file to a PDF file
wkhtmltopdf(fs.readFileSync(inputPath), options)
    .pipe(fs.createWriteStream(outputPath))
    .on('finish', () => console.log('PDF created successfully.'));

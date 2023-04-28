const express = require('express');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const PDFDoc = require('pdfkit');
const handlebars = require('hbs');
const bodyParser = require('body-parser')
const { convert, compile } = require('html-to-text');
const PDFDocument = require("pdfkit-table");
const multer = require('multer');

const app = express();
const upload = multer({ dest: 'uploads/' });

const port = 3000;


// Set up the multer middleware to handle file uploads
// const upload = multer({ dest: 'uploads/' });

// const upload = multer({ dest: 'uploads/', fieldname: 'csvfile' });



app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

// const upload = multer({
//   storage: storage,
//   fileFilter: function (req, file, cb) {
//     if (!file.originalname.match(/\.(csv)$/)) {
//       return cb(new Error('Only CSV files are allowed!'));
//     }
//     cb(null, true);
//   }
// });

// app.get('/', (req, res) => {
//   res.send(`
//     <form method="post" action="/" enctype="multipart/form-data">
//       <input type="file" name="csv" accept=".csv">
//       <br>
//       <button type="submit">Upload</button>
//     </form>
//   `);
// });

app.post('/', upload.single('csv'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv({ headers: true }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      fs.unlinkSync(req.file.path); // delete the file after reading it
      // res.send(results);
      res.render('index', { results: results});

    });
});



app.get('/read', (req, res) => {
  const results = [];

  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.send(results);
    });
});


const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0'); // add leading zero if necessary
const day = String(date.getDate()).padStart(2, '0'); // add leading zero if necessary

const folderName = `${year}-${month}-${day}`;
fs.mkdir(folderName, function(err) {
  if (err) {
    console.error(err);
  } else {
    console.log(`Folder '${folderName}' created successfully`);
  }
});



const data = [
    ['Name', 'Age', 'Gender'],
    ['John', '25', 'Male'],
    ['Jane', '30', 'Female'],
    ['Bob', '40', 'Male'],
  ];

  // app.get('/generate-pdf', (req, res) => {
  //   const doc = new PDFDocument();
  //   res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
  //   doc.pipe(res);
  
  //   doc.fontSize(16).text('Table Example', { align: 'center' });
  //   doc.moveDown();
  
  //   doc.table(data, {
  //     headers: true,
  //     columnWidths: [150, 50, 50],
  //     // add more options as needed
  //   });
  
  //   doc.end();
  // });


  // app.get('/download-pdf', (req, res) => {
  //   const templatePath = path.join(__dirname, 'views', 'sample.hbs');
  //   const template = fs.readFileSync(templatePath, 'utf-8');
  //   const compiledTemplate = handlebars.compile(template);
  
  //   const data = {
  //     name: 'John',
  //     age: 25,
  //     hobbies: ['Reading', 'Gardening', 'Traveling'],
  //   };
  
  //   const doc = new PDFDocument();
  //   const filename = 'sample.pdf';
  
  //   res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  //   res.setHeader('Content-type', 'application/pdf');
  
  //   doc.text('Template Example');
  //   doc.moveDown();
  
  //   const html = compiledTemplate(data);
  //   const text = convert(html, {
  //     wordwrap: 130
  //   });
  //   doc.text(text);
  
  //   doc.pipe(res);
  //   doc.end();
  // });


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


function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get('/demo', (req, res) => {

  const randomString = generateRandomString(10);
  console.log(randomString); // Output: "pJn7VwNvRz"  

  // start pdf document
  let doc = new PDFDocument({ margin: 30, size: 'A4' });
  // to save on server
  doc.pipe(fs.createWriteStream(`./${folderName}/${randomString}.pdf`));

    // A4 595.28 x 841.89 (portrait) (about width sizes)
  const table = {
    headers: [
      { label:"Name", property: 'name', width: 60, renderer: null },
      { label:"Description", property: 'description', width: 150, renderer: null }, 
      { label:"Price 1", property: 'price1', width: 100, renderer: null, backgroundColor: 'white', backgroundOpacity: 0 }, 
      { label:"Price 2", property: 'price2', width: 100, renderer: null, background: {color: 'white', opacity: 0} }, 
      { label:"Price 3", property: 'price3', width: 80, renderer: null }, 
      { label:"Price 4", property: 'price4', width: 63, renderer: (value, indexColumn, indexRow, row) => { return `U$ ${Number(value).toFixed(2)}` } },
    ],
    datas: [
      //   { name: 'bold:Name 2', description: 'bold:Lorem ipsum dolor.', price1: 'bold:$1', price3: '$3', price2: '$2', price4: '4', options: { fontSize: 10, separation: true } },
      { description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ante in laoreet egestas. ', price1: '$1', price3: '$ 3', price2: '$2', price4: '4', name: 'Name 1'},
      
    ],
    rows: [
      [
        "Apple",
        "Nullam ut facilisis mi. Nunc dignissim ex ac vulputate facilisis.",
        "$ 105,99",
        "$ 105,99",
        "$ 105,99",
        "105.99",
      ],
      [
        "Tire",
        "Donec ac tincidunt nisi, sit amet tincidunt mauris. Fusce venenatis tristique quam, nec rhoncus eros volutpat nec. Donec fringilla ut lorem vitae maximus. Morbi ex erat, luctus eu nulla sit amet, facilisis porttitor mi.",
        "$ 105,99",
        "$ 105,99",
        "$ 105,99",
        "105.99",
      ],
    ],
    options: {
      title:"Name Laravel Dev",
      columnsSize: [50, 50, 100]
    }
  };

  doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      if( typeof row === 'object' && Array.isArray(row) === false ){
        if(row.name === 'Name 3'){
          // doc.fillColor('red');
          // doc.font("Helvetica").fontSize(8);
          // indexColumn === 0 && doc.addBackground(rectRow,'green',0.3);
          //return;
        } else {
          // indexColumn === 0 && doc.addBackground(rectRow,'grey',0.3);
        }
      }
      // doc.fillColor('black');
      doc.font("Helvetica").fontSize(8);
    },
  });

  // done
  doc.end();

  res.end(`pdf file created with name ${randomString}`)
} )

app.get('/d', (req, res) => {
  res.render('index', { title: 'Home Page', message: 'Welcome to my website!' });
});


app.get('/', (req, res) => {
  res.render('index');
});



app.post('/url', function(req, res) {
  // Extract data from request body
  const url = req.body.url;
  const id = req.body.id;
  
  // Do something with the data
  console.log('url: ' + url);
  console.log('id: ' + id);
  
  
  var md = fetchUrl(url)
  .then( (response)=>{
    console.log('ddddd '+ response);
    res.send({id: id, title: response.title});

  })
  .catch((err) => {
    console.log(err);
  });
  

});


async function fetchUrl(url){

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const folderName = `${year}-${month}-${day}`;
  
  
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
    console.log(`Created folder: ${folderName}`);
  } else {
    console.log(`Folder ${folderName} already exists.`);
  }

  const respon = await axios.get(url)
  const $ = cheerio.load(respon.data);
  // Use Cheerio to extract data from the HTML
  var title = $('h1.entry-title').text();

  title.replace(/[^a-zA-Z0-9]/g, '');

  const slug = slugify(title, {
    lower:true,
    strict:true
  });


  const body = $('.single-body').text();
        
  const quote = $('.quote').text();
  
  const imgUrl = 'https://codelist.cc'+$('.single-body img').attr('src');
  
  let body_data = body.replace(quote, "");
  let description = body_data.replace(/&/g, '');
        
  description = description.replace(/'/g, ''); 
  description = description.replace(/&/g, 'and');  

  // description.replace('&amp;','')
  // title.replace('&amp;','')
  
  const urls = quote.split('https');
  
  // Remove the empty string at the beginning of the array
  urls.shift();
  
  // Add the "https" prefix back to each URL
  for (let i = 0; i < urls.length; i++) {
    urls[i] = 'https' + urls[i];
  }
  
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString();
  const fileName = `${slug}.md`; // replace with your file name

    // Render the view with the constants data
    const template = Handlebars.compile(fs.readFileSync('views/samplemd.hbs', 'utf8'));

    const markdown = template({
      title: title,
      formattedDate: formattedDate,
      slug: slug,
      imgUrl: imgUrl,
      description: description,
      urls: urls,
  });
  
    // Write the Markdown file
    fs.writeFileSync(`${folderName}/${fileName}`, markdown);
    const readfile = `${folderName}/${fileName}`;
  
    const getmdfile_content = fs.readFileSync(readfile, 'utf-8');

    var data = {
       readfile: readfile,
       title: title,
    }
        
    return data;
    

}


  app.post('/all', upload.single('file'), (req, res) => {


  console.log(req.file);
  // Get the path of the uploaded file
  const filePath = req.file.csvfile;

  const results = [];
  fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (data) => {
    results.push(data);
  })
  .on('end', ()=> {
    res.send(results);
  } )

});



app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

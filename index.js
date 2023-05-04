const express = require('express');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const handlebars = require('hbs');
const bodyParser = require('body-parser')
const PDFDocument = require("pdfkit-table");
const multer = require('multer');
const Handlebars = require('handlebars');
const pdf = require('html-pdf');
const ejs = require('ejs');


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


function createSlug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
           .replace(/\s+/g, '-') // collapse whitespace and replace by -
           .replace(/-+/g, '-'); // collapse dashes

  return str;
}



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
    // .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      fs.unlinkSync(req.file.path); // delete the file after reading it
      results.forEach((row, index) => {
        if(index > 0){
          console.log(row._0);

          // const data = {
          //   title: 'My Page Title',
          //   heading: 'Welcome to my page!',
          //   content: 'This is the content of my page'
          // };
        
        
          // res.render('template', data, function(err, html) {
          //   if (err) {
          //     console.error(err);
          //     res.status(500).send('Error rendering view');
          //   } else {
          //     res.send(html);
          //     // console.log(html)
          //   }
          // });



        }
      });

      const resultsJSON = JSON.stringify(results);

      res.render('index', { results: resultsJSON});

    });
});


async function createPdf(data) { 
  console.log(data)
}

app.post('/url', function(req, res) {
  // Extract data from request body
  // const data = req.body.data;
  // const id = req.body.id;

  // const html = res.render('slip', data);

  const data = {
    title: 'My Page Title',
    heading: 'Welcome to my page!',
    content: 'This is the content of my page'
  };


  res.render('template', data, function(err, html) {
    if (err) {
      console.error(err);
      res.status(500).send('Error rendering view');
    } else {
      res.send(html);
      // console.log(html)
    }
  });


  
  


  // Create a file with the rendered HTML
  // const filePath = path.join(__dirname, 'slip.html');
  // fs.writeFile(filePath, html, (err) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     console.log('File created successfully');
  //   }
  // });
  res.send({  html: 'jjjj data send'  })
  // const html = fs.readFileSync('views/slip2.hbs', 'utf8');
  // const options = {
  //     format: 'Letter',
  //     border: {
  //       top: '1px',
  //       right: '1px',
  //       bottom: '1px',
  //       left: '1px'
  //     },
  //     footer: {
  //       height: '15mm',
        
  //     }
  //   };

  // pdf.create(html, options).toFile('name.pdf', (err, res) => {
  //   if (err) return console.log(err);
  //   console.log(res); // { filename: '/app/businesscard.pdf' }
  // });
  
  // Do something with the data
  console.log('data: ' + data);
  // console.log('id: ' + id);
  // var md = fetchUrl(url)
  // .then( (response)=>{
  //   console.log('ddddd '+ response);
  //   res.send({id: id, title: response.title});

  // })
  // .catch((err) => {
  //   console.log(err);
  // });
});

app.post('/create-html', function(req, res) {
  // Render the Handlebars template with the data
  const dd = req.body.data;
  const id = req.body.id;
  const headers = req.body.headers;
  const data =  {
    data: dd,
    headers: headers,
  };


  
  console.log(data._0)
  // res.send(data);
  
  const template = fs.readFileSync('template.ejs', 'utf-8');
  
  const html = ejs.render(template, data);
  
  // res.send(html)
  
  var EmployeName = dd._0
  EmployeName = createSlug(EmployeName)
  var pdfFileName = `${folderName}/${EmployeName}.pdf`

  const filePath = 'render.html';
fs.writeFile(filePath, html, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`File "${filePath}" written successfully`);
  }
});

// const html = fs.readFileSync('views/slip2.hbs', 'utf8');
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

pdf.create(html, options).toFile(pdfFileName, (err, res) => {
  if (err) return console.log(err);
  console.log(res); // { filename: '/app/businesscard.pdf' }
});

res.send({
  'pdfFileName' : pdfFileName,
  'id' : id,
})

});

app.get('/generate', (req, res) => {
  
  const data = {
    title: 'My Page Title',
    heading: 'Welcome to my page!',
    content: 'This is the content of my page'
  };

  // // Render the Handlebars view with the data
  // const html = res.render('template', data);

  // // Write the rendered HTML to a file
  // const filePath = path.join(__dirname, 'data.html');
  // fs.writeFile(filePath, html, (err) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     console.log('File created successfully');
  //   }
  // });
  res.render('template', data, function(err, html) {
    if (err) {
      console.error(err);
      res.status(500).send('Error rendering view');
    } else {
      // res.send(html);
      console.log(html)
    }
  });

// const template = '<h1>Hello, {{name}}!</h1>';

// // Render the Handlebars template with some data
// const data = { name: 'World' };
// const html = handlebars.compile(template)(data);


// // Write the rendered HTML to a file
// const filePath = 'zzz.html';
// fs.writeFile(filePath, html, (err) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(`File "${filePath}" written successfully`);
//   }
// });


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

app.get('/output', (req, res) => {
  res.render('sample');
});






app.get('/slip', (req, res) => {
  res.render('slip');
} )
app.get('/slip2', (req, res) => {
  res.render('slip2');
} )


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

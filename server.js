const port = 3000;
const logFile = __dirname + "/logs/server.log";

const express = require("express");
const hbs = require("hbs");
const fs = require("fs");

var app = express();

// partials: percorso di frammenti handlebars che possono essere usati su più pagine
hbs.registerPartials(__dirname + "/views/partials");

// helpers: funzioni di utilità che possono essere usate nelle view
hbs.registerHelper("getCurrentYear", () => {
  return new Date().getFullYear();
});

hbs.registerHelper("screamIt", (text) => {
  return text.toUpperCase();
});

// handlebars come motore per il rendering delle view
app.set("view engine", "hbs");


// registriamo un middleware
app.use((req, res, next) => {
  // qui possiamo inserire db calls, validazioni etc...
  var now = new Date().toString();
  var logStr = `${now}: ${req.method} ${req.url}`;

  // scrittura log delle richieste
  fs.appendFile(logFile, logStr + "\n", (err) => {
    if (err) {
      console.log("Unable to append to /logs/server.log", err);
    }
  });

  console.log(logStr);

  // il next() permette di specificare ad express quando queste operazioni sono terminate
  // fondamentale per proseguire con le successive istruzioni!
  next();
});

// middleware per il maintenance mode
app.use((req, res, next) => {
  res.render("maintenance");
  // no next! vogliamo che se il sito è in manutenzione, non si prosegua oltre!
});

// specifica di servire come contenuto statico tutto ciò che è nella cartella /public
// si include in genere dopo gli handlers "generici" (es. manutenzione, logging) in modo che se uno di questi
// non ha il next(), non sia possibile accedere nemmeno al contenuto statico definito da questo handler
app.use(express.static(__dirname + "/public"));

// registriamo gli handlers per le richieste http (verbi)

// primo argument: percorso di routing;
// secondo: funzione da eseguire quando viene effettuata una get
app.get("/json", (req, res) => {
  //res.send("<h1>Hello Express</h1>");

  res.send({
    name: "test",
    array: ['Bike', 'Run', 'Swim'],
    money: 250.00
  })
});

// invio di html statico
app.get("/help",(req, res) => {
  res.send("<h1>About Page</h1>");
});

// static template rendering di un handlebars template (default: si trova nella cartella /views ed ha estensione .hbs)
// per passare parametri: secondo argomento di render()
app.get("/about",(req, res) => {
  res.render("about", {
    pageTitle: "About Page"
  });
});

app.get("/home",(req, res) => {
  res.render("home", {
    pageTitle: "Home Page",
    welcomeMessage: "Welcome to this node/handlebars website."
  });
});

// esempio per pagina di errore
app.get("/bad", (req, res) => {
  res.send({
    message: "Something went wrong",
    detail: "Error in calling /bad"
  });
});

// binding dell'applicazione su una porta
app.listen(port, () => {
  console.log(`Server up on port ${port}`)
});
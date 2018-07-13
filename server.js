//Dependencies 
var express = require("express");
var mongojs = require("mongojs");
// var request = require("request");
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scrape";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
    res.send("Hello world");
  });

// Retrieve data from the db
app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
      }
    });
  });

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
    // Make a request for the news section of `ycombinator`
    axios.get("https://www.nytimes.com/").then(function(response) {
      // Load the html body from request into cheerio
      var $ = cheerio.load(response.data);
      // For each element with a "title" class
      $("div.first-column-region region").each(function(i, element) {
        var result = {}; 
        // Save the text and href of each link enclosed in the current element
        result.title = $(this).find("h2").text(); 
        result.link = $(this).find("a").attr("href"); 
  
       db.Article.create(result)
       .then(function(dbArticle) {
           console.log(dbArticle); 
       })
       .catch(function(err){
           return res.json(err); 
       })
        
      });
    });
  
    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
  });


// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
  });
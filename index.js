// 

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";


const app = express();
const port = 3000;


const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();
  



// middle wares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


let currentBookId = 1;




// Reading "readed books" table in books database and returning the result as a form of array ! 
async function checkBooks() {

  let books = []; //creating the empty array 
  const result = await db.query( "SELECT * FROM readed_books "); //reading the table 
  result.rows.forEach((book) => {books.push(book);}); //looping throgh the array we get
  // console.log(books);
  return books;
};





// Reading "readed books" table in books database and returning the result as a form of array ! 
async function checkCuurentBook() {
 const result = await db.query( "SELECT * FROM readed_books WHERE id =$1 ;",[currentBookId]);
 const book =  result.rows[0]; 
 return book;
};










// Route to render the main page
app.get("/", async (req, res) => {
  const books = await checkBooks(); 
  res.render("index.ejs", {books: books});


});

// j 




//the route that will render the form to add a new book 
// and check at the same time if its for editing an avai9lable post 
app.get("/new/:id", async (req, res) => {


  // if the user wants to create a new book
  if (req.params.id==='book'){
    res.render("new.ejs" , {id: 1});
  };


  // if the user wants to add a new note
  if (req.params.id==='note'){
    res.render("new.ejs", {bookid: currentBookId});
  }
  

  



});



// if the user wants to edit a book details , we render the new.ejs page along with nthe book details
app.get("/edit/:id", async (req, res) => {


 
   
   currentBookId=req.params.id;
   const book = await checkCuurentBook();
  //  console.log(book);
   res.render("new.ejs", {books: book});
  



});







// the route that will insert the new data to the databse after filling the form rendered above 
app.post("/add", async (req, res) => {

  const title = req.body["title"];
  const code = req.body["code"];
  const rdate = req.body["rdate"];
  const rating = req.body["rating"];
  const des = req.body["des"];
 
   
  
      await db.query(
        "INSERT INTO readed_books (title,code,rdate,rating,des) VALUES ($1,$2,$3,$4,$5)",
         [title,
          code,
          rdate,
          rating,
          des
        ] );
      res.redirect("/");
 
    

});







// the route that will insert the new data to the databse editing it in the edit form! 
app.post("/edit", async (req, res) => {

  
  const title = req.body["title"];
  const code = req.body["code"];
  const rdate = req.body["rdate"];
  const rating = req.body["rating"];
  const des = req.body["des"];

   await db.query(
      "UPDATE readed_books SET (title,code,rdate,rating,des) = ($1,$2,$3,$4,$5) WHERE id =$6 ;",
       [title,
        code,
        rdate,
        rating,
        des,
        currentBookId]);
  res.redirect("/");
}

);





// the route that will display the book details along with the notes !
app.get("/details/:id", async (req, res) => {

  
  currentBookId = req.params.id;
  const book = await checkCuurentBook();
  const result2 = await db.query(
  //// reading the users table in book database ,  and getting the joined table for only the current book id along with all the notes and data
  "SELECT * FROM book_notes JOIN readed_books ON readed_books.id=book_id WHERE book_id =$1 ;",[currentBookId]); 

  let notes = []; //creating an empty array
  // loop through the array , extract the value in each item aand push it to the notes array 
  result2.rows.forEach((note) => {notes.push(note.note);});

  console.log(notes);
  console.log(book);
  res.render("details.ejs",{notes:notes,book:book});
}

);





// the route that will insert the new data related to each book note in the books_note table
app.post("/addnote/:id", async (req, res) => {

  
  const id = currentBookId;
  const note = req.body["note"];

   await db.query("INSERT INTO book_notes (note,book_id) VALUES ($1,$2)", [note,id]);
  res.redirect("/details/"+id);
}

);








// the route that will delete the book according to the id ! 
app.get("/delete/:id", async (req, res) => {

  
  const id = req.params.id;
  
 
  const result2 = await db.query(
   "DELETE  FROM book_notes  WHERE book_id= $1;",[id])
    

    const result = await db.query(
      "DELETE  FROM readed_books  WHERE id= $1;",[id])


  res.redirect("/");
}

);






// listening on the local port 3000
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});









// 

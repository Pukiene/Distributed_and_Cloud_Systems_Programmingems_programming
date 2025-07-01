// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";


// Add SDKs for Firebase products that you want to use
import { Firestore, //database
		 getFirestore, 
		 onSnapshot, //real-time updates 
		 query, //Constructs a query to filter Firestore data.
		 collection, // Retrieves
		 orderBy,//Orders documents 
     deleteDoc,// delet 
     updateDoc, // updatate
     doc,//id
		 addDoc, 
    Timestamp,
  } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js'
// Your web app's Firebase configuration

//------------
//mano prisijungimas prie firebase
//------------

  const firebaseConfig = {
//irasyt google detales
  };



// Initialize Firebase
const app = initializeApp(firebaseConfig);//This initializes the Firebase app - firebaseConfig object, which contains Firebase API keys and project details.	
const db = getFirestore(app);	

// Get a live data snapshot (i.e. auto-refresh) of our Reviews collection
const q = query(collection(db, "Reviews"), orderBy("movie_name"));//query -Constructs  orderBy- in alphabetical order 
const unsubscribe = onSnapshot(q, (snapshot) => {//onSnapshot= real-time updates 
//------------
//Empty HTML table
//------------
  
  $('#reviewList').empty();
	$("#reviewHead").html(`
    <tr>
      <!--<th>ID</th>-->
    <th data-sort="text" style="cursor:pointer;">Director Name <span class="sort-icon"></span></th> 
      <th data-sort="text" data-order="asc" style="cursor:pointer;">Movie Name <span class="sort-icon">▲</span></th>
      <th data-sort="number" style="cursor:pointer;">Rating ⭐ <span class="sort-icon"></span></th>
      <th data-sort="date" style="cursor:pointer;">Release Date <span class="sort-icon"></span></th>
      <th>Action</th>
    </tr>


  `);
//------------
//buttons (Edit/Delete)
//------------
  
  
  // Loop through snapshot data and add to HTML table
  var tableRows = '';
  snapshot.forEach((doc) => {//Loops through each document
  const docid = doc.id;//Firestore document ID
  const data = doc.data();

  let releaseDate = data.release_date && data.release_date.toDate 
  ? data.release_date.toDate().toLocaleDateString() 
  : "N/A"; // kad ismestu N/a jai neisiraso teisingai i serveri

  tableRows += ` 
  <tr data-id="${doc.id}"> <!-- Use document ID to tag the row -->
    <!--<td>${docid}</td>-->
    <td contenteditable="false" class="edit-director">${doc.data().director_name}</td>
    <td contenteditable="false" class="edit-movie">${doc.data().movie_name}</td>
    <td contenteditable="false" class="edit-rating">${doc.data().rating_score}</td>
    <td contenteditable="false" class="edit-release" >${releaseDate}</td>
    <td>
      <button class="edit-btn btn btn-primary" data-id="${docid}">Edit</button>
      <button class="delete-btn btn btn-danger" data-id="${docid}">Delete</button>
    </td>
  </tr>
`;	  
  });

 

  $('#reviewList').append(tableRows);//reviewList- Avoid duplicate rows
	
  // Display review count
  $('#mainTitle').html(snapshot.size + " Movie reviews 🎬");// titile + skaicuoja kiek filmu reviu yra
});	
//------------
//sorting 
//------------
$('#reviewHead').on('click', 'th[data-sort]', function() {
  const sortType = $(this).data('sort'); // "text", "number", or "date"
  const columnIndex = $(this).index(); //which column number it is
  const isNumeric = sortType === 'number';//used later for sorting
  const isDate = sortType === 'date';// are is by date

  // Clear sort icons on all headers except the clicked one.
  $('#reviewHead th[data-sort]').not(this).data('order', '').find('.sort-icon').text('');

  // Get the current order stored on this header, defaulting to ascending.
  let order = $(this).data('order') || 'asc';
  // Toggle order: if ascending, change to descending, and vice versa.
  let newOrder = order === 'asc' ? 'desc' : 'asc';
  $(this).data('order', newOrder);

  //  icon for the clicked header.
  let icon = newOrder === 'asc' ? '▲' : '▼';
  $(this).find('.sort-icon').text(' ' + icon);
//pagal ka sortina lentele
  sortTable(columnIndex, isNumeric, isDate, newOrder);
});

// Client-side sorting function with order toggle.
function sortTable(columnIndex, isNumeric, isDate, order) {//get all rows for table
  const rows = $('#reviewList tr').get();

  rows.sort(function(a, b) {//sort by abc
    let A = $(a).children('td').eq(columnIndex).text().trim();
    let B = $(b).children('td').eq(columnIndex).text().trim();

    if (isDate) {
      // Convert dates from "dd/mm/yyyy" to a timestamp; treat "N/A" as 0.
      A = A === "N/A" ? 0 : new Date(A.split('/').reverse().join('-')).getTime();
      B = B === "N/A" ? 0 : new Date(B.split('/').reverse().join('-')).getTime();
    } else if (isNumeric) {
      A = parseFloat(A) || 0;//numeric, parse it as float (treat invalid as 0)
      B = parseFloat(B) || 0;
    } else {
      // For text, compare in lower-case.
      A = A.toLowerCase();// need to sort correct
      B = B.toLowerCase();// nes vertitu venodai didziases raides db "Avengers" and "avengers" yra lygu
    }
    if (A < B) return -1;//comare val + determine sort order
    if (A > B) return 1;
    return 0;// if =
  });

  if (order === "desc") {
    rows.reverse();// Changes ascending order to descending
  }
  
  // Re-append sorted rows
  $.each(rows, function(index, row) {
    $('#reviewList').append(row);// move bac rove in tab
  });
}
$("#addButton").click(function () {// clicked add button function start run
  // Get values from input fields
  const director = $("#director_name").val().trim();
  const movie = $("#movie_name").val().trim();
  const rating = parseInt($("#rating_score").val(), 10);
  const releaseDateInput = $("#release_date").val();

  // Check if the date is valid and convert it to a Firestore Timestamp
  let releaseTimestamp = null;// by default = timestamp 
  if (releaseDateInput) {
    const releaseDateObj = new Date(releaseDateInput);// Convert string to Date object
    releaseTimestamp = Timestamp.fromDate(releaseDateObj);// Convert Date to Firestore Timestamp
  }

//------------
//Add review to Firestore collection
//------------
  
  
  addDoc(collection(db, "Reviews"), {
    director_name: director,
    movie_name: movie,
    rating_score: rating,
    release_date: releaseTimestamp,
  }).then(() => {
    // Clear the form inputs after successful submission Clear  input field
    $("#director_name").val('');
    $("#movie_name").val('');
    $("#rating_score").val('1');
    $("#release_date").val('');
  }).catch((error) => {// error mesage
    console.error("Error adding document: ", error);
  });
});

//------------
//delete lista
//------------
  
// Event listener for delete button clicks 
$(document).on("click", ".delete-btn", function() {//(document).on- ale konteineris 
  let docid = $(this).attr("data-id");// randa id kuri turi buti istrintas

  if (confirm("Are you sure you want to delete this review?")) {//popap ar tikrai nori istrint
    deleteDoc(doc(db, "Reviews", docid))//istrina faila
      .then(() => {// po istrinimo
        $('tr[data-id="' + docid + '"]').remove(); // Remove row from table   
      })// remove from table
  }
});

 //------------
// edit
//------------
 $(document).on("click", ".edit-btn", function() {// paspausti ant to ka nori pakeisti
   let row = $(this).closest("tr");// tr- table row
   let docid = $(this).attr("data-id");//reed id

   let isEditing = row.attr("data-editing") === "true";//Checks if the row is currently in edit mode by reading its data-editing attribute.

   if (!isEditing) {
     // Enable editing -If it's not in edit mode, enable editing

     row.find("td[contenteditable]")//findenable cells
     .attr("contenteditable", "true")// made enable
     .addClass("table-warning");
     $(this).text("Save") // Change button text to "Save"
     .removeClass("btn-primary")// change button coulor
     .addClass("btn-success");// Indicate save mode
     row.attr("data-editing", "true");//pazimi eilue, pakeicia miktuka is edit i save 
   } else {
    

  // ----------------------
  //  save edit changes
  // ----------------------
    const releaseDateInputE = row.find(".edit-release").text().trim();
    //console.error("aaa: ", releaseDateInputE);
    let releaseTimestampE = null;
    if (releaseDateInputE) {  // If a date was entered, convert it to Firestore Timestamp
      const [day, month, year] = releaseDateInputE.split('/');
      // Rearrange to mm/dd/yyyy format.
      const formattedDate = `${month}/${day}/${year}`;
      const releaseDateObj = new Date(formattedDate);
      releaseTimestampE = Timestamp.fromDate(releaseDateObj);
    }
    // Get and validate the edited rating
    let ratingVal = parseInt(row.find(".edit-rating").text().trim(), 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      alert("Rating must be a number between 1 and 5.");//error mesage
      return; // Don't proceed with update
    }

    //------------
    // Save changes to Firestore
    //------------
     
     let updatedData = {//issaugo pakeitimus
       director_name: row.find(".edit-director").text().trim(),
       movie_name: row.find(".edit-movie").text().trim(),
       rating_score: parseInt(row.find(".edit-rating").text().trim(), 10),

       //release_date: new Date(row.find(".edit-release").text().trim())//cia!!!!!!!!!!!!
       release_date: releaseTimestampE
 };// .trim() to remove any unnecessary spaces.

     let docRef = doc(db, "Reviews", docid);// reference in Firestore
     updateDoc(docRef, updatedData).then(() => {//update the Firestore database.


       row.find("td[contenteditable]")// Get all editable cells
       .attr("contenteditable", "false")
       .removeClass("table-warning");// Disables editing (contenteditable="false")
       $(this).text("Edit")
       .removeClass("btn-success")// Remove warning color
       .addClass("btn-primary");//change text on the button back in to edit
       row.attr("data-editing", "false");// Mark the row as not editing anymore
     }).catch((error) => {
       console.error("Error updating document: ", error);//error messege
     });
 }
 });

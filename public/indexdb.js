// // database  
// let db;

// // create a new db request for a "budget" database.
// const request = indexedDB.open('budget', 1);

// // create object store (aka the table) called "pending" and set autoIncrement to true. This calls whenever we run a new version. 
// request.onupgradeneeded = function (event) {
//   const db = event.target.result;
//   const budgetStore = db.createObjectStore('budget', { autoIncrement: true }); 
//   budgetStore.createIndex('pendingIndex', 'pending'); // allows our database to quickly look up the data. goes to the table and creates a name and keypath 
// };

// // called each time you make a new request, even if the database schemas have not changed
// request.onsuccess = function (event) {
//   db = event.target.result;
//   if (navigator.onLine) {
//     checkDatabase();
//   }
// };

//  // calls and logs any errors 
// request.onerror = function (event) {
//   console.log('There has been an error with retrieving your data: ' + request.error);
// };

// // saves the new record 
// function saveRecord(record) {
//   // create a transaction on the pending db with readwrite access
//   const transaction = db.transaction(['budget'], 'readwrite');
//   // access your pending object store
//   const budgetStore = transaction.objectStore('budget');
//   // add record to your store with add method.
//   budgetStore.add(record);
// }

// // open a transaction on your pending db
// function checkDatabase() {
//   const transaction = db.transaction(['budget'], 'readwrite');
//   const budgetStore = transaction.objectStore('budget');
//   const getRequest = budgetStore.getAll();

//   getRequest.onsuccess = function () {
//     if (getRequest.result.length > 0) {
//       fetch('/api/transaction/bulk', {
//         method: 'POST',
//         body: JSON.stringify(getRequest.result),
//         headers: {
//           Accept: 'application/json, text/plain, */*',
//           'Content-Type': 'application/json'
//         }
//       })
//         .then(response => response.json())
//         .then(() => {
//           // if successful, open a transaction on your pending db
//           const transaction = db.transaction(['budget'], 'readwrite');
//           // access your pending object store
//           const budgetStore = transaction.objectStore('budget');
//           // clear all items in your store
//           budgetStore.clear();
//         });
//     }
//   };
// }

// // listen for app coming back online
// window.addEventListener('online', checkDatabase);

let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
   // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // access your pending object store
  const store = transaction.objectStore("pending");

  // add record to your store with add method.
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // if successful, open a transaction on your pending db
        const transaction = db.transaction(["pending"], "readwrite");

        // access your pending object store
        const store = transaction.objectStore("pending");

        // clear all items in your store
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);

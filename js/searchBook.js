const storageName = 'booksCategories';
const localStorageErroMsg = 'Local storage is not enabled  or you are passing undefined data';
let loadCategoriesRecords = true;
let currentVal = 0; //<- We use it to control the scroll init

function searchBook(form) {
    let recordsQuantity = 12;
    if(form.serchInput.value != ''){
        console.log('this form is: ', form.serchInput.value);
        this.searching( form.serchInput.value, recordsQuantity );
    }else{
        alert('No empty valu is allowed');
    }
}
function searchBookByEnter(event, form) {
    if(event.key === 'Enter' && form.serchInput.value != '') {
        this.searchBook(form);    
    }
}

function createBookItem(htmlElement) {
    let frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlElement;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

function addBookCard( title, author, description, thumbnail, urlBook) {
    // Here we are reusing this function to load dummy data and info comming from the service
    if ( title === undefined && author === undefined && description === undefined && thumbnail == undefined ) {
        title = '....................';
        author = '________________';
        description = '---------------------------------------------------------------------------------------------------';
        thumbnail = '';
        urlBook = "#";
        cover = `<div class="bookCover"></div>`;
    } else {
        cover = `<a href="${urlBook}" target="_blank" rel="noopener noreferrer" class="bookCover" style="background: url(${thumbnail}) no-repeat top center / cover;"> </a>`;
    }
    // Here we are creating the card book item in the search result section
    let cardElement =  createBookItem(`
    <div class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
        <div class="bookItem">
            ${cover}
            <div class="bookDesc">
                <h3>${title}</h3>
                <p>by ${author}</p>
                <p>${description}</p>
            </div>
        </div>
    </div>
    `);
    //We specify which element is the anchor to attach the search result
    let itemReference = document.getElementById("searchBookResult");
    itemReference.appendChild(cardElement);
}

async function searching(query, numOfRecords, categoryName = '') {
    const urlPath = 'https://www.googleapis.com/books/v1/volumes';
    const searchBookPath = urlPath +'?q='+ query + '&maxResults=' + numOfRecords;
    const searchCategoryPath =  urlPath +'?q=subject:'+ categoryName + '&maxResults=' + numOfRecords;
    let request = new XMLHttpRequest();
    let setCategoriesOnce = true;
    let searchItemPath;
    //Empty query is a special flag to find by category instead book
    ( query !== '' ) ? searchItemPath = searchBookPath : searchItemPath = searchCategoryPath;
    request.open('GET', searchItemPath , true);
    request.onload = function () {
        let data = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
                // console.log('Data is:',data);
                // If the callback is correct we are cleaning the dummy data then populate with real records
                if ( query !== '' ){
                     cleanCards();
                } else if( loadCategoriesRecords ){
                    cleanCards();
                    loadCategoriesRecords = false;
                }
                data.items.map(x => {
                    let author = (x.volumeInfo.authors != undefined)? x.volumeInfo.authors.join(' & ') : 'Author pending...';
                    let description = (x.volumeInfo.description != undefined ) ? x.volumeInfo.description : 'Description is pending...' ;
                    let thumbnail = (x.volumeInfo.imageLinks != undefined ) ? x.volumeInfo.imageLinks.smallThumbnail : './img/cover-pending-min.jpg' ;
                    let infoLink = (x.volumeInfo.infoLink != undefined ) ? x.volumeInfo.infoLink : '#' ;
                    addBookCard( x.volumeInfo.title, author,  description, thumbnail, infoLink );
                    // Here we are take the first categories if exists otherwise we'll take it for the next element
                    if (x.volumeInfo.categories != undefined && setCategoriesOnce === true) {
                        setCategory( x.volumeInfo.categories );
                        setCategoriesOnce = false;
                    }
                });
        } else {
            alert('Service is not responding...');
          }
    }
    // Here we are searching but first we are populate it with dummy data
    loadDummyCards(numOfRecords);
    // As a requirement to see the dummy data we are waiting for 3 second before display the information.
    await setTimeout( function (){
        request.send();
    } , 3000); //<- As improvement we can remove the setTimeOut
}

function loadDummyCards(number) {
    cleanCards();
    for (let i = 0; i < number; i++) {
        addBookCard();
    }
}

function cleanCards() {
    let itemReference = document.getElementById("searchBookResult");
    // Cleaning all child elements from search result section
        itemReference.innerHTML = '';   
}

function setCategory( categoriesArray ) { 
    // let storageName = 'booksCategories';
    const maxCategories = 5;
    // We validate if browser support localStorage
    if ( localStorageExists() && categoriesArray != undefined) {
        let categories = JSON.parse( localStorage.getItem( storageName ) );
        if ( categories === null ) { // <- Checking if new info exists
            // Because the local storage is empty we just push the new data
            localStorage.setItem( storageName ,  JSON.stringify( categoriesArray ) ) ;  
        } else {
            //Local storage info exist so we are mapping new info to push.
            categoriesArray.map(x => {
                categories.push( x ); // <- Here we are adding new info into existing info
            });
            // Here we are destructuring assignment the set is used to distinct duplicate records
            categories = [... new Set(categories.map(x => x))];
            // We evaluate if we have more than 5 elements
            if ( categories.length > maxCategories ) { 
                let extraItems = categories.length - maxCategories;
                for (let i = 0; i < extraItems; i++) {
                    categories.shift(); // <- We are removing old extra items    
                }
            }
            localStorage.setItem( storageName , JSON.stringify( categories ) );
        }
        // console.log('localStorage cats: ', categories);
    }else {
        console.log( `Error: ${localStorageErroMsg}` );
    }
}

function getCategory(){
    if( localStorageExists() ) {
        const categories = JSON.parse( localStorage.getItem( storageName ) );
        return categories;

    } else {
        console.log( `Error: ${localStorageErroMsg}` );
    }
}

function localStorageExists() {
   return (typeof(Storage) !== "undefined") ? true : false;
}

const init = () => {
    const categories = getCategory();
    categories.map(x => {
        searching('', 3, x);
    });
}

// Here just a simple listener to detect scroll actions
window.addEventListener('scroll', function(e){
    const nav = document.getElementById("mainNavbar");
    // Get the new Value
    newVal = window.pageYOffset;

    //Subtract the two and conclude
    if(currentVal - newVal < 0){
        if(newVal >= 250){
            //Make transparent..
            nav.style.cssText = 'background-color: black;';
        }
    } else if(currentVal - newVal > 0){
        if (newVal < 250){
            //Make opaque
            nav.style.cssText = '';
        }
    }

    // Update the old value
    currentVal = newVal;
});
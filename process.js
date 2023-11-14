// document.getElementById('upload').addEventListener('change', handleFileSelect, false);
let form = document.getElementById("form");
form.addEventListener("submit", (evt) => {
    evt.preventDefault();
  
    //Pass file input forwards
    handleFileSelect(evt.currentTarget[0]);
  });

let nameNumberDict = {};
let ordering = "No Ordering"

function orderingChanged()
{  
    var orderingOptions = document.getElementById("orderingOptions");
    let selectedOrdering = orderingOptions.options[orderingOptions.selectedIndex].text;

    ordering = selectedOrdering;
} 

function handleFileSelect(evt) 
{
    reset();

    let files = evt.files; // FileList object

    return handleFiles( files );
}

function handleFiles( files )
{
 // use the 1st file from the list
    // let f = files[0];
    if ( files == null || files.length <= 0 )
    {
        showMessage("ERROR: No files selected!");
        return document;
    }

    for (let index = 0; index < files.length; index++)
     {
        const file = files[index];

        if ( !validateFileType( file.name ) )
        {
            return document;
        }
        
        let reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
            
            let fileContents = e.target.result;
            processFileContents( fileContents );

            };
        })(file);

        // Read in the image file as a data URL.
        reader.readAsText(file);
        
    };
}

  function reset()
  {
    nameNumberDict = {};
    showOutput("");
    showMessage( "Choose decks to combine" );
  }

  function validateFileType( filePath )
  {
    let extension = filePath.split('.').pop();
    if ( extension != "txt" )
    {
        showMessage( "ERROR: submitted file should be a .txt file" );
        return false;
    }

    return true;
  }

  function showMessage( message )
  {
    console.log( message );
    document.getElementById( "messageOutput" ).innerHTML = message;
  }

  function processFileContents( content )
  {
    // console.log( "Input", content );
    let lines = getFileAsLines( content );
    // console.log(lines);

    processLines( lines );

    let cardsArray = collectionToSortedArray( nameNumberDict );
    sortedArrayToOutput( cardsArray );
    // showOutput( content );
  }
  
  function getFileAsLines( content )
  {
    const splitLines = str => str.split(/\r?\n/);
    return splitLines(content);
  }

  function processLines( lines )
  {
    for (let index = 0; index < lines.length; index++) {
        const cardString = lines[index];
        let split = cardString.split(" ");
        let number = split[0];
        let name = cardString.substring(number.length);

        // console.log( number );
        // console.log( name );

        if ( nameNumberDict[name] == undefined )
        {
            nameNumberDict[name] = 0;
        }

        nameNumberDict[name] += Number( number );
    }

    // console.log( nameNumberDict );
  }


  function collectionToSortedArray( collection )
  {
    let array = [];
    for (const cardDetail in collection) {
        array.push( [cardDetail, collection[cardDetail]] );
    }

    switch (ordering) {
        case "Alphabetical":
            array.sort(function(a, b) {
                return a[0].localeCompare(b[0]);
            });
            break;
        case "Duplicates":
            array.sort(function(a, b) {
                return b[1] - a[1];
            });
            break;
        case "Duplicates Alphabetical":
            array.sort(function(a, b) {
                return a[0].localeCompare(b[0]);
            });
            array.sort(function(a, b) {
                return b[1] - a[1];
            });
            break;
        default:
            break;
    }

    return array;
  }

  function sortedArrayToOutput( cardDetailArray )
  {
    let finalString = "";

    for (let index = 0; index < cardDetailArray.length; index++) 
    {
        const cardDetail = cardDetailArray[index];
        // console.log(`${cardDetail}: ${nameNumberDict[cardDetail]}`);

        let name = cardDetail[0];
        let number = cardDetail[1];

        let cardString = number + name;
        finalString += cardString + "\n";
    }

    showOutput( finalString );
    showMessage( "Decks combined." );
  }

  function showOutput( content )
  {
    // console.log( "Output", content );
    document.getElementById( "outputText" ).innerHTML = content;
  }
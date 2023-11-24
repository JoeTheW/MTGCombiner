// document.getElementById('upload').addEventListener('change', handleFileSelect, false);
let form = document.getElementById("form");
form.addEventListener("submit", (evt) => {
    evt.preventDefault();
  
    //Pass file input forwards
    handleFileSelect(evt.currentTarget[0]);
  });

  //TODO: Handle JSON
  //TODO: Handle different formats of txt

let nameNumberDict = {};
let ordering = "No Ordering"
let currentFile = -1;
let processedFiles = -1;
let totalFiles = -1;
let logToConsole = false;

function orderingChanged()
{  
    var orderingOptions = document.getElementById("orderingOptions");
    let selectedOrdering = orderingOptions.options[orderingOptions.selectedIndex].text;

    ordering = selectedOrdering;
} 

function handleFileSelect(evt) 
{
    reset();
    clearInformation();

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

    showMessage("Processing, please wait...");
    setGlobalCursor( "wait" );

    for (let index = 0; index < files.length; index++)
     {
        const file = files[index];

        if ( !validateFileType( file.name ) )
        {
            return document;
        }

        totalFiles ++;
        
        let reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {

            currentFile ++;
            showMessage(`Processing file ${currentFile} : ${theFile.name}`);
            addInformation(`Processing File ${currentFile} : ${theFile.name}`);
            
            let fileContents = e.target.result;
            processFileContents( fileContents );
            processedFiles ++;
            addInformationIndented(1,`File ${currentFile} processed`);

            let waitMessage = processedFiles < totalFiles ? " - please wait..." : ".";
            showMessage( `${processedFiles}/${totalFiles} decks combined${waitMessage}` );
            };
        })(file);

        // Read in the image file as a data URL.
        reader.readAsText(file);
        
    };
}

  function reset()
  {
    nameNumberDict = {};
    currentFile = 0;
    processedFiles = 0;
    totalFiles = 0;
    setGlobalCursor( "auto" );
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
    consoleLog( null, message );
    document.getElementById( "messageOutput" ).innerHTML = message;
  }

  function addInformationIndented( indent, message )
  {
    for (let index = 0; index < indent; index++) {
      message = "  " + message;
    }

    addInformation( message );
  }

  function addInformation( message )
  {
    message = message+"\n";
    document.getElementById( "information" ).innerHTML += message;
    document.getElementById( "log" ).hidden = false;
  }

  function clearInformation()
  {
    document.getElementById( "information" ).innerHTML = null;
    document.getElementById( "log" ).hidden = true;
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
    // showMessage("Processing, please wait...");
    setGlobalCursor( "wait" );

    for (let index = 0; index < lines.length; index++) {
        const cardString = lines[index];

        // console.log(`Processing file ${currentFile}, line ${index}`);
        // showMessage(`Processing file ${currentFile}, line ${index}`);

        //Validate line has content
        if ( cardString == null || cardString == "" || cardString.length < 0 )
        {
          let errorMessage = `Ignoring empty line: ${index}.`;
          // addInformationIndented(1, errorMessage);
          // consoleWarn(null, errorMessage);
          continue;
        }

        let split = cardString.split(" ");
        let number = split[0];
        let name = cardString.substring(number.length);

        //Validate number
        if ( number == null || number == "" || number.length < 0 || !isNumeric( number ) )
        {
          let errorMessage = `Ignoring line ${index} - Invalid card count: '${cardString}'`;
          addInformationIndented(1, errorMessage);
          consoleWarn(null, errorMessage);
          continue;
        }

        //Validate name
        if ( name == null || name == "" || name.length < 0 || isNumeric( name ) )
        {
          let errorMessage = `Ignoring line ${index} - Invalid card name: '${cardString}'`;
          addInformationIndented(1, errorMessage);
          consoleWarn(null, errorMessage);
          continue;
        }

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

    setGlobalCursor( "auto" );
    showOutput( finalString );
  }

  function showOutput( content )
  {
    // console.log( "Output", content );
    document.getElementById( "outputText" ).innerHTML = content;
  }

  function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  function consoleLog( note, message )
  {
    if ( logToConsole )
    {
      console.log( note != null ? note : "", message );
    }
  }

  function consoleWarn( note, message )
  {
    if ( logToConsole )
    {
      console.warn( note != null ? note : "", message );
    }
  }

  function setGlobalCursor( style )
  {
    const cursorStyle = document.createElement('style');
    cursorStyle.innerHTML = `*{cursor: ${style}!important;}`;
    cursorStyle.id = 'cursor-style';
    document.head.appendChild(cursorStyle);
  }
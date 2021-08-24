let loadButton = document.getElementById("loadButton");

loadButton.addEventListener("click", async () => {
  console.log("loading file");
  var fileToLoad = document.getElementById("fileToLoad").files[0];
  var fileReader = new FileReader();
  fileReader.onload = async function(fileLoadedEvent){
      var textFromFileLoaded = fileToArray(fileLoadedEvent.target.result);
      chrome.storage.local.set({ 'questions' : textFromFileLoaded });
      console.log(textFromFileLoaded);
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: displayFileLoaded,
      });
  };

  fileReader.readAsText(fileToLoad, "UTF-8");
});

function displayFileLoaded() {
  var element = document.getElementById("instructions");
  if (element) {
    console.log("Found instruction");
    var numberOfQuestions = 0;
    chrome.storage.sync.get('questions', ({ questions }) => {
      console.log(questions);
      numberOfQuestions = questions.length;
        try {
            const loaded = document.createElement("p");
            loaded.className = "loaded";
            loaded.innerText = "Loaded " + numberOfQuestions.toString() + " questions";
            loaded.style.marginTop = "-10px";
            element.append(loaded);
        }
        catch(e) {
          ;
        }   
    });
  }
}

function fileToArray(str, delimiter = "\t") {

  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

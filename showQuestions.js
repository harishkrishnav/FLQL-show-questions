showInstructions();
updateButtons();
showQuestion();

var prevQuestion = "";
var prevRound = "";
var prevQuestionText = "";
var prevQuestionImgUrl = "";
var prevAnswerText = "";


// Use Showdown to convert markdown to HTML. I copy-pasted from https://github.com/showdownjs/showdown (not included in this repo)
// One change I made was to not process underscores because they are commonly used for blanks in questions.
var converter = new showdown.Converter();

// Use Dompurify to sanitize potentially dangerous scripts in innerHTML. I copied from github.com/cure53/DOMPurify/ (not included in this repo)

/* ----------------------------------------- */
async function showInstructions() {
  var elements = document.getElementsByTagName("div");
  var noteText = "Upload the questions before you hit start";
  chrome.storage.local.get("questions", ({questions}) => {
    if (questions && questions.length>2) {
      noteText = "There is already a loaded set of questions in the browser cache. Re-upload if you want to be sure, and click start."
    } 
    for (item of elements) {
      try {
        if (item.className === "cell w99 h10") {
          item.id = "42";
          const instructionsElement = getInstructionsElement(noteText);
          item.append(instructionsElement);
        }
      } catch (e) {}
    }
  });
}

/* ----------------------------------------- */
//showQuestion must be called each time a button is clicked
async function updateButtons() {
  var elements = document.getElementsByTagName("input");
  for (item of elements) {
    try {
      if (item.type === "button") {
        item.onclick = function () {
          updateButtons();
          showQuestion();
        };
      }
    } catch (e) {}
  }
}

/* ----------------------------------------- */
async function showQuestion() {
  //get round
  var elements = document.getElementsByTagName("span");
  var round = "";
  var question = "";
  for (item of elements) {
    try {
      if (item.className === "ng-binding") {
        if (item.innerText.includes("Round")) {
          round = item.innerText;
        }
      }
    } catch (e) {}
  }

  //get question number
  var elements = document.getElementsByTagName("div");
  for (item of elements) {
    try {
      if (item.className === "tablecell3 ng-binding") {
        if (item.innerText.includes("Question")) {
          question = item.innerText.split(":")[0];
          console.log(round, question);
        }
      }
    } catch (e) {}
  }

  //check if quiz over
  var quizOver = false;
  var elements = document.getElementsByTagName("span");
  for (item of elements) {
    try {
      if (item.innerText.includes("Completed") && item.className.length <2) {
        quizOver = true;
      }
    } catch (e) {}
  }


  //display question
  chrome.storage.local.get("questions", ({ questions }) => {
    if (!questions) {console.log("No loaded questions found)");}
    var foundQuestion = questions.find((q) => q.roundNo === round && q.questionNo === question);
    var elements = document.getElementsByTagName("div");
    try {
      var bottomBar = elements[32];
      
      if (quizOver) {
        bottomBar.remove();
        return;
      }

      if (bottomBar.className === "cell w99 h1" && foundQuestion.questionText.length > 2) {
        bottomBar.innerHTML = "";
        const questionText = getQuestionElement(foundQuestion);

        const questionImgElement = getImageElement(foundQuestion);
        //var imagePresent = foundQuestion.imageUrl && foundQuestion.imageUrl.length > 3;

        if (prevRound === round && prevQuestion === question) {
          //console.log("Same question");

          const questionTextImageElement = getQuestionImageDivElement();
          questionTextImageElement.append(questionText);
          questionTextImageElement.append(questionImgElement);
          bottomBar.append(questionTextImageElement);

          prevQuestionText = foundQuestion.questionText;
          prevQuestionImgUrl = foundQuestion.imageUrl;
          prevAnswerText = foundQuestion.answerText;
        } else {

          const prevQuestionElement = getPreviousQuestionElement(prevQuestionText);
          const previousQuestionImgElement = getPreviousQuestionImgElement(prevQuestionImgUrl);

          const answerText = getAnswertextElement(prevAnswerText);
          var ansButton = getShowAnswerButton();
          var presstimer = null;
          ansButton.onmousedown = () => {  presstimer = setTimeout(function() { answerText.style.visibility = "visible"; ansButton.style.display = "none";},800)  };
          ansButton.onmouseup = () => {clearTimeout(presstimer);}

          const newButton = getButtonElement(questionText, prevQuestionElement, foundQuestion, questionImgElement, previousQuestionImgElement, ansButton, answerText);
          bottomBar.append(newButton);

          bottomBar.append(prevQuestionElement);
          bottomBar.append(previousQuestionImgElement);
          
          if (prevAnswerText) {
            bottomBar.append(ansButton);
            bottomBar.append(answerText);
          }

          questionText.style.visibility = "hidden";
          questionImgElement.style.visibility = "hidden";

          const questionTextImageElement = getQuestionImageDivElement();
          questionTextImageElement.append(questionText);
          questionTextImageElement.append(questionImgElement);
          bottomBar.append(questionTextImageElement);

          prevRound = round;
          prevQuestion = question;
        }
      }
    } catch (e) {}
  });

  //make clock sticky
  try {
    var elements = document.getElementsByTagName("div");
    var clockDiv = elements[8];
    clockDiv.style.top = "0px";
    clockDiv.style.position = "sticky";
  } catch (e) {}
}



function getInstructionsElement(noteText) {
  const instructions = document.createElement("p");
  instructions.className = "instr";
  instructions.id = "instructions";
  instructions.innerHTML = DOMPurify.sanitize(converter.makeHtml(noteText));
  instructions.style.fontSize = "30px";
  return instructions;
}

function getQuestionElement(foundQuestion) {
  const questionText = document.createElement("span");
  questionText.className = "ques_text";
  questionText.id = "ques_text";
  questionText.innerHTML = DOMPurify.sanitize(foundQuestion ? converter.makeHtml(foundQuestion.questionText) : "");
  questionText.style.fontSize = "30px";
  questionText.style.marginLeft = "15px";
  questionText.style.marginRight = "10px";
  questionText.style.marginBottom = "50px";
  questionText.style.marginTop = "-30px";
  questionText.style.float = "left";
  questionText.style.width = foundQuestion.imageUrl && foundQuestion.imageUrl.length > 2 ? 'calc(98% - 720px)' : "92%";
  questionText.style.minWidth = "250px";
  questionText.style.display = "inline";
  return questionText;
}

function getImageElement(foundQuestion) {
  const questionImgElement = document.createElement('img');
  questionImgElement.src = foundQuestion.imageUrl ?? "";
  questionImgElement.alt = "";
  questionImgElement.style.width = "53%";
  questionImgElement.style.maxWidth = "680px";
  questionImgElement.style.maxHeight = "680px";
  questionImgElement.style.objectFit = "contain";
  //questionImgElement.style.height = "auto";
  questionImgElement.style.float = "center";
  questionImgElement.style.marginLeft = "15px";
  //questionImgElement.style.marginTop = "20px";
  questionImgElement.style.marginBottom = "20px";
  questionImgElement.style.display = "inline";
  return questionImgElement;
}

function getQuestionImageDivElement() {
  const questionTextImageElement = document.createElement("div");
  questionTextImageElement.className = "Question-Text-Image";
  questionTextImageElement.style.display = "block";
  questionTextImageElement.style.marginTop = "20px";
  return questionTextImageElement;
}

function getButtonElement(questionText, prevQuestionElement, foundQuestion, questionImgElement, previousQuestionImgElement, ansButton, answerText) {
  const newButton = document.createElement("button");
  newButton.className = "show-question-button";
  newButton.innerText = "Show current question";
  newButton.style.visibility = "visible";
  newButton.style.height = "150px";
  newButton.style.width = "500px";
  newButton.style.fontSize = "35px";
  newButton.style.marginTop = "30px";
  newButton.onclick = () => {
    //hide button
    newButton.style.display = "none";
    //make current question text visible
    questionText.style.display = "inline";
    questionText.style.visibility = "visible";
    //make current question image visible
    questionImgElement.style.display = "inline";
    questionImgElement.style.visibility = "visible";
    //hide previous question text
    prevQuestionElement.style.display = "none";
    prevQuestionText = foundQuestion.questionText;
    //hide previous question image
    previousQuestionImgElement.style.display = "none";
    prevQuestionImgUrl = foundQuestion.imageUrl;
    //hide previous question button and answer
    prevAnswerText = foundQuestion.answerText;
    ansButton.style.display = "none";
    answerText.style.display = "none";
  };
  return newButton;
}

function getPreviousQuestionElement(prevQuestionText) {
  const questionText = document.createElement("p");
  questionText.className = "prev_ques_text";
  questionText.id = "prev_ques_text";
  questionText.innerHTML = DOMPurify.sanitize(prevQuestionText.length > 2 ? "Previous question: " + converter.makeHtml(prevQuestionText) : "");
  questionText.style.fontSize = "27px";
  questionText.style.color = "gray";
  questionText.style.paddingLeft = "20px";
  return questionText;
}

function getPreviousQuestionImgElement(prevQuestionImgUrl) {
  const previousQuestionImgElement = document.createElement('img');
  previousQuestionImgElement.src = prevQuestionImgUrl ?? "";
  previousQuestionImgElement.alt = "";
  previousQuestionImgElement.style.height = "480px";
  previousQuestionImgElement.style.marginLeft = "20px";
  previousQuestionImgElement.style.opacity = "0.7";
  return previousQuestionImgElement;
}

function getAnswertextElement(prevAnswerText) {
  const answerText = document.createElement("div");
  answerText.className = "ans_text";
  answerText.id = "ans_text";
  answerText.innerHTML = DOMPurify.sanitize(prevAnswerText ? converter.makeHtml(prevAnswerText) : "");
  answerText.style.fontSize = "35px";
  answerText.style.marginTop = "-10px";
  answerText.style.marginLeft = "10px";
  answerText.style.marginRight = "10px";
  answerText.style.marginBottom = "30px";
  answerText.style.color = "#696969";
  answerText.style.float = "right";
  answerText.style.visibility = "hidden";
  answerText.style.display = "block";
  return answerText;
}

function getShowAnswerButton() {
  var ansButton = document.createElement("button");
  ansButton.className = "show-answer-button";
  ansButton.innerText = "Long press to show the answer to the previous question";
  ansButton.style.visibility = "visible";
  ansButton.style.height = "100px";
  ansButton.style.width = "400px";
  ansButton.style.fontSize = "25px";
  ansButton.style.marginTop = "30px";
  ansButton.style.float = "right";
  ansButton.style.borderRadius = "12px";
  ansButton.style.backgroundColor = "#B8D8BE";
  ansButton.style.color = "black";
  ansButton.style.color = "block";
  return ansButton;
}

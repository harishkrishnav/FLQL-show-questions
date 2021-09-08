showInstructions();
updateButtons();
showQuestion();

var prevQuestion = "";
var prevRound = "";
var prevQuestionText = "";

/* ----------------------------------------- */
async function showInstructions() {
  var elements = document.getElementsByTagName("div");

  for (item of elements) {
    try {
      if (item.className === "cell w99 h10") {
        item.id = "42";
        const instructions = document.createElement("p");
        instructions.className = "instr";
        instructions.id = "instructions";
        instructions.innerText = "Upload the questions before you hit start";
        instructions.style.fontSize = "30px";
        item.append(instructions);
      }
    } catch (e) {}
  }
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

  //display question
  chrome.storage.local.get("questions", ({ questions }) => {
    var foundQuestion = questions.find((q) => q.roundNo === round && q.questionNo === question);
    var elements = document.getElementsByTagName("div");
    try {
      var bottomBar = elements[32];
      if (bottomBar.className === "cell w99 h1" && foundQuestion.questionText.length > 2) {
        bottomBar.innerHTML = "";
        const questionText = getQuestionElement(foundQuestion);

        if (prevRound === round && prevQuestion === question) {
          //console.log("Same question");
          bottomBar.append(questionText);
          prevQuestionText = foundQuestion.questionText;
        } else {
          //console.log("Show button");

          const prevQuestionElement = getPreviousQuestionElement(prevQuestionText);
          const newButton = getButtonElement(questionText, prevQuestionElement, foundQuestion);
          bottomBar.append(newButton);
          bottomBar.append(prevQuestionElement);
          questionText.style.visibility = "hidden";
          bottomBar.append(questionText);

          prevRound = round;
          prevQuestion = question;
        }
      }
    } catch (e) {}
  });

  //make clock sticky
  try {
    var clockDiv = elements[8];
    clockDiv.style.top = "0px";
    clockDiv.style.position = "sticky";
  } catch (e) {}
}

function getQuestionElement(foundQuestion) {
  const questionText = document.createElement("p");
  questionText.className = "ques_text";
  questionText.id = "ques_text";
  questionText.innerText = foundQuestion ? foundQuestion.questionText : "";
  questionText.style.fontSize = "30px";
  questionText.style.paddingLeft = "20px";
  questionText.style.paddingBottom = "50px";
  return questionText;
}

function getButtonElement(questionText, prevQuestionElement, foundQuestion) {
  const newButton = document.createElement("button");
  newButton.className = "show-question-button";
  newButton.innerText = "Show current question";
  newButton.style.visibility = "visible";
  newButton.style.height = "150px";
  newButton.style.width = "500px";
  newButton.style.fontSize = "35px";
  newButton.style.marginTop = "30px";
  newButton.onclick = () => {
    newButton.style.display = "none";
    questionText.style.display = "block";
    questionText.style.visibility = "visible";
    prevQuestionElement.style.display = "none";
    prevQuestionText = foundQuestion.questionText;
  };
  return newButton;
}

function getPreviousQuestionElement(prevQuestionText) {
  const questionText = document.createElement("p");
  questionText.className = "prev_ques_text";
  questionText.id = "prev_ques_text";
  questionText.innerText = prevQuestionText.length > 2 ? "Previous question : " + prevQuestionText : "";
  questionText.style.fontSize = "27px";
  questionText.style.color = "gray";
  questionText.style.paddingLeft = "20px";
  return questionText;
}

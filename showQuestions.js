showInstructions();
updateButtons();
showQuestion();

var prevQuestion = "";
var prevRound = "";

/* ----------------------------------------- */
async function showInstructions() {
  var elements = document.getElementsByTagName("div");

  for (item of elements) {
    try {
      if(item.className === "cell w99 h10"){
        item.id = "42";
        console.log("Found start");
        const instructions = document.createElement("p");
        instructions.className = "instr";
        instructions.id = "instructions"
        instructions.innerText = "Upload the questions before you hit start";
        instructions.style.fontSize = "30px";
        item.append(instructions);
      }
    }
    catch(e) {
      ;
    }
  }
}

/* ----------------------------------------- */

async function updateButtons() {
  var elements = document.getElementsByTagName("input");
  for (item of elements) {
    try {
      if(item.type === "button"){
        item.onclick = function() {
          updateButtons();
          showQuestion();
        };
      }
    }
    catch(e) {
      ;
    }
  }
}


/* ----------------------------------------- */
async function showQuestion() {

  //get round
  var elements = document.getElementsByTagName("span");
  var round = "";
  var question = ""
  for (item of elements) {
    try {
      if(item.className === "ng-binding"){
        if(item.innerText.includes("Round")){
          round = item.innerText;
        }
      }
    }
    catch(e) {
      ;
    }
  }

  //get question number
  var elements = document.getElementsByTagName("div");
  for (item of elements) {
    try {
      if(item.className === "tablecell3 ng-binding"){
        if(item.innerText.includes("Question")){
          question = item.innerText.split(":")[0];
          console.log(round, question);
        }
      }
    }
    catch(e) {
      ;
    }
  }

  chrome.storage.local.get('questions', ({ questions }) => {
    var foundQuestion = questions.find((q) => q.roundNo === round && q.questionNo === question); 
    //display question
    var elements = document.getElementsByTagName("div");
    try {
      var item = elements[32];
      if(item.className === "cell w99 h1" && foundQuestion.questionText.length > 2){
        {
          item.innerHTML = "";
          const newQuestionText = document.createElement("p");
          questionText = newQuestionText;
          questionText.className = "ques_text";
          questionText.id = "ques_text";
          console.log("prev question was", prevRound, prevQuestion, "\ncurr question is", round, question);
          questionText.innerText = foundQuestion ? foundQuestion.questionText : "";
          questionText.style.fontSize = "30px";
          questionText.style.paddingLeft = "20px";

          if (prevRound === round && prevQuestion === question){
            //console.log("Same question");
            item.append(questionText);
          }
          else {
            console.log("Show button");
            prevRound = round;
            prevQuestion = question;
            
            const newButton = document.createElement("button");
            newButton.className = "show-question-button";
            newButton.innerText = "Show question";
            newButton.style.visibility = 'visible';
            newButton.style.height = '150px';
            newButton.style.width = '500px';
            newButton.style.fontSize = "35px";
            newButton.style.marginTop = "30px";
            newButton.onclick = () => {
              newButton.style.display = 'none'; 
              questionText.style.display = 'block'; 
              questionText.style.visibility = 'visible'; 
            };
            item.append(newButton);
            questionText.style.visibility = 'hidden';
            item.append(questionText);

          }

        }
      }
    }
    catch(e) {
      ;
    }
    });

  //make clock sticky
  try {
    console.log(elements);
    var clockDiv = elements[8];
    clockDiv.style.top = "0px";
    clockDiv.style.position = "sticky";
  }
  catch(e) {
    ;
  }

}

showInstructions();
updateButtons();
showQuestion();

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
    for (item of elements) {
      try {
        if(item.className === "cell w99 h1"){
          {
            item.innerHTML = "";
            const newQuestionText = document.createElement("p");
            questionText = newQuestionText;
            questionText.className = "ques_text";
            questionText.id = "ques_text";
            questionText.innerText = foundQuestion ? foundQuestion.questionText : "";
            questionText.style.fontSize = "30px";
            questionText.style.paddingLeft = "20px";
            item.append(questionText);
          }
        }
      }
      catch(e) {
        ;
      }
    }
    });

}

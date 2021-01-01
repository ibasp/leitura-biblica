const dateInput = document.querySelector("#dateInput"),
  noContentDiv = document.querySelector("#no-content"),
  contentDiv = document.querySelector("#content"),
  text1 = document.querySelector("#text1"),
  label1 = document.querySelector("#label1"),
  checkbox1 = document.querySelector("#checkbox1"),
  text2 = document.querySelector("#text2"),
  label2 = document.querySelector("#label2"),
  checkbox2 = document.querySelector("#checkbox2"),
  help = document.querySelector("#help"),
  helpCloseButton = document.querySelector("#helpCloseButton");

let
  days = {},
  today = (new Date()).toISOString().split("T")[0],
  todayTexts = days[dateInput.value],
  userHistory = localStorage.getItem("history") ? JSON.parse(localStorage.getItem("history")) : {};

dateInput.value = today;
//dateInput.max = today; //Caso seja necessário limitar o dia máximo do input

dateInput.addEventListener("input", updateContent);
checkbox1.addEventListener("change", checkConclusion);
checkbox2.addEventListener("change", checkConclusion);

function getTexts() {
  if (!dateInput.value) return;

  return fetch(`./js/${dateInput.value.split("-")[0]}.json`)
    .then(res => res.status === 200 ? res.json() : {})
    .then(data => {
      days = data;
      updateTodayTexts();
    });
}

function checkConclusion(e) {
  let checked = e.target.checked,
    label = e.target.id === "checkbox1" ? label1 : label2,
    number = e.target.id === "checkbox1" ? 1 : 2,
    now = new Date(),
    localSave = userHistory;

  if (!localSave[dateInput.value]) {
    localSave[dateInput.value] = { "1": null, "2": null };
  }

  if (checked) {
    label.innerHTML = "Concluída em<br />" + now.toLocaleString("pt-BR");

    localSave[dateInput.value][number] = now;

  } else {
    label.innerHTML = "Pendente";
    localSave[dateInput.value][number] = null;

    checkNullDateHistory();
  }

  localStorage.setItem("history", JSON.stringify(localSave));
}

function checkHistory() {
  if (userHistory[dateInput.value]) {
    if (userHistory[dateInput.value][1] !== null) {
      completeText1();
    } else {
      uncompleteText1();
    }

    if (userHistory[dateInput.value][2] !== null) {
      completeText2();
    } else {
      uncompleteText2();
    }
  } else {
    uncompleteText1();
    uncompleteText2();
  }

  checkNullDateHistory();
}

function checkNullDateHistory() {
  if (
    userHistory[dateInput.value]
    && userHistory[dateInput.value][1] === null
    && userHistory[dateInput.value][2] === null
  ) {
    delete userHistory[dateInput.value];

    localStorage.setItem('history', JSON.stringify(userHistory));
  }
}

function completeText1() {
  label1.innerHTML = "Concluída em<br />" + (new Date(userHistory[dateInput.value][1])).toLocaleString("pt-BR");
  checkbox1.checked = true;
}

function uncompleteText1() {
  label1.innerHTML = "Pendente";
  checkbox1.checked = false;
}

function completeText2() {
  label2.innerHTML = "Concluída em<br />" + (new Date(userHistory[dateInput.value][2])).toLocaleString("pt-BR");
  checkbox2.checked = true;
}

function uncompleteText2() {
  label2.innerHTML = "Pendente";
  checkbox2.checked = false;
}

function hideContent() {
  contentDiv.style.display = "none";
  noContentDiv.style.display = "block";
}

function hideNoText() {
  contentDiv.style.display = "block";
  noContentDiv.style.display = "none";
}

function updateTexts() {
  text1.innerText = todayTexts[1];
  text2.innerText = todayTexts[2];
}

function updateTodayTexts() {
  todayTexts = days[dateInput.value];

  if (todayTexts === undefined || todayTexts === null) {
    hideContent();
  } else {
    hideNoText();
    updateTexts();
  }
}

function updateContent() {
  getTexts();
  checkHistory();
}

function exportHistory(e) {
  if (localStorage.getItem("history") === null) return;

  let content = new Blob([localStorage.getItem("history")], { type: "text/plain" });

  e.target.href = URL.createObjectURL(content);
  e.target.download = "Backup - Leitura Biblica Ibasp";
}

function importHistory(e) {
  var file = e.target.files[0];

  if (file.type === "text/plain") {
    var reader = new FileReader();

    reader.readAsText(file);

    reader.onload = (ev) => {
      if (ev.target.result !== "null") {
        localStorage.setItem("history", ev.target.result);
        userHistory = JSON.parse(localStorage.getItem("history"));
        updateContent();
      }
    };
  }
}

function changeDate(period) {
  let selectedDate = new Date(dateInput.value);
  selectedDate.setDate(selectedDate.getDate() + period);

  dateInput.value = selectedDate.toISOString().split("T")[0];

  updateContent();
}

function showHelp() {
  help.style.left = 0;
  helpCloseButton.style.display = "block";
}

function closeHelp() {
  help.style.left = "-100%";
  helpCloseButton.style.display = "none";
}

//Atualizar o conteúdo com o dia atual
updateContent();
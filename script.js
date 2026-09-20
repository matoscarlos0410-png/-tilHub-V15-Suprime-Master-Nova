"use strict";

/* =========================================================
   ÚTILHUB V15 — NOVA FLOW
   ========================================================= */

const STORAGE_KEY = "utilhub-v15-nova-flow";

const defaultState = {
  theme: "dark",
  motion: true,
  favorites: [],
  recent: [],
  notes: "",
  tasks: [],
  shopping: [],
  currencyCache: {}
};

let state = loadState();

let timerInterval = null;
let timerEnd = 0;
let timerRemaining = 0;

let stopwatchInterval = null;
let stopwatchStart = 0;
let stopwatchElapsed = 0;

let toastTimer = null;

/* =========================================================
   UTILIDADES
   ========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return [...document.querySelectorAll(selector)];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return {
      ...defaultState,
      ...(saved || {})
    };
  } catch {
    return { ...defaultState };
  }
}

function formatNumber(value, digits = 8) {
  if (!Number.isFinite(value)) return "—";

  return Number(
    value.toFixed(digits)
  ).toLocaleString("es-PE");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(message, icon = "✓") {
  const element = $("#toast");
  const messageElement = $("#toastMessage");
  const iconElement = $("#toastIcon");

  if (!element) return;

  messageElement.textContent = message;
  iconElement.textContent = icon;

  element.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2600);
}

/* =========================================================
   MODAL
   ========================================================= */

function openModal(content) {
  $("#modalContent").innerHTML = content;
  $("#modal").classList.remove("hidden");
}

function closeModal() {
  $("#modal").classList.add("hidden");
}

$("#modalClose")?.addEventListener("click", closeModal);

$(".modal-backdrop")?.addEventListener("click", closeModal);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});

/* =========================================================
   TEMA
   ========================================================= */

function applyTheme() {
  document.body.classList.toggle(
    "light",
    state.theme === "light"
  );

  $("#themeBtn").textContent =
    state.theme === "dark" ? "☀️" : "🌙";
}

$("#themeBtn")?.addEventListener("click", () => {

  state.theme =
    state.theme === "dark"
      ? "light"
      : "dark";

  saveState();
  applyTheme();

  toast(
    state.theme === "dark"
      ? "Tema oscuro activado"
      : "Tema claro activado"
  );
});

/* =========================================================
   ANIMACIONES
   ========================================================= */

function applyMotion() {

  document.body.classList.toggle(
    "no-motion",
    !state.motion
  );

  $("#motionBtn").textContent =
    state.motion ? "✨" : "⏸️";
}

$("#motionBtn")?.addEventListener("click", () => {

  state.motion = !state.motion;

  saveState();
  applyMotion();

  toast(
    state.motion
      ? "Animaciones activadas"
      : "Animaciones reducidas"
  );
});

/* =========================================================
   SCROLL
   ========================================================= */

$$("[data-scroll]").forEach(button => {

  button.addEventListener("click", () => {

    const target = $(button.dataset.scroll);

    target?.scrollIntoView({
      behavior: state.motion ? "smooth" : "auto"
    });

  });

});

/* =========================================================
   FAVORITOS
   ========================================================= */

function isFavorite(id) {
  return state.favorites.includes(id);
}

function updateFavoritesUI() {

  $$(".favorite").forEach(button => {

    const id = button.dataset.favorite;

    button.classList.toggle(
      "active",
      isFavorite(id)
    );

    button.textContent =
      isFavorite(id) ? "★" : "☆";

  });

  $("#favoriteCount").textContent =
    state.favorites.length;
}

$$(".favorite").forEach(button => {

  button.addEventListener("click", event => {

    event.stopPropagation();

    const id = button.dataset.favorite;

    if (state.favorites.includes(id)) {

      state.favorites =
        state.favorites.filter(item => item !== id);

      toast("Eliminado de favoritos", "☆");

    } else {

      state.favorites.push(id);

      toast("Añadido a favoritos", "★");
    }

    saveState();
    updateFavoritesUI();
  });

});

/* =========================================================
   RECIENTES
   ========================================================= */

function addRecent(id) {

  state.recent =
    state.recent.filter(item => item !== id);

  state.recent.unshift(id);

  state.recent =
    state.recent.slice(0, 12);

  saveState();
}

$$(".tool-card").forEach(card => {

  const id = card.dataset.tool;

  card.addEventListener("click", event => {

    if (
      event.target.closest("button") ||
      event.target.closest("input") ||
      event.target.closest("textarea") ||
      event.target.closest("select")
    ) {
      return;
    }

    addRecent(id);
  });

});

/* =========================================================
   ESTADÍSTICAS
   ========================================================= */

function updateStats() {

  const cards = $$(".tool-card");

  $("#toolCount").textContent =
    cards.length;

  $("#favoriteCount").textContent =
    state.favorites.length;

  const saved =
    state.tasks.length +
    state.shopping.length +
    (state.notes.trim() ? 1 : 0);

  $("#savedCount").textContent = saved;

  $("#novaStatus").textContent =
    navigator.onLine ? "ONLINE" : "OFFLINE";
}

/* =========================================================
   CALCULADORA
   ========================================================= */

/*
  Parser matemático sencillo.
  No utiliza eval ni Function.
*/

function calculateExpression(expression) {

  let input = expression
    .replaceAll(",", ".")
    .replaceAll(" ", "");

  if (!input) {
    throw new Error("Escribe una operación.");
  }

  if (!/^[0-9+\-*/().%]+$/.test(input)) {
    throw new Error("Operación no válida.");
  }

  const tokens = [];
  let number = "";

  function pushNumber() {

    if (!number) return;

    const value = Number(number);

    if (!Number.isFinite(value)) {
      throw new Error("Número no válido.");
    }

    tokens.push(value);
    number = "";
  }

  for (let i = 0; i < input.length; i++) {

    const char = input[i];

    if (
      /[0-9.]/.test(char)
    ) {

      number += char;

      continue;
    }

    if (
      "+-*/%".includes(char)
    ) {

      pushNumber();

      if (
        char === "-" &&
        (
          tokens.length === 0 ||
          typeof tokens[tokens.length - 1] === "string"
        )
      ) {

        tokens.push(0);
      }

      tokens.push(char);

      continue;
    }

    if (char === "(" || char === ")") {

      pushNumber();
      tokens.push(char);

      continue;
    }
  }

  pushNumber();

  function precedence(operator) {

    if (operator === "%") return 3;

    if (
      operator === "*" ||
      operator === "/"
    ) {
      return 2;
    }

    return 1;
  }

  function apply(values, operators) {

    const operator = operators.pop();

    const b = values.pop();
    const a = values.pop();

    if (
      operator === "/" &&
      b === 0
    ) {
      throw new Error("No se puede dividir entre cero.");
    }

    let result;

    switch (operator) {

      case "+":
        result = a + b;
        break;

      case "-":
        result = a - b;
        break;

      case "*":
        result = a * b;
        break;

      case "/":
        result = a / b;
        break;

      case "%":
        result = a % b;
        break;

      default:
        throw new Error("Operador inválido.");
    }

    values.push(result);
  }

  const values = [];
  const operators = [];

  for (const token of tokens) {

    if (typeof token === "number") {

      values.push(token);
      continue;
    }

    if (token === "(") {

      operators.push(token);
      continue;
    }

    if (token === ")") {

      while (
        operators.length &&
        operators.at(-1) !== "("
      ) {
        apply(values, operators);
      }

      if (operators.pop() !== "(") {
        throw new Error("Paréntesis incorrectos.");
      }

      continue;
    }

    while (
      operators.length &&
      operators.at(-1) !== "(" &&
      precedence(operators.at(-1)) >= precedence(token)
    ) {
      apply(values, operators);
    }

    operators.push(token);
  }

  while (operators.length) {

    if (operators.at(-1) === "(") {
      throw new Error("Paréntesis incorrectos.");
    }

    apply(values, operators);
  }

  if (values.length !== 1) {
    throw new Error("Operación incompleta.");
  }

  return values[0];
}

$("#calcBtn")?.addEventListener("click", () => {

  try {

    const value =
      calculateExpression(
        $("#calcInput").value
      );

    $("#calcResult").textContent =
      `Resultado: ${formatNumber(value)}`;

    addRecent("calculator");

  } catch (error) {

    $("#calcResult").textContent =
      `Error: ${error.message}`;
  }

});

/* =========================================================
   PORCENTAJES
   ========================================================= */

$("#percentBtn")?.addEventListener("click", () => {

  const number =
    Number($("#percentNumber").value);

  const percent =
    Number($("#percentValue").value);

  if (
    !Number.isFinite(number) ||
    !Number.isFinite(percent)
  ) {
    $("#percentResult").textContent =
      "Completa los campos.";

    return;
  }

  const result =
    number * percent / 100;

  $("#percentResult").textContent =
    `Resultado: ${formatNumber(result)}`;

  addRecent("percentage");
});

/* =========================================================
   DESCUENTO
   ========================================================= */

$("#discountBtn")?.addEventListener("click", () => {

  const price =
    Number($("#discountPrice").value);

  const percent =
    Number($("#discountPercent").value);

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(percent)
  ) {
    $("#discountResult").textContent =
      "Completa los campos.";

    return;
  }

  const discount =
    price * percent / 100;

  const finalPrice =
    price - discount;

  $("#discountResult").textContent =
    `Final: ${formatNumber(finalPrice)} | Ahorras: ${formatNumber(discount)}`;

  addRecent("discount");
});

/* =========================================================
   REGLA DE 3
   ========================================================= */

$("#ruleBtn")?.addEventListener("click", () => {

  const a = Number($("#ruleA").value);
  const b = Number($("#ruleB").value);
  const c = Number($("#ruleC").value);

  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    !Number.isFinite(c) ||
    a === 0
  ) {
    $("#ruleResult").textContent =
      "Completa los valores correctamente.";

    return;
  }

  const x =
    b * c / a;

  $("#ruleResult").textContent =
    `X = ${formatNumber(x)}`;

  addRecent("rule3");
});

/* =========================================================
   CONVERSORES
   ========================================================= */

function setupConverter({
  valueId,
  fromId,
  toId,
  buttonId,
  resultId,
  units
}) {

  $(`#${buttonId}`)?.addEventListener("click", () => {

    const value =
      Number($(`#${valueId}`).value);

    const from =
      $(`#${fromId}`).value;

    const to =
      $(`#${toId}`).value;

    if (!Number.isFinite(value)) {

      $(`#${resultId}`).textContent =
        "Ingresa un valor.";

      return;
    }

    const base =
      value * units[from];

    const result =
      base / units[to];

    $(`#${resultId}`).textContent =
      `Resultado: ${formatNumber(result)}`;

  });
}

setupConverter({
  valueId: "lengthValue",
  fromId: "lengthFrom",
  toId: "lengthTo",
  buttonId: "lengthBtn",
  resultId: "lengthResult",

  units: {
    m: 1,
    km: 1000,
    cm: .01,
    mm: .001,
    mi: 1609.344,
    ft: .3048
  }
});

setupConverter({
  valueId: "weightValue",
  fromId: "weightFrom",
  toId: "weightTo",
  buttonId: "weightBtn",
  resultId: "weightResult",

  units: {
    kg: 1,
    g: .001,
    mg: .000001,
    lb: .45359237
  }
});

setupConverter({
  valueId: "volumeValue",
  fromId: "volumeFrom",
  toId: "volumeTo",
  buttonId: "volumeBtn",
  resultId: "volumeResult",

  units: {
    l: 1,
    ml: .001,
    m3: 1000
  }
});

setupConverter({
  valueId: "timeValue",
  fromId: "timeFrom",
  toId: "timeTo",
  buttonId: "timeConvertBtn",
  resultId: "timeConvertResult",

  units: {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400
  }
});

/* =========================================================
   TEMPERATURA
   ========================================================= */

function convertTemperature(value, from, to) {

  let celsius;

  if (from === "c") {
    celsius = value;
  }

  if (from === "f") {
    celsius = (value - 32) * 5 / 9;
  }

  if (from === "k") {
    celsius = value - 273.15;
  }

  if (to === "c") {
    return celsius;
  }

  if (to === "f") {
    return celsius * 9 / 5 + 32;
  }

  if (to === "k") {
    return celsius + 273.15;
  }

  return celsius;
}

$("#tempBtn")?.addEventListener("click", () => {

  const value =
    Number($("#tempValue").value);

  const from =
    $("#tempFrom").value;

  const to =
    $("#tempTo").value;

  if (!Number.isFinite(value)) {

    $("#tempResult").textContent =
      "Ingresa un valor.";

    return;
  }

  const result =
    convertTemperature(value, from, to);

  $("#tempResult").textContent =
    `Resultado: ${formatNumber(result)}`;

});

/* =========================================================
   MONEDA
   ========================================================= */

async function getCurrencyRate(from, to) {

  const cacheKey = `${from}_${to}`;

  if (state.currencyCache[cacheKey]) {

    const cached =
      state.currencyCache[cacheKey];

    const age =
      Date.now() - cached.time;

    if (age < 12 * 60 * 60 * 1000) {
      return cached.rate;
    }
  }

  const response =
    await fetch(
      `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`
    );

  if (!response.ok) {
    throw new Error("No se pudo consultar la moneda.");
  }

  const data =
    await response.json();

  if (
    data.result !== "success" ||
    !data.rates ||
    !data.rates[to]
  ) {
    throw new Error("Moneda no disponible.");
  }

  const rate =
    Number(data.rates[to]);

  state.currencyCache[cacheKey] = {
    rate,
    time: Date.now()
  };

  saveState();

  return rate;
}

$("#currencyBtn")?.addEventListener("click", async () => {

  const value =
    Number($("#currencyValue").value);

  const from =
    $("#currencyFrom").value;

  const to =
    $("#currencyTo").value;

  const resultBox =
    $("#currencyResult");

  if (!Number.isFinite(value)) {

    resultBox.textContent =
      "Ingresa una cantidad.";

    return;
  }

  resultBox.textContent =
    "Consultando...";

  try {

    const rate =
      await getCurrencyRate(from, to);

    const result =
      value * rate;

    resultBox.textContent =
      `${value} ${from} ≈ ${formatNumber(result)} ${to}`;

    addRecent("currency");

  } catch (error) {

    resultBox.textContent =
      `Error: ${error.message}`;
  }

});

/* =========================================================
   DIFERENCIA DE FECHAS
   ========================================================= */

$("#dateDifferenceBtn")?.addEventListener("click", () => {

  const first =
    new Date($("#dateOne").value);

  const second =
    new Date($("#dateTwo").value);

  if (
    Number.isNaN(first.getTime()) ||
    Number.isNaN(second.getTime())
  ) {

    $("#dateDifferenceResult").textContent =
      "Selecciona las dos fechas.";

    return;
  }

  const difference =
    Math.abs(
      second.getTime() -
      first.getTime()
    );

  const days =
    Math.round(
      difference / 86400000
    );

  $("#dateDifferenceResult").textContent =
    `${days} día(s) de diferencia.`;

});

/* =========================================================
   EDAD
   ========================================================= */

$("#ageBtn")?.addEventListener("click", () => {

  const value =
    $("#birthDate").value;

  if (!value) {

    $("#ageResult").textContent =
      "Selecciona tu fecha de nacimiento.";

    return;
  }

  const birth =
    new Date(`${value}T00:00:00`);

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const monthDifference =
    today.getMonth() -
    birth.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() < birth.getDate()
    )
  ) {
    age--;
  }

  if (age < 0) {

    $("#ageResult").textContent =
      "La fecha no es válida.";

    return;
  }

  $("#ageResult").textContent =
    `Edad: ${age} año(s)`;

});

/* =========================================================
   TEMPORIZADOR
   ========================================================= */

function formatTimer(ms) {

  const totalSeconds =
    Math.max(
      0,
      Math.ceil(ms / 1000)
    );

  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}

function renderTimer() {

  $("#timerDisplay").textContent =
    formatTimer(timerRemaining);

}

$("#timerStart")?.addEventListener("click", () => {

  if (timerInterval) return;

  if (timerRemaining <= 0) {

    const minutes =
      Number($("#timerMinutes").value) || 0;

    const seconds =
      Number($("#timerSeconds").value) || 0;

    timerRemaining =
      (minutes * 60 + seconds) * 1000;
  }

  if (timerRemaining <= 0) {

    toast("Configura el tiempo primero", "⏱️");
    return;
  }

  timerEnd =
    Date.now() + timerRemaining;

  timerInterval =
    setInterval(() => {

      timerRemaining =
        Math.max(
          0,
          timerEnd - Date.now()
        );

      renderTimer();

      if (timerRemaining <= 0) {

        clearInterval(timerInterval);
        timerInterval = null;

        toast("Temporizador terminado", "⏰");
      }

    }, 100);

});

$("#timerPause")?.addEventListener("click", () => {

  if (!timerInterval) return;

  timerRemaining =
    Math.max(
      0,
      timerEnd - Date.now()
    );

  clearInterval(timerInterval);
  timerInterval = null;

  renderTimer();

});

$("#timerReset")?.addEventListener("click", () => {

  clearInterval(timerInterval);

  timerInterval = null;
  timerRemaining = 0;

  renderTimer();

});

/* =========================================================
   CRONÓMETRO
   ========================================================= */

function formatStopwatch(ms) {

  const totalCentiseconds =
    Math.floor(ms / 10);

  const minutes =
    Math.floor(
      totalCentiseconds / 6000
    );

  const seconds =
    Math.floor(
      (totalCentiseconds % 6000) / 100
    );

  const centiseconds =
    totalCentiseconds % 100;

  return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}.${String(centiseconds).padStart(2,"0")}`;
}

function renderStopwatch() {

  $("#stopwatchDisplay").textContent =
    formatStopwatch(stopwatchElapsed);

}

$("#stopwatchStart")?.addEventListener("click", () => {

  if (stopwatchInterval) return;

  stopwatchStart =
    Date.now() - stopwatchElapsed;

  stopwatchInterval =
    setInterval(() => {

      stopwatchElapsed =
        Date.now() - stopwatchStart;

      renderStopwatch();

    }, 20);

});

$("#stopwatchPause")?.addEventListener("click", () => {

  if (!stopwatchInterval) return;

  stopwatchElapsed =
    Date.now() - stopwatchStart;

  clearInterval(stopwatchInterval);
  stopwatchInterval = null;

  renderStopwatch();

});

$("#stopwatchReset")?.addEventListener("click", () => {

  clearInterval(stopwatchInterval);

  stopwatchInterval = null;
  stopwatchElapsed = 0;

  renderStopwatch();

});

/* =========================================================
   CONTRASEÑAS
   ========================================================= */

function randomIndex(max) {

  const array =
    new Uint32Array(1);

  crypto.getRandomValues(array);

  return array[0] % max;
}

function generatePassword(length) {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*+-_";

  let password = "";

  for (let i = 0; i < length; i++) {

    password +=
      chars[randomIndex(chars.length)];
  }

  return password;
}

$("#passwordBtn")?.addEventListener("click", () => {

  let length =
    Number($("#passwordLength").value);

  length =
    Math.max(
      6,
      Math.min(
        64,
        Math.floor(length || 16)
      )
    );

  $("#passwordLength").value =
    length;

  $("#passwordOutput").value =
    generatePassword(length);

  addRecent("password");

});

/* =========================================================
   RANDOM
   ========================================================= */

$("#randomBtn")?.addEventListener("click", () => {

  let min =
    Number($("#randomMin").value);

  let max =
    Number($("#randomMax").value);

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {

    $("#randomResult").textContent =
      "Completa el rango.";

    return;
  }

  if (min > max) {
    [min, max] = [max, min];
  }

  const result =
    Math.floor(
      Math.random() *
      (max - min + 1)
    ) + min;

  $("#randomResult").textContent =
    `Resultado: ${result}`;

});

/* =========================================================
   DADO
   ========================================================= */

$("#diceBtn")?.addEventListener("click", () => {

  const result =
    Math.floor(
      Math.random() * 6
    ) + 1;

  $("#diceResult").textContent =
    result;

  addRecent("dice");

});

/* =========================================================
   QR
   ========================================================= */

$("#qrBtn")?.addEventListener("click", () => {

  const text =
    $("#qrText").value.trim();

  if (!text) {

    toast("Escribe un texto o enlace", "▦");
    return;
  }

  const url =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}`;

  $("#qrContainer").innerHTML = `
    <img
      src="${url}"
      alt="Código QR generado"
      loading="lazy"
    >
  `;

  addRecent("qr");

});

/* =========================================================
   TEXTO
   ========================================================= */

function updateTextStats() {

  const text =
    $("#textInput").value;

  const words =
    text.trim()
      ? text.trim().split(/\s+/).length
      : 0;

  const chars =
    text.length;

  const lines =
    text
      ? text.split(/\r?\n/).length
      : 0;

  $("#wordCount").textContent =
    words;

  $("#charCount").textContent =
    chars;

  $("#lineCount").textContent =
    lines;

}

$("#textInput")?.addEventListener(
  "input",
  updateTextStats
);

$("#upperBtn")?.addEventListener("click", () => {

  $("#textInput").value =
    $("#textInput").value.toUpperCase();

  updateTextStats();

});

$("#lowerBtn")?.addEventListener("click", () => {

  $("#textInput").value =
    $("#textInput").value.toLowerCase();

  updateTextStats();

});

$("#clearTextBtn")?.addEventListener("click", () => {

  $("#textInput").value = "";

  updateTextStats();

});

/* =========================================================
   DICCIONARIO
   ========================================================= */

$("#dictionaryBtn")?.addEventListener("click", async () => {

  const word =
    $("#dictionaryWord").value
      .trim()
      .toLowerCase();

  const resultBox =
    $("#dictionaryResult");

  if (!word) {

    resultBox.textContent =
      "Escribe una palabra.";

    return;
  }

  resultBox.textContent =
    "Buscando...";

  try {

    const response =
      await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(word)}`
      );

    if (!response.ok) {
      throw new Error("No encontramos esa palabra.");
    }

    const data =
      await response.json();

    const entry =
      data[0];

    const meaning =
      entry.meanings?.[0];

    const definition =
      meaning?.definitions?.[0]?.definition;

    const part =
      meaning?.partOfSpeech || "";

    if (!definition) {
      throw new Error("No hay definición disponible.");
    }

    resultBox.textContent =
      `${part ? part + ": " : ""}${definition}`;

    addRecent("dictionary");

  } catch (error) {

    resultBox.textContent =
      error.message;
  }

});

/* =========================================================
   NOTAS
   ========================================================= */

$("#notesInput").value =
  state.notes || "";

$("#notesInput")?.addEventListener(
  "input",
  updateStats
);

$("#saveNotesBtn")?.addEventListener("click", () => {

  state.notes =
    $("#notesInput").value;

  saveState();
  updateStats();

  $("#notesSaved").textContent =
    `Guardado: ${new Date().toLocaleString("es-PE")}`;

  toast("Notas guardadas", "📝");

});

$("#clearNotesBtn")?.addEventListener("click", () => {

  state.notes = "";

  $("#notesInput").value = "";

  saveState();
  updateStats();

  $("#notesSaved").textContent =
    "Notas borradas.";

});

/* =========================================================
   TAREAS
   ========================================================= */

function renderTasks() {

  const container =
    $("#taskList");

  container.innerHTML = "";

  if (!state.tasks.length) {

    container.innerHTML =
      `<div class="result-box">No hay tareas.</div>`;

    return;
  }

  state.tasks.forEach((task, index) => {

    const item =
      document.createElement("div");

    item.className =
      `list-item ${task.done ? "done" : ""}`;

    item.innerHTML = `
      <button
        class="list-check"
        data-task-check="${index}"
      >
        ${task.done ? "✓" : ""}
      </button>

      <span>${escapeHTML(task.text)}</span>

      <button
        class="list-delete"
        data-task-delete="${index}"
      >
        ×
      </button>
    `;

    container.appendChild(item);
  });

  $$("[data-task-check]").forEach(button => {

    button.addEventListener("click", () => {

      const index =
        Number(button.dataset.taskCheck);

      state.tasks[index].done =
        !state.tasks[index].done;

      saveState();
      renderTasks();
      updateStats();

    });

  });

  $$("[data-task-delete]").forEach(button => {

    button.addEventListener("click", () => {

      const index =
        Number(button.dataset.taskDelete);

      state.tasks.splice(index, 1);

      saveState();
      renderTasks();
      updateStats();

    });

  });

}

function addTask() {

  const input =
    $("#taskInput");

  const text =
    input.value.trim();

  if (!text) return;

  state.tasks.push({
    text,
    done: false
  });

  input.value = "";

  saveState();
  renderTasks();
  updateStats();

}

$("#addTaskBtn")?.addEventListener(
  "click",
  addTask
);

$("#taskInput")?.addEventListener(
  "keydown",
  event => {
    if (event.key === "Enter") {
      addTask();
    }
  }
);

/* =========================================================
   COMPRAS
   ========================================================= */

function renderShopping() {

  const container =
    $("#shoppingList");

  container.innerHTML = "";

  if (!state.shopping.length) {

    container.innerHTML =
      `<div class="result-box">No hay productos.</div>`;

    return;
  }

  state.shopping.forEach((item, index) => {

    const element =
      document.createElement("div");

    element.className =
      `list-item ${item.done ? "done" : ""}`;

    element.innerHTML = `
      <button
        class="list-check"
        data-shopping-check="${index}"
      >
        ${item.done ? "✓" : ""}
      </button>

      <span>${escapeHTML(item.text)}</span>

      <button
        class="list-delete"
        data-shopping-delete="${index}"
      >
        ×
      </button>
    `;

    container.appendChild(element);

  });

  $$("[data-shopping-check]").forEach(button => {

    button.addEventListener("click", () => {

      const index =
        Number(button.dataset.shoppingCheck);

      state.shopping[index].done =
        !state.shopping[index].done;

      saveState();
      renderShopping();
      updateStats();

    });

  });

  $$("[data-shopping-delete]").forEach(button => {

    button.addEventListener("click", () => {

      const index =
        Number(button.dataset.shoppingDelete);

      state.shopping.splice(index, 1);

      saveState();
      renderShopping();
      updateStats();

    });

  });

}

function addShopping() {

  const input =
    $("#shoppingInput");

  const text =
    input.value.trim();

  if (!text) return;

  state.shopping.push({
    text,
    done: false
  });

  input.value = "";

  saveState();
  renderShopping();
  updateStats();

}

$("#addShoppingBtn")?.addEventListener(
  "click",
  addShopping
);

$("#shoppingInput")?.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      addShopping();
    }

  }
);

/* =========================================================
   BÚSQUEDA
   ========================================================= */

let activeCategory = "all";

function filterTools() {

  const query =
    $("#globalSearch").value
      .trim()
      .toLowerCase();

  let visible = 0;

  $$(".tool-card").forEach(card => {

    const category =
      card.dataset.category;

    const text =
      (
        card.dataset.search +
        " " +
        card.querySelector("h3").textContent
      ).toLowerCase();

    const matchesQuery =
      !query ||
      text.includes(query);

    const matchesCategory =
      activeCategory === "all" ||
      category === activeCategory;

    const show =
      matchesQuery &&
      matchesCategory;

    card.style.display =
      show ? "" : "none";

    if (show) visible++;

  });

  $("#noResults")
    .classList.toggle(
      "hidden",
      visible !== 0
    );

}

$("#globalSearch")?.addEventListener(
  "input",
  filterTools
);

$$(".category").forEach(button => {

  button.addEventListener("click", () => {

    $$(".category").forEach(item =>
      item.classList.remove("active")
    );

    button.classList.add("active");

    activeCategory =
      button.dataset.category;

    filterTools();

  });

});

/* =========================================================
   MOSTRAR TODAS
   ========================================================= */

$("#showAllBtn")?.addEventListener("click", () => {

  activeCategory = "all";

  $("#globalSearch").value = "";

  $$(".category").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.category === "all"
    );

  });

  filterTools();

});

/* =========================================================
   FAVORITOS / RECIENTES
   ========================================================= */

function toolName(id) {

  const card =
    document.querySelector(
      `[data-tool="${id}"]`
    );

  return card?.querySelector("h3")?.textContent ||
    id;
}

$("#favoritesBtn")?.addEventListener("click", () => {

  if (!state.favorites.length) {

    openModal(`
      <h2>No tienes favoritos</h2>
      <p style="margin-top:10px;color:var(--muted)">
        Pulsa la estrella de una herramienta para añadirla.
      </p>
    `);

    return;
  }

  const items =
    state.favorites
      .map(id => `<li>${escapeHTML(toolName(id))}</li>`)
      .join("");

  openModal(`
    <h2>⭐ Tus favoritos</h2>
    <ul style="margin-top:18px;display:grid;gap:10px">
      ${items}
    </ul>
  `);

});

$("#recentBtn")?.addEventListener("click", () => {

  if (!state.recent.length) {

    openModal(`
      <h2>Sin herramientas recientes</h2>
      <p style="margin-top:10px;color:var(--muted)">
        Cuando utilices herramientas aparecerán aquí.
      </p>
    `);

    return;
  }

  const items =
    state.recent
      .map(id => `<li>${escapeHTML(toolName(id))}</li>`)
      .join("");

  openModal(`
    <h2>🕘 Herramientas recientes</h2>
    <ul style="margin-top:18px;display:grid;gap:10px">
      ${items}
    </ul>
  `);

});

/* =========================================================
   EXPORTAR
   ========================================================= */

$("#exportBtn")?.addEventListener("click", () => {

  const data =
    JSON.stringify(state, null, 2);

  const blob =
    new Blob(
      [data],
      { type: "application/json" }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = "utilhub-backup.json";

  link.click();

  URL.revokeObjectURL(url);

  toast("Datos exportados", "💾");

});

/* =========================================================
   IMPORTAR
   ========================================================= */

$("#importBtn")?.addEventListener("click", () => {
  $("#importFile").click();
});

$("#importFile")?.addEventListener(
  "change",
  async event => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    try {

      const text =
        await file.text();

      const imported =
        JSON.parse(text);

      state = {
        ...defaultState,
        ...imported
      };

      saveState();

      location.reload();

    } catch {

      toast(
        "El archivo no es válido",
        "!"
      );
    }

  }
);

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

$("#settingsBtn")?.addEventListener("click", () => {

  openModal(`
    <h2>⚙️ Configuración</h2>

    <div style="
      display:grid;
      gap:12px;
      margin-top:20px;
    ">

      <button
        id="modalTheme"
        class="secondary-btn"
      >
        Cambiar tema
      </button>

      <button
        id="modalMotion"
        class="secondary-btn"
      >
        Activar/desactivar animaciones
      </button>

      <button
        id="resetData"
        class="secondary-btn"
      >
        Restablecer datos
      </button>

    </div>
  `);

  $("#modalTheme")?.addEventListener(
    "click",
    () => {
      $("#themeBtn").click();
    }
  );

  $("#modalMotion")?.addEventListener(
    "click",
    () => {
      $("#motionBtn").click();
    }
  );

  $("#resetData")?.addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          "¿Eliminar todos los datos locales de ÚtilHub?"
        );

      if (!confirmed) return;

      localStorage.removeItem(STORAGE_KEY);

      location.reload();

    }
  );

});

/* =========================================================
   COMMAND PALETTE
   ========================================================= */

$("#commandBtn")?.addEventListener("click", () => {

  openModal(`
    <h2>⚡ Acciones rápidas</h2>

    <div style="
      display:grid;
      gap:10px;
      margin-top:20px;
    ">

      <button
        class="secondary-btn"
        data-command="search"
      >
        🔎 Buscar herramienta
      </button>

      <button
        class="secondary-btn"
        data-command="favorites"
      >
        ⭐ Ver favoritos
      </button>

      <button
        class="secondary-btn"
        data-command="notes"
      >
        📝 Ir a notas
      </button>

      <button
        class="secondary-btn"
        data-command="theme"
      >
        🌙 Cambiar tema
      </button>

    </div>
  `);

  $$("[data-command]").forEach(button => {

    button.addEventListener("click", () => {

      const command =
        button.dataset.command;

      closeModal();

      if (command === "search") {

        $("#globalSearch").focus();

      }

      if (command === "favorites") {

        $("#favoritesBtn").click();

      }

      if (command === "notes") {

        document
          .querySelector('[data-tool="notes"]')
          ?.scrollIntoView({
            behavior: "smooth"
          });

      }

      if (command === "theme") {

        $("#themeBtn").click();

      }

    });

  });

});

/* =========================================================
   ATAJO CTRL + K
   ========================================================= */

document.addEventListener("keydown", event => {

  if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "k"
  ) {

    event.preventDefault();

    $("#globalSearch").focus();

  }

});

/* =========================================================
   ONLINE / OFFLINE
   ========================================================= */

window.addEventListener("online", () => {

  $("#novaStatus").textContent =
    "ONLINE";

  toast("Conexión recuperada", "✓");

});

window.addEventListener("offline", () => {

  $("#novaStatus").textContent =
    "OFFLINE";

  toast(
    "Modo offline: funciones locales disponibles",
    "◌"
  );

});

/* =========================================================
   NOVA FLOW CANVAS
   ========================================================= */

const canvas =
  $("#novaCanvas");

const ctx =
  canvas?.getContext("2d");

let particles = [];
let mouse = {
  x: null,
  y: null,
  active: false
};

function resizeCanvas() {

  if (!canvas || !ctx) return;

  const ratio =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );

  canvas.width =
    window.innerWidth * ratio;

  canvas.height =
    window.innerHeight * ratio;

  canvas.style.width =
    `${window.innerWidth}px`;

  canvas.style.height =
    `${window.innerHeight}px`;

  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );

  createParticles();
}

function createParticles() {

  particles = [];

  const mobile =
    window.innerWidth < 700;

  const count =
    mobile ? 45 : 95;

  for (let i = 0; i < count; i++) {

    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,

      vx:
        (Math.random() - .5) * .22,

      vy:
        (Math.random() - .5) * .22,

      radius:
        Math.random() * 1.7 + .4,

      alpha:
        Math.random() * .6 + .15
    });

  }

}

function drawCanvas() {

  if (!canvas || !ctx) return;

  ctx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );

  for (const particle of particles) {

    if (state.motion) {

      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -20)
        particle.x = window.innerWidth + 20;

      if (particle.x > window.innerWidth + 20)
        particle.x = -20;

      if (particle.y < -20)
        particle.y = window.innerHeight + 20;

      if (particle.y > window.innerHeight + 20)
        particle.y = -20;
    }

    if (
      mouse.active &&
      mouse.x !== null &&
      mouse.y !== null
    ) {

      const dx =
        mouse.x - particle.x;

      const dy =
        mouse.y - particle.y;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      if (distance < 130) {

        particle.x -=
          dx / 130 * .12;

        particle.y -=
          dy / 130 * .12;
      }

    }

    ctx.beginPath();

    ctx.arc(
      particle.x,
      particle.y,
      particle.radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      `rgba(34,211,238,${particle.alpha})`;

    ctx.fill();

  }

  for (let i = 0; i < particles.length; i++) {

    for (
      let j = i + 1;
      j < particles.length;
      j++
    ) {

      const a =
        particles[i];

      const b =
        particles[j];

      const dx =
        a.x - b.x;

      const dy =
        a.y - b.y;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      if (distance < 100) {

        ctx.beginPath();

        ctx.moveTo(
          a.x,
          a.y
        );

        ctx.lineTo(
          b.x,
          b.y
        );

        ctx.strokeStyle =
          `rgba(59,130,246,${(1 - distance / 100) * .12})`;

        ctx.lineWidth = .6;

        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawCanvas);
}

window.addEventListener(
  "resize",
  resizeCanvas
);

window.addEventListener(
  "mousemove",
  event => {

    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;

  }
);

window.addEventListener(
  "mouseleave",
  () => {
    mouse.active = false;
  }
);

/* =========================================================
   SERVICE WORKER
   ========================================================= */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./sw.js")
      .catch(() => {});

  });

}

/* =========================================================
   INICIO
   ========================================================= */

function init() {

  applyTheme();
  applyMotion();

  renderTasks();
  renderShopping();

  updateTextStats();
  updateStats();

  updateFavoritesUI();

  renderTimer();
  renderStopwatch();

  resizeCanvas();
  drawCanvas();

}

init();

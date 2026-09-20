(() => {
"use strict";


/* =========================================================
   ÚTILHUB V16 — NOVA FLOW X
========================================================= */

const KEY = "utilhub-v16-nova-flow";


const DEFAULT = {

  theme:"dark",

  motion:true,

  favorites:[],

  recent:[],

  notes:[],

  tasks:[],

  shopping:[],

  currencyCache:{},

  focusMinutes:25

};


let state = load();

let currentCategory = "Todos";

let timerInterval = null;

let timerEnd = 0;

let stopwatchInterval = null;

let stopwatchStart = 0;

let stopwatchElapsed = 0;


/* =========================================================
   HERRAMIENTAS
========================================================= */

const tools = [

  {
    id:"calc",
    cat:"Cálculo",
    icon:"🧮",
    title:"Calculadora",
    desc:"Operaciones rápidas"
  },

  {
    id:"percent",
    cat:"Cálculo",
    icon:"％",
    title:"Porcentajes",
    desc:"Calcula porcentajes"
  },

  {
    id:"discount",
    cat:"Cálculo",
    icon:"🏷️",
    title:"Descuentos",
    desc:"Precio final y ahorro"
  },

  {
    id:"rule3",
    cat:"Cálculo",
    icon:"⚖️",
    title:"Regla de 3",
    desc:"Proporciones"
  },

  {
    id:"length",
    cat:"Conversores",
    icon:"📏",
    title:"Longitud",
    desc:"mm, cm, m, km"
  },

  {
    id:"weight",
    cat:"Conversores",
    icon:"⚖️",
    title:"Peso",
    desc:"g, kg, lb, oz"
  },

  {
    id:"volume",
    cat:"Conversores",
    icon:"🧪",
    title:"Volumen",
    desc:"ml, l, m³"
  },

  {
    id:"temp",
    cat:"Conversores",
    icon:"🌡️",
    title:"Temperatura",
    desc:"°C, °F, K"
  },

  {
    id:"timeconv",
    cat:"Conversores",
    icon:"⏱️",
    title:"Tiempo",
    desc:"Convierte unidades"
  },

  {
    id:"currency",
    cat:"Utilidad",
    icon:"💱",
    title:"Moneda",
    desc:"Consulta tipo de cambio"
  },

  {
    id:"date",
    cat:"Utilidad",
    icon:"📅",
    title:"Diferencia de fechas",
    desc:"Días entre fechas"
  },

  {
    id:"age",
    cat:"Utilidad",
    icon:"🎂",
    title:"Edad",
    desc:"Calcula edad exacta"
  },

  {
    id:"timer",
    cat:"Tiempo",
    icon:"⏳",
    title:"Temporizador",
    desc:"Cuenta regresiva"
  },

  {
    id:"stopwatch",
    cat:"Tiempo",
    icon:"⏱️",
    title:"Cronómetro",
    desc:"Mide tiempo"
  },

  {
    id:"password",
    cat:"Texto",
    icon:"🔐",
    title:"Contraseña segura",
    desc:"Generación local"
  },

  {
    id:"random",
    cat:"Utilidad",
    icon:"🎲",
    title:"Aleatorio",
    desc:"Número o dado"
  },

  {
    id:"qr",
    cat:"Texto",
    icon:"▦",
    title:"Código QR",
    desc:"Genera QR"
  },

  {
    id:"text",
    cat:"Texto",
    icon:"🔤",
    title:"Herramientas de texto",
    desc:"Contar, mayúsculas y más"
  },

  {
    id:"dictionary",
    cat:"Texto",
    icon:"📖",
    title:"Diccionario",
    desc:"Consulta palabras en español"
  },

  {
    id:"notes",
    cat:"Organiza",
    icon:"📝",
    title:"Notas",
    desc:"Notas locales"
  },

  {
    id:"tasks",
    cat:"Organiza",
    icon:"☑️",
    title:"Tareas",
    desc:"Lista de pendientes"
  },

  {
    id:"shopping",
    cat:"Organiza",
    icon:"🛒",
    title:"Compras",
    desc:"Lista de compras"
  },

  {
    id:"tip",
    cat:"Cálculo",
    icon:"💡",
    title:"Propina",
    desc:"Calcula una propina y total"
  },

  {
    id:"split",
    cat:"Cálculo",
    icon:"👥",
    title:"Dividir cuenta",
    desc:"Reparte un total entre personas"
  },

  {
    id:"change",
    cat:"Cálculo",
    icon:"📈",
    title:"Cambio porcentual",
    desc:"Subida o bajada porcentual"
  },

  {
    id:"area",
    cat:"Conversores",
    icon:"▦",
    title:"Área",
    desc:"m², cm², km², ha"
  },

  {
    id:"data",
    cat:"Conversores",
    icon:"💾",
    title:"Datos digitales",
    desc:"B, KB, MB, GB, TB"
  },

  {
    id:"fuel",
    cat:"Utilidad",
    icon:"⛽",
    title:"Viaje y combustible",
    desc:"Estima litros y costo"
  },

  {
    id:"calendar",
    cat:"Utilidad",
    icon:"🗓️",
    title:"Calendario",
    desc:"Genera el mes actual"
  },

  {
    id:"color",
    cat:"Texto",
    icon:"🎨",
    title:"Color",
    desc:"Convierte HEX y RGB"
  },

  {
    id:"focus",
    cat:"Tiempo",
    icon:"🎯",
    title:"NOVA Focus",
    desc:"Sesión de concentración"
  }

];


/* =========================================================
   UTILIDADES
========================================================= */

const $ = s => document.querySelector(s);

const $$ = s => [...document.querySelectorAll(s)];


function load(){

  try{

    return {
      ...DEFAULT,
      ...JSON.parse(
        localStorage.getItem(KEY) || "{}"
      )
    };

  }catch{

    return {...DEFAULT};

  }

}


function save(){

  localStorage.setItem(
    KEY,
    JSON.stringify(state)
  );

  updateStats();

}


function esc(s){

  return String(s ?? "")
    .replace(
      /[&<>"']/g,
      m => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#039;"
      }[m])
    );

}


function fmt(n){

  return Number.isFinite(Number(n))

    ? Number(n).toLocaleString(
        "es-PE",
        {
          maximumFractionDigits:8
        }
      )

    : "—";

}


function toast(msg){

  const t = $("#toast");

  t.textContent = msg;

  t.classList.add("show");

  clearTimeout(toast.t);

  toast.t = setTimeout(
    () => t.classList.remove("show"),
    2200
  );

}


/* =========================================================
   CATEGORÍAS
========================================================= */

function renderCategories(){

  const cats = [
    "Todos",
    ...new Set(
      tools.map(t => t.cat)
    ),
    "★ Favoritos"
  ];

  $("#categoryBar").innerHTML =
    cats
      .map(
        c =>
          `<button
            class="${c===currentCategory?"active":""}"
            data-cat="${esc(c)}"
          >
            ${esc(c)}
          </button>`
      )
      .join("");


  $$("#categoryBar button")
    .forEach(
      b =>
        b.onclick = () => {

          currentCategory =
            b.dataset.cat;

          renderCategories();

          renderTools();

        }
    );

}


/* =========================================================
   RENDER DE HERRAMIENTAS
========================================================= */

function renderTools(){

  const q =
    $("#globalSearch")
      .value
      .trim()
      .toLowerCase();


  const list =
    tools.filter(
      t => {

        const catOK =
          currentCategory === "Todos"

          ||

          (
            currentCategory === "★ Favoritos"
            &&
            state.favorites.includes(t.id)
          )

          ||

          (
            currentCategory !== "★ Favoritos"
            &&
            t.cat === currentCategory
          );


        const qOK =
          !q
          ||
          `${t.title} ${t.desc} ${t.cat}`
            .toLowerCase()
            .includes(q);


        return catOK && qOK;

      }
    );


  $("#resultCount").textContent =
    `${list.length} herramienta${list.length===1?"":"s"}`;


  $("#toolGrid").innerHTML =

    list.map(
      t => {

        const fav =
          state.favorites.includes(t.id);

        return `

          <article
            class="tool-card"
            data-tool="${t.id}"
          >

            <button
              class="fav ${fav?"active":""}"
              data-fav="${t.id}"
              title="Favorito"
            >
              ${fav?"★":"☆"}
            </button>

            <div class="tool-icon">
              ${t.icon}
            </div>

            <b>${t.title}</b>

            <small>
              ${t.desc}
            </small>

          </article>

        `;

      }
    ).join("")

    ||

    `
      <div class="result">
        No se encontraron herramientas.
      </div>
    `;


  $$("#toolGrid .tool-card")
    .forEach(
      c =>

        c.onclick = e => {

          if(
            !e.target.closest(
              "[data-fav]"
            )
          ){

            openTool(
              c.dataset.tool
            );

          }

        }
    );


  $$("#toolGrid [data-fav]")
    .forEach(
      b =>

        b.onclick = e => {

          e.stopPropagation();

          toggleFav(
            b.dataset.fav
          );

        }
    );

}


/* =========================================================
   FAVORITOS
========================================================= */

function toggleFav(id){

  state.favorites =
    state.favorites.includes(id)

      ?

      state.favorites.filter(
        x => x !== id
      )

      :

      [
        ...state.favorites,
        id
      ];


  save();

  renderTools();

  toast(
    state.favorites.includes(id)
      ? "Añadido a favoritos"
      : "Quitado de favoritos"
  );

}


/* =========================================================
   ESTADÍSTICAS
========================================================= */

function updateStats(){

  $("#statTools").textContent =
    tools.length;

  $("#statFavs").textContent =
    state.favorites.length;

  $("#statNotes").textContent =
    state.notes.length;

  $("#statTasks").textContent =
    state.tasks.filter(
      x => !x.done
    ).length;

}


/* =========================================================
   MODAL
========================================================= */

function openModal(
  title,
  tag,
  body
){

  $("#modalTitle").textContent =
    title;

  $("#modalTag").textContent =
    tag || "NOVA TOOL";

  $("#modalBody").innerHTML =
    body;

  $("#modal").classList.add(
    "open"
  );

  $("#modal").setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeModal(){

  $("#modal")
    .classList
    .remove("open");

  $("#modal")
    .setAttribute(
      "aria-hidden",
      "true"
    );

}


$$("[data-close-modal]")
  .forEach(
    x => x.onclick = closeModal
  );


/* =========================================================
   CAMPOS
========================================================= */

function field(
  label,
  id,
  placeholder="",
  type="text"
){

  return `

    <div class="field">

      <label for="${id}">
        ${label}
      </label>

      <input
        id="${id}"
        type="${type}"
        placeholder="${placeholder}"
      >

    </div>

  `;

}


function modalButtons(html){

  return `
    <div class="modal-actions">
      ${html}
    </div>
  `;

}


function recent(id){

  state.recent = [
    id,
    ...state.recent.filter(
      x => x !== id
    )
  ].slice(0,8);

  save();

}


/* =========================================================
   ABRIR HERRAMIENTA
========================================================= */

function openTool(id){

  recent(id);

  const t =
    tools.find(
      x => x.id === id
    );

  if(!t) return;

  let body = "";


  switch(id){

    case "calc":

      body = `

        <div class="field">

          <label>
            Expresión
          </label>

          <input
            id="calcInput"
            placeholder="Ej.: (25+5)*3/2"
          >

        </div>

        ${modalButtons(
          '<button class="btn primary" id="calcGo">Calcular</button>'
        )}

        <div
          id="calcResult"
          class="result"
        >
          Escribe una operación matemática.
        </div>

      `;

      break;


    case "percent":

      body = `

        <div class="form-grid">

          ${field(
            "Porcentaje",
            "p1",
            "20",
            "number"
          )}

          ${field(
            "De",
            "p2",
            "150",
            "number"
          )}

        </div>

        ${modalButtons(
          '<button class="btn primary" id="percentGo">Calcular</button>'
        )}

        <div
          id="percentResult"
          class="result"
        ></div>

      `;

      break;


    case "discount":

      body = `

        <div class="form-grid">

          ${field(
            "Precio",
            "d1",
            "100",
            "number"
          )}

          ${field(
            "Descuento %",
            "d2",
            "15",
            "number"
          )}

        </div>

        ${modalButtons(
          '<button class="btn primary" id="discountGo">Calcular</button>'
        )}

        <div
          id="discountResult"
          class="result"
        ></div>

      `;

      break;


    case "rule3":

      body = `

        <div class="form-grid">

          ${field(
            "A",
            "r1",
            "2",
            "number"
          )}

          ${field(
            "B",
            "r2",
            "6",
            "number"
          )}

          ${field(
            "C",
            "r3",
            "5",
            "number"
          )}

        </div>

        ${modalButtons(
          '<button class="btn primary" id="ruleGo">Calcular X</button>'
        )}

        <div
          id="ruleResult"
          class="result"
        ></div>

      `;

      break;


    case "length":

      body =
        converter(
          "Longitud",
          [
            "mm",
            "cm",
            "m",
            "km",
            "in",
            "ft"
          ],
          {
            mm:0.001,
            cm:.01,
            m:1,
            km:1000,
            in:.0254,
            ft:.3048
          },
          "length"
        );

      break;


    case "weight":

      body =
        converter(
          "Peso",
          [
            "g",
            "kg",
            "lb",
            "oz"
          ],
          {
            g:.001,
            kg:1,
            lb:.45359237,
            oz:.0283495231
          },
          "weight"
        );

      break;


    case "volume":

      body =
        converter(
          "Volumen",
          [
            "ml",
            "l",
            "m³"
          ],
          {
            ml:.001,
            l:1,
            "m³":1000
          },
          "volume"
        );

      break;


    case "temp":

      body = `

        <div class="form-grid">

          ${field(
            "Valor",
            "tv",
            "25",
            "number"
          )}

          <div class="field">

            <label>
              De
            </label>

            <select id="tf">

              <option>°C</option>
              <option>°F</option>
              <option>K</option>

            </select>

          </div>

          <div class="field">

            <label>
              A
            </label>

            <select id="tt">

              <option>°C</option>
              <option>°F</option>
              <option>K</option>

            </select>

          </div>

        </div>

        ${modalButtons(
          '<button class="btn primary" id="tempGo">Convertir</button>'
        )}

        <div
          id="tempResult"
          class="result"
        ></div>

      `;

      break;


    case "timeconv":

      body =
        converter(
          "Tiempo",
          [
            "seg",
            "min",
            "h",
            "día"
          ],
          {
            seg:1,
            min:60,
            h:3600,
            "día":86400
          },
          "timeconv"
        );

      break;


    case "currency":

      body = `

        <div class="form-grid">

          ${field(
            "Cantidad",
            "cv",
            "1",
            "number"
          )}

          <div class="field">

            <label>
              De
            </label>

            <select id="cf">

              ${
                [
                  "USD",
                  "PEN",
                  "EUR",
                  "GBP",
                  "BRL",
                  "JPY",
                  "CAD",
                  "MXN"
                ]
                .map(
                  x => `<option>${x}</option>`
                )
                .join("")
              }

            </select>

          </div>

          <div class="field">

            <label>
              A
            </label>

            <select id="ct">

              ${
                [
                  "PEN",
                  "USD",
                  "EUR",
                  "GBP",
                  "BRL",
                  "JPY",
                  "CAD",
                  "MXN"
                ]
                .map(
                  x => `<option>${x}</option>`
                )
                .join("")
              }

            </select>

          </div>

        </div>

        ${modalButtons(
          '<button class="btn primary" id="currencyGo">Consultar</button>'
        )}

        <div
          id="currencyResult"
          class="result"
        >
          Necesita conexión para consultar el tipo de cambio.
        </div>

      `;

      break;


    case "date":

      body = `

        <div class="form-grid">

          ${field(
            "Fecha inicial",
            "date1",
            "",
            "date"
          )}

          ${field(
            "Fecha final",
            "date2",
            "",
            "date"
          )}

        </div>

        ${modalButtons(
          '<button class="btn primary" id="dateGo">Calcular días</button>'
        )}

        <div
          id="dateResult"
          class="result"
        ></div>

      `;

      break;


    case "age":

      body = `

        ${field(
          "Fecha de nacimiento",
          "birth",
          "",
          "date"
        )}

        ${modalButtons(
          '<button class="btn primary" id="ageGo">Calcular edad</button>'
        )}

        <div
          id="ageResult"
          class="result"
        ></div>

      `;

      break;


    case "timer":

      body = `

        <div class="form-grid">

          ${field(
            "Minutos",
            "tm",
            "1",
            "number"
          )}

          ${field(
            "Segundos",
            "ts",
            "0",
            "number"
          )}

        </div>

        ${modalButtons(`
          <button class="btn primary" id="timerStart">
            Iniciar
          </button>

          <button class="btn ghost" id="timerStop">
            Detener
          </button>
        `)}

        <div
          id="timerResult"
          class="result"
        >
          <strong>00:00</strong>
        </div>

      `;

      break;


    case "stopwatch":

      body = `

        ${modalButtons(`

          <button class="btn primary" id="swStart">
            Iniciar
          </button>

          <button class="btn ghost" id="swStop">
            Pausar
          </button>

          <button class="btn ghost" id="swReset">
            Reiniciar
          </button>

        `)}

        <div
          id="swResult"
          class="result"
        >
          <strong>00:00.0</strong>
        </div>

      `;

      break;


    case "password":

      body = `

        <div class="form-grid">

          ${field(
            "Longitud",
            "passLen",
            "16",
            "number"
          )}

          <div class="field">

            <label>
              Opciones
            </label>

            <label>
              <input
                id="passSymbols"
                type="checkbox"
                checked
              >
              Símbolos
            </label>

          </div>

        </div>

        ${modalButtons(`

          <button class="btn primary" id="passGo">
            Generar
          </button>

          <button class="btn ghost" id="passCopy">
            Copiar
          </button>

        `)}

        <div
          id="passResult"
          class="result"
        >
          Pulsa generar.
        </div>

      `;

      break;


    case "random":

      body = `

        <div class="form-grid">

          ${field(
            "Mínimo",
            "randMin",
            "1",
            "number"
          )}

          ${field(
            "Máximo",
            "randMax",
            "100",
            "number"
          )}

        </div>

        ${modalButtons(`

          <button class="btn primary" id="randGo">
            Número
          </button>

          <button class="btn ghost" id="diceGo">
            🎲 Dado
          </button>

        `)}

        <div
          id="randResult"
          class="result"
        ></div>

      `;

      break;


    case "qr":

      body = `

        ${field(
          "Texto o enlace",
          "qrText",
          "https://ejemplo.com"
        )}

        ${modalButtons(
          '<button class="btn primary" id="qrGo">Generar QR</button>'
        )}

        <div
          id="qrResult"
          class="result"
        ></div>

      `;

      break;


    case "text":

      body = `

        <div class="field">

          <label>
            Texto
          </label>

          <textarea
            id="textInput"
            placeholder="Escribe aquí..."
          ></textarea>

        </div>

        ${modalButtons(`

          <button class="btn primary" id="countText">
            Analizar
          </button>

          <button class="btn ghost" id="upperText">
            MAYÚSCULAS
          </button>

          <button class="btn ghost" id="lowerText">
            minúsculas
          </button>

        `)}

        <div
          id="textResult"
          class="result"
        ></div>

      `;

      break;


    case "dictionary":

      body = `

        ${field(
          "Palabra",
          "dictWord",
          "ejemplo"
        )}

        ${modalButtons(
          '<button class="btn primary" id="dictGo">Buscar</button>'
        )}

        <div
          id="dictResult"
          class="result"
        ></div>

      `;

      break;


    case "notes":

      body =
        manager(
          "notes",
          "Nota",
          "Escribe una nota..."
        );

      break;


    case "tasks":

      body =
        manager(
          "tasks",
          "Tarea",
          "Escribe una tarea..."
        );

      break;


    case "shopping":

      body =
        manager(
          "shopping",
          "Producto",
          "Ej.: arroz"
        );

      break;


    case "tip":

      body = `

        <div class="form-grid">

          ${field(
            "Cuenta",
            "tipBill",
            "100",
            "number"
          )}

          ${field(
            "Propina %",
            "tipPct",
            "10",
            "number"
          )}

        </div>

        ${modalButtons(
          '<button class="btn primary" id="tipGo">Calcular</button>'
        )}

        <div
          id="tipResult"
          class="result"
        ></div>

      `;

      break;


    case "split":

      body = `

        <div class="form-grid">

          ${field(
            "Total",
            "splitTotal",
            "100",
            "number"
          )}

          ${field(
            "Personas",
            "splitPeople",
            "2",
            "number"
          )}

          ${field(
            "Propina %",
            "splitTip",
            "0",
            "number"
          )}

        </div>

        ${modalButtons(
          '<button class="btn primary" id="splitGo">Dividir</button>'
        )}

        <div
          id="splitResult"
          class="result"
        ></div>

      `;

      break;


    case "change":

      body = `

        <div class="form-grid">

          ${field(
            "Valor inicial",
            "chgA",
            "100",
            "number"
          )}

          ${field(
            "Valor final",
            "chgB",
            "120",
            "number"
          )}

        </div>

        ${modalButtons(
          '<button class="btn primary" id="changeGo">Calcular</button>'
        )}

        <div
          id="changeResult"
          class="result"
        ></div>

      `;

      break;


    case "area":

      body =
        converter(
          "Área",
          [
            "cm²",
            "m²",
            "km²",
            "ha"
          ],
          {
            "cm²":0.0001,
            "m²":1,
            "km²":1000000,
            "ha":10000
          },
          "area"
        );

      break;


    case "data":

      body =
        converter(
          "Datos",
          [
            "B",
            "KB",
            "MB",
            "GB",
            "TB"
          ],
          {
            B:1,
            KB:1024,
            MB:1024**2,
            GB:1024**3,
            TB:1024**4
          },
          "data"
        );

      break;


    case "fuel":

      body = `

        <div class="form-grid">

          ${field(
            "Distancia (km)",
            "fuelKm",
            "100",
            "number"
          )}

          ${field(
            "Rendimiento (km/L)",
            "fuelEff",
            "12",
            "number"
          )}

          ${field(
            "Precio por litro",
            "fuelPrice",
            "5.5",
            "number"
          )}

        </div>

        ${modalButtons(
          '<button class="btn primary" id="fuelGo">Estimar</button>'
        )}

        <div
          id="fuelResult"
          class="result"
        ></div>

      `;

      break;


    case "calendar":

      body = `

        <div class="form-grid">

          ${field(
            "Año",
            "calYear",
            String(
              new Date().getFullYear()
            ),
            "number"
          )}

          ${field(
            "Mes",
            "calMonth",
            String(
              new Date().getMonth()+1
            ),
            "number"
          )}

        </div>

        ${modalButtons(
          '<button class="btn primary" id="calGo">Generar</button>'
        )}

        <pre
          id="calResult"
          class="calendar-result"
        ></pre>

      `;

      break;


    case "color":

      body = `

        ${field(
          "HEX",
          "hexColor",
          "#22d3ee"
        )}

        ${modalButtons(
          '<button class="btn primary" id="colorGo">Convertir</button>'
        )}

        <div
          id="colorResult"
          class="result"
        ></div>

      `;

      break;


    case "focus":

      body = `

        <div class="result">

          <strong>NOVA Focus</strong>

          <br>

          Abre el modo enfoque de 25 minutos.

        </div>

        ${modalButtons(
          '<button class="btn primary" id="openFocusFromTool">Abrir enfoque</button>'
        )}

      `;

      break;

  }


  openModal(
    t.title,
    t.cat,
    body
  );

  bindTool(id);

}


/* =========================================================
   CONVERSORES
========================================================= */

function converter(
  title,
  units,
  factors,
  prefix
){

  return `

    <div class="form-grid">

      ${field(
        "Valor",
        prefix+"Val",
        "1",
        "number"
      )}

      <div class="field">

        <label>
          De
        </label>

        <select id="${prefix}From">

          ${
            units
              .map(
                u => `<option>${u}</option>`
              )
              .join("")
          }

        </select>

      </div>

      <div class="field">

        <label>
          A
        </label>

        <select id="${prefix}To">

          ${
            units
              .map(
                u => `<option>${u}</option>`
              )
              .join("")
          }

        </select>

      </div>

    </div>

    ${modalButtons(
      `<button
        class="btn primary"
        id="${prefix}Go"
      >
        Convertir
      </button>`
    )}

    <div
      id="${prefix}Result"
      class="result"
    ></div>

  `;

}


function bindConverter(
  prefix,
  factors
){

  $("#"+prefix+"Go").onclick = () => {

    const v =
      Number(
        $("#"+prefix+"Val").value
      );

    const from =
      $("#"+prefix+"From").value;

    const to =
      $("#"+prefix+"To").value;

    const out =
      v *
      factors[from] /
      factors[to];

    $("#"+prefix+"Result").innerHTML = `

      <strong>
        ${fmt(out)} ${esc(to)}
      </strong>

    `;

  };

}


/* =========================================================
   NOTAS / TAREAS / COMPRAS
========================================================= */

function manager(
  type,
  label,
  placeholder
){

  const items =
    state[type] || [];

  return `

    ${field(
      label,
      type+"New",
      placeholder
    )}

    ${modalButtons(
      `<button
        class="btn primary"
        id="${type}Add"
      >
        Agregar
      </button>`
    )}

    <div
      id="${type}List"
      class="list"
    >
      ${renderList(type,items)}
    </div>

  `;

}


function renderList(
  type,
  items
){

  if(!items.length){

    return `
      <div class="muted">
        Todavía no hay elementos.
      </div>
    `;

  }


  return items
    .map(

      (x,i) =>

        type === "tasks"

        ?

        `

          <div
            class="list-item
            ${x.done?"done":""}"
          >

            <label>

              <input
                type="checkbox"
                data-done="${i}"
                ${x.done?"checked":""}
              >

              ${esc(x.text)}

            </label>

            <button
              data-del="${i}"
            >
              ×
            </button>

          </div>

        `

        :

        `

          <div class="list-item">

            <span>
              ${esc(x.text)}
            </span>

            <button
              data-del="${i}"
            >
              ×
            </button>

          </div>

        `

    )
    .join("");

}


function bindManager(type){

  const add =
    $("#"+type+"Add");


  add.onclick = () => {

    const input =
      $("#"+type+"New");

    const text =
      input.value.trim();

    if(!text) return;


    state[type].push(

      type === "tasks"

        ?

        {
          text,
          done:false
        }

        :

        {
          text,
          date:Date.now()
        }

    );


    save();

    input.value = "";

    $("#"+type+"List").innerHTML =
      renderList(
        type,
        state[type]
      );

    bindManager(type);

    toast("Guardado");

  };


  $$(
    `#${type}List [data-del]`
  )
  .forEach(

    b =>

      b.onclick = () => {

        state[type].splice(
          +b.dataset.del,
          1
        );

        save();

        $("#"+type+"List").innerHTML =
          renderList(
            type,
            state[type]
          );

        bindManager(type);

      }

  );


  $$(
    `#${type}List [data-done]`
  )
  .forEach(

    c =>

      c.onchange = () => {

        state[type][
          +c.dataset.done
        ].done =
          c.checked;

        save();

        $("#"+type+"List").innerHTML =
          renderList(
            type,
            state[type]
          );

        bindManager(type);

      }

  );

}


/* =========================================================
   VINCULAR HERRAMIENTAS
========================================================= */

function bindTool(id){

  if(
    [
      "length",
      "weight",
      "volume",
      "timeconv"
    ].includes(id)
  ){

    const factors = {

      length:{
        mm:.001,
        cm:.01,
        m:1,
        km:1000,
        in:.0254,
        ft:.3048
      },

      weight:{
        g:.001,
        kg:1,
        lb:.45359237,
        oz:.0283495231
      },

      volume:{
        ml:.001,
        l:1,
        "m³":1000
      },

      timeconv:{
        seg:1,
        min:60,
        h:3600,
        "día":86400
      }

    }[id];


    bindConverter(
      id,
      factors
    );

  }


  if(id === "calc"){

    $("#calcGo").onclick = () => {

      try{

        const s =
          $("#calcInput")
            .value
            .replace(
              /[^0-9+\-*/().% ]/g,
              ""
            );

        $("#calcResult").innerHTML =
          `<strong>${
            fmt(
              Function(
                "return ("+s+")"
              )()
            )
          }</strong>`;

      }catch{

        $("#calcResult").textContent =
          "Expresión no válida.";

      }

    };

  }


  if(id === "percent"){

    $("#percentGo").onclick = () => {

      $("#percentResult").innerHTML = `

        <strong>
          ${
            fmt(
              Number($("#p1").value) *
              Number($("#p2").value) /
              100
            )
          }
        </strong>

      `;

    };

  }


  if(id === "discount"){

    $("#discountGo").onclick = () => {

      const p =
        Number($("#d1").value);

      const d =
        Number($("#d2").value);

      const a =
        p*d/100;

      $("#discountResult").innerHTML = `

        Ahorro:
        <strong>
          ${fmt(a)}
        </strong>

        <br>

        Precio final:
        <strong>
          ${fmt(p-a)}
        </strong>

      `;

    };

  }


  if(id === "rule3"){

    $("#ruleGo").onclick = () => {

      const a =
        Number($("#r1").value);

      const b =
        Number($("#r2").value);

      const c =
        Number($("#r3").value);


      $("#ruleResult").innerHTML =

        a

          ?

          `<strong>
            X = ${fmt(b*c/a)}
          </strong>`

          :

          "A no puede ser 0.";

    };

  }


  if(id === "temp"){

    $("#tempGo").onclick = () => {

      $("#tempResult").innerHTML = `

        <strong>
          ${
            fmt(
              temp(
                Number(
                  $("#tv").value
                ),
                $("#tf").value,
                $("#tt").value
              )
            )
          }

          ${$("#tt").value}

        </strong>

      `;

    };

  }


  if(id === "currency"){

    $("#currencyGo").onclick =
      async () => {

        const amount =
          Number(
            $("#cv").value
          );

        const from =
          $("#cf").value;

        const to =
          $("#ct").value;

        const res =
          $("#currencyResult");


        res.textContent =
          "Consultando...";


        try{

          const r =
            await fetch(
              `https://open.er-api.com/v6/latest/${from}`
            );

          const d =
            await r.json();


          if(!d.rates[to])
            throw Error();


          const rate =
            d.rates[to];


          state.currencyCache[
            `${from}_${to}`
          ] = {
            rate,
            date:Date.now()
          };


          save();


          res.innerHTML = `

            <strong>
              ${fmt(amount*rate)} ${to}
            </strong>

            <br>

            <small>
              1 ${from} =
              ${fmt(rate)} ${to}
            </small>

          `;

        }catch{

          const cached =
            state.currencyCache[
              `${from}_${to}`
            ];


          if(cached){

            res.innerHTML = `

              <strong>
                ${fmt(
                  amount*cached.rate
                )} ${to}
              </strong>

              <br>

              <small>
                Último tipo guardado localmente.
              </small>

            `;

          }else{

            res.textContent =
              "No se pudo consultar ahora. Comprueba tu conexión.";

          }

        }

      };

  }


  if(id === "date"){

    $("#dateGo").onclick = () => {

      const a =
        new Date(
          $("#date1").value +
          "T00:00:00"
        );

      const b =
        new Date(
          $("#date2").value +
          "T00:00:00"
        );


      $("#dateResult").innerHTML = `

        <strong>
          ${
            Math.abs(
              Math.round(
                (b-a)/86400000
              )
            ).toLocaleString(
              "es-PE"
            )
          }

          días
        </strong>

      `;

    };

  }


  if(id === "age"){

    $("#ageGo").onclick = () => {

      const b =
        new Date(
          $("#birth").value +
          "T00:00:00"
        );

      const n =
        new Date();


      let y =
        n.getFullYear() -
        b.getFullYear();


      const md =
        n.getMonth() -
        b.getMonth();


      if(
        md < 0 ||
        (
          md === 0 &&
          n.getDate() < b.getDate()
        )
      ){

        y--;

      }


      $("#ageResult").innerHTML = `

        <strong>
          ${Math.max(0,y)} años
        </strong>

      `;

    };

  }


  if(id === "timer")
    bindTimer();


  if(id === "stopwatch")
    bindStopwatch();


  if(id === "password")
    bindPassword();


  if(id === "random"){

    $("#randGo").onclick = () => {

      let a =
        Number(
          $("#randMin").value
        );

      let b =
        Number(
          $("#randMax").value
        );


      if(a>b)
        [a,b]=[b,a];


      $("#randResult").innerHTML = `

        <strong>
          ${
            crypto.getRandomValues(
              new Uint32Array(1)
            )[0] %
            (b-a+1)
            + a
          }
        </strong>

      `;

    };


    $("#diceGo").onclick = () => {

      $("#randResult").innerHTML = `

        <strong>
          ${
            crypto.getRandomValues(
              new Uint32Array(1)
            )[0] % 6 + 1
          }
        </strong>

      `;

    };

  }


  if(id === "qr"){

    $("#qrGo").onclick = () => {

      const v =
        encodeURIComponent(
          $("#qrText")
            .value
            .trim()
        );


      if(!v) return;


      $("#qrResult").innerHTML = `

        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${v}"
          alt="Código QR"
          style="
            max-width:220px;
            border-radius:10px;
            background:#fff;
            padding:8px
          "
        >

      `;

    };

  }


  if(id === "text"){

    $("#countText").onclick = () => {

      const t =
        $("#textInput").value;


      $("#textResult").innerHTML = `

        Caracteres:
        <strong>
          ${t.length}
        </strong>

        <br>

        Palabras:
        <strong>
          ${
            t.trim()
              ? t.trim().split(/\s+/).length
              : 0
          }
        </strong>

      `;

    };


    $("#upperText").onclick =
      () =>
        $("#textInput").value =
          $("#textInput")
            .value
            .toUpperCase();


    $("#lowerText").onclick =
      () =>
        $("#textInput").value =
          $("#textInput")
            .value
            .toLowerCase();

  }


  if(id === "dictionary"){

    $("#dictGo").onclick =
      async () => {

        const w =
          $("#dictWord")
            .value
            .trim()
            .toLowerCase();

        const r =
          $("#dictResult");


        if(!w) return;


        r.textContent =
          "Buscando...";


        try{

          const x =
            await fetch(
              `https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(w)}`
            );


          if(!x.ok)
            throw Error();


          const d =
            await x.json();


          const meanings =
            (
              d[0].meanings || []
            ).slice(0,3);


          r.innerHTML = `

            <strong>
              ${esc(d[0].word)}
            </strong>

            ${
              meanings
                .map(
                  m => `

                    <p>

                      <b>
                        ${esc(
                          m.partOfSpeech || ""
                        )}
                      </b>

                      :

                      ${esc(
                        m.definitions?.[0]
                          ?.definition || ""
                      )}

                    </p>

                  `
                )
                .join("")
            }

          `;

        }catch{

          r.textContent =
            "No encontramos esa palabra.";

        }

      };

  }


  if(id === "tip"){

    $("#tipGo").onclick = () => {

      const b =
        Number(
          $("#tipBill").value
        );

      const p =
        Number(
          $("#tipPct").value
        );

      const tip =
        b*p/100;


      $("#tipResult").innerHTML = `

        Propina:
        <strong>
          ${fmt(tip)}
        </strong>

        <br>

        Total:
        <strong>
          ${fmt(b+tip)}
        </strong>

      `;

    };

  }


  if(id === "split"){

    $("#splitGo").onclick = () => {

      const t =
        Number(
          $("#splitTotal").value
        );

      const n =
        Math.max(
          1,
          Number(
            $("#splitPeople").value
          )
        );

      const p =
        Number(
          $("#splitTip").value
        );


      const total =
        t*(1+p/100);


      $("#splitResult").innerHTML = `

        Total con propina:
        <strong>
          ${fmt(total)}
        </strong>

        <br>

        Por persona:
        <strong>
          ${fmt(total/n)}
        </strong>

      `;

    };

  }


  if(id === "change"){

    $("#changeGo").onclick = () => {

      const a =
        Number(
          $("#chgA").value
        );

      const b =
        Number(
          $("#chgB").value
        );


      if(a === 0){

        $("#changeResult").textContent =
          "El valor inicial no puede ser 0.";

        return;

      }


      const p =
        (b-a) /
        Math.abs(a) *
        100;


      $("#changeResult").innerHTML = `

        Cambio:
        <strong>
          ${fmt(p)}%
        </strong>

        <br>

        ${p>=0
          ? "Aumento"
          : "Disminución"
        }

      `;

    };

  }


  if(id === "fuel"){

    $("#fuelGo").onclick = () => {

      const km =
        Number(
          $("#fuelKm").value
        );

      const eff =
        Number(
          $("#fuelEff").value
        );

      const price =
        Number(
          $("#fuelPrice").value
        );


      if(eff <= 0){

        $("#fuelResult").textContent =
          "El rendimiento debe ser mayor que 0.";

        return;

      }


      const liters =
        km/eff;


      $("#fuelResult").innerHTML = `

        Combustible:
        <strong>
          ${fmt(liters)} L
        </strong>

        <br>

        Costo estimado:
        <strong>
          ${fmt(liters*price)}
        </strong>

      `;

    };

  }


  if(id === "calendar"){

    $("#calGo").onclick = () => {

      const y =
        Number(
          $("#calYear").value
        );

      const m =
        Number(
          $("#calMonth").value
        );


      if(
        m < 1 ||
        m > 12
      ){

        $("#calResult").textContent =
          "Mes inválido.";

        return;

      }


      const names = [
        "DOM",
        "LUN",
        "MAR",
        "MIÉ",
        "JUE",
        "VIE",
        "SÁB"
      ];


      const first =
        new Date(
          y,
          m-1,
          1
        ).getDay();


      const days =
        new Date(
          y,
          m,
          0
        ).getDate();


      let out =
        names.join(" ") +
        "\n";


      out +=
        "    ".repeat(first);


      for(
        let d=1;
        d<=days;
        d++
      ){

        out +=
          String(d)
            .padStart(3," ") +
          " ";


        if(
          (first+d)%7 === 0
        ){

          out += "\n";

        }

      }


      $("#calResult").textContent =
        out;

    };

  }


  if(id === "color"){

    $("#colorGo").onclick = () => {

      let h =
        $("#hexColor")
          .value
          .trim()
          .replace("#","");


      if(
        !/^[0-9a-fA-F]{6}$/.test(h)
      ){

        $("#colorResult").textContent =
          "Usa un HEX de 6 caracteres, por ejemplo #22d3ee.";

        return;

      }


      const r =
        parseInt(
          h.slice(0,2),
          16
        );

      const g =
        parseInt(
          h.slice(2,4),
          16
        );

      const b =
        parseInt(
          h.slice(4,6),
          16
        );


      $("#colorResult").innerHTML = `

        <span
          class="color-chip"
          style="background:#${h}"
        ></span>

        HEX

        <strong>
          #${h.toUpperCase()}
        </strong>

        <br>

        RGB

        <strong>
          rgb(${r}, ${g}, ${b})
        </strong>

      `;

    };

  }


  if(id === "focus"){

    $("#openFocusFromTool").onclick =
      () => {

        closeModal();

        openFocus();

      };

  }


  if(
    [
      "notes",
      "tasks",
      "shopping"
    ].includes(id)
  ){

    bindManager(id);

  }

}


/* =========================================================
   TEMPERATURA
========================================================= */

function temp(
  v,
  from,
  to
){

  let c =
    from === "°C"
      ? v
      : from === "°F"
        ? (v-32)*5/9
        : v-273.15;


  return
    to === "°C"
      ? c
      : to === "°F"
        ? c*9/5+32
        : c+273.15;

}


/* =========================================================
   TEMPORIZADOR
========================================================= */

function bindTimer(){

  $("#timerStart").onclick = () => {

    clearInterval(
      timerInterval
    );


    let sec =
      Number(
        $("#tm").value || 0
      ) * 60

      +

      Number(
        $("#ts").value || 0
      );


    timerEnd =
      Date.now() +
      sec*1000;


    const tick = () => {

      let left =
        Math.max(
          0,
          timerEnd-Date.now()
        );


      $("#timerResult").innerHTML = `

        <strong>
          ${formatMs(left)}
        </strong>

      `;


      if(left <= 0){

        clearInterval(
          timerInterval
        );

        toast(
          "Temporizador terminado"
        );

      }

    };


    tick();

    timerInterval =
      setInterval(
        tick,
        100
      );

  };


  $("#timerStop").onclick =
    () =>
      clearInterval(
        timerInterval
      );

}


/* =========================================================
   CRONÓMETRO
========================================================= */

function bindStopwatch(){

  $("#swStart").onclick = () => {

    if(stopwatchInterval)
      return;


    stopwatchStart =
      Date.now() -
      stopwatchElapsed;


    stopwatchInterval =
      setInterval(
        () => {

          stopwatchElapsed =
            Date.now() -
            stopwatchStart;


          $("#swResult").innerHTML = `

            <strong>
              ${formatMs(
                stopwatchElapsed,
                true
              )}
            </strong>

          `;

        },
        100
      );

  };


  $("#swStop").onclick = () => {

    clearInterval(
      stopwatchInterval
    );

    stopwatchInterval = null;

  };


  $("#swReset").onclick = () => {

    clearInterval(
      stopwatchInterval
    );

    stopwatchInterval = null;

    stopwatchElapsed = 0;

    $("#swResult").innerHTML =
      "<strong>00:00.0</strong>";

  };

}


/* =========================================================
   FORMATO DE TIEMPO
========================================================= */

function formatMs(
  ms,
  decimal=false
){

  const s =
    Math.floor(
      ms/1000
    );

  const m =
    Math.floor(
      s/60
    );

  const ss =
    s%60;


  return (

    `${String(m).padStart(2,"0")}:` +

    `${String(ss).padStart(2,"0")}` +

    (
      decimal
        ? "." +
          Math.floor(
            (ms%1000)/100
          )
        : ""
    )

  );

}


/* =========================================================
   CONTRASEÑAS
========================================================= */

function bindPassword(){

  $("#passGo").onclick = () => {

    let n =
      Math.max(
        4,
        Math.min(
          128,
          Number(
            $("#passLen").value
          ) || 16
        )
      );


    let chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";


    if(
      $("#passSymbols").checked
    ){

      chars +=
        "!@#$%^&*_-+=?";

    }


    let out = "";


    const arr =
      new Uint32Array(n);


    crypto.getRandomValues(
      arr
    );


    for(
      let i=0;
      i<n;
      i++
    ){

      out +=
        chars[
          arr[i] %
          chars.length
        ];

    }


    $("#passResult").textContent =
      out;

  };


  $("#passCopy").onclick =
    async () => {

      await navigator.clipboard.writeText(
        $("#passResult").textContent
      );

      toast("Copiado");

    };

}


/* =========================================================
   EVENTOS PRINCIPALES
========================================================= */

$("#globalSearch").oninput =
  renderTools;


$("#clearSearch").onclick = () => {

  $("#globalSearch").value = "";

  renderTools();

  $("#globalSearch").focus();

};


$("#randomToolBtn").onclick = () => {

  const t =
    tools[
      Math.floor(
        Math.random() *
        tools.length
      )
    ];

  openTool(t.id);

};


$("#themeBtn").onclick = () => {

  state.theme =
    state.theme === "dark"
      ? "light"
      : "dark";

  applyTheme();

  save();

};


$("#motionBtn").onclick = () => {

  state.motion =
    !state.motion;

  applyMotion();

  save();

};


/* =========================================================
   EXPORTAR
========================================================= */

$("#exportBtn").onclick = () => {

  const blob =
    new Blob(
      [
        JSON.stringify(
          state,
          null,
          2
        )
      ],
      {
        type:"application/json"
      }
    );


  const a =
    document.createElement("a");


  a.href =
    URL.createObjectURL(
      blob
    );


  a.download =
    "utilhub-v16-datos.json";


  a.click();


  URL.revokeObjectURL(
    a.href
  );


  toast(
    "Datos exportados"
  );

};


/* =========================================================
   IMPORTAR
========================================================= */

$("#importInput").onchange =
  async e => {

    try{

      const data =
        JSON.parse(
          await e.target.files[0].text()
        );


      state = {
        ...DEFAULT,
        ...data
      };


      save();

      applyTheme();

      applyMotion();

      renderTools();

      toast(
        "Datos importados"
      );

    }catch{

      toast(
        "Archivo no válido"
      );

    }

  };


/* =========================================================
   RESET
========================================================= */

$("#resetBtn").onclick = () => {

  if(
    confirm(
      "¿Borrar todos los datos locales de ÚtilHub?"
    )
  ){

    state = {
      ...DEFAULT
    };

    save();

    renderTools();

    toast(
      "Datos restablecidos"
    );

  }

};


/* =========================================================
   TEMA
========================================================= */

function applyTheme(){

  document.body.classList.toggle(
    "light",
    state.theme === "light"
  );


  $("#themeBtn").textContent =
    state.theme === "light"
      ? "☀"
      : "☾";

}


/* =========================================================
   ANIMACIONES
========================================================= */

function applyMotion(){

  document.body.classList.toggle(
    "no-motion",
    !state.motion
  );


  $("#motionBtn").textContent =
    state.motion
      ? "✦"
      : "⏸";

}


/* =========================================================
   NOVA FLOW
========================================================= */

function setupNovaFlow(){

  const canvas =
    $("#nova-canvas");


  const ctx =
    canvas.getContext("2d");


  let w;

  let h;

  let dpr;

  let particles = [];

  let mouse = {
    x:-9999,
    y:-9999
  };


  function resize(){

    dpr =
      Math.min(
        devicePixelRatio || 1,
        2
      );


    w =
      innerWidth;

    h =
      innerHeight;


    canvas.width =
      w*dpr;

    canvas.height =
      h*dpr;


    canvas.style.width =
      w+"px";

    canvas.style.height =
      h+"px";


    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    particles =
      Array.from(
        {
          length:
            Math.min(
              95,
              Math.floor(
                w*h/15000
              )
            )
        },

        () => ({

          x:
            Math.random()*w,

          y:
            Math.random()*h,

          vx:
            (Math.random()-.5)*.22,

          vy:
            (Math.random()-.5)*.22,

          r:
            Math.random()*1.6+.4,

          a:
            Math.random()*.6+.15

        })
      );

  }


  function draw(){

    ctx.clearRect(
      0,
      0,
      w,
      h
    );


    if(!state.motion){

      requestAnimationFrame(
        draw
      );

      return;

    }


    for(
      const p of particles
    ){

      p.x += p.vx;

      p.y += p.vy;


      if(
        p.x < 0 ||
        p.x > w
      ){

        p.vx *= -1;

      }


      if(
        p.y < 0 ||
        p.y > h
      ){

        p.vy *= -1;

      }


      const dx =
        mouse.x-p.x;

      const dy =
        mouse.y-p.y;

      const dist =
        Math.hypot(
          dx,
          dy
        );


      if(
        dist < 130 &&
        dist > 0
      ){

        p.x -=
          dx/dist*.12;

        p.y -=
          dy/dist*.12;

      }


      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        p.r,
        0,
        Math.PI*2
      );

      ctx.fillStyle =
        `rgba(
          80,
          210,
          255,
          ${p.a}
        )`;

      ctx.fill();

    }


    for(
      let i=0;
      i<particles.length;
      i++
    ){

      for(
        let j=i+1;
        j<particles.length;
        j++
      ){

        const a =
          particles[i];

        const b =
          particles[j];

        const d =
          Math.hypot(
            a.x-b.x,
            a.y-b.y
          );


        if(d < 95){

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
            `rgba(
              80,
              170,
              255,
              ${.10*(1-d/95)}
            )`;


          ctx.stroke();

        }

      }

    }


    requestAnimationFrame(
      draw
    );

  }


  addEventListener(
    "resize",
    resize
  );


  addEventListener(
    "pointermove",
    e => {

      mouse.x =
        e.clientX;

      mouse.y =
        e.clientY;

    }
  );


  resize();

  draw();

}


/* =========================================================
   INICIO
========================================================= */

$$("[data-open]")
  .forEach(
    b =>
      b.onclick =
        () =>
          openTool(
            b.dataset.open
          )
  );


applyTheme();

applyMotion();

renderCategories();

renderTools();

updateStats();

setupNovaFlow();


/* =========================================================
   NOVA COMMAND
========================================================= */

function renderCommands(
  filter=""
){

  const q =
    filter
      .toLowerCase()
      .trim();


  const list =
    tools
      .filter(
        t =>
          !q ||
          `${t.title} ${t.desc} ${t.cat}`
            .toLowerCase()
            .includes(q)
      )
      .slice(0,12);


  $("#commandList").innerHTML =

    list
      .map(
        t => `

          <button
            class="command-item"
            data-command-tool="${t.id}"
          >

            <span>
              ${t.icon}
            </span>

            <div>

              <b>
                ${esc(t.title)}
              </b>

              <small>
                ${esc(t.cat)}
                ·
                ${esc(t.desc)}
              </small>

            </div>

            <kbd>
              ↵
            </kbd>

          </button>

        `
      )
      .join("")

      ||

      `
        <div class="muted command-empty">
          No hay coincidencias.
        </div>
      `;


  $$("#commandList [data-command-tool]")
    .forEach(

      b =>

        b.onclick = () => {

          closeCommand();

          openTool(
            b.dataset.commandTool
          );

        }

    );

}


function openCommand(){

  $("#commandPalette")
    .classList
    .add("open");


  $("#commandPalette")
    .setAttribute(
      "aria-hidden",
      "false"
    );


  $("#commandInput").value = "";

  renderCommands();


  setTimeout(
    () =>
      $("#commandInput").focus(),
    30
  );

}


function closeCommand(){

  $("#commandPalette")
    .classList
    .remove("open");


  $("#commandPalette")
    .setAttribute(
      "aria-hidden",
      "true"
    );

}


/* =========================================================
   NOVA FOCUS
========================================================= */

function openFocus(){

  document.body.classList.add(
    "focus-active"
  );


  $("#focusOverlay")
    .classList
    .add("open");


  $("#focusOverlay")
    .setAttribute(
      "aria-hidden",
      "false"
    );


  focusTick();

}


function closeFocus(){

  clearInterval(
    window.novaFocusTimer
  );


  document.body.classList.remove(
    "focus-active"
  );


  $("#focusOverlay")
    .classList
    .remove("open");


  $("#focusOverlay")
    .setAttribute(
      "aria-hidden",
      "true"
    );

}


let focusEnd = 0;

let focusPaused =
  25*60*1000;


function focusTick(){

  clearInterval(
    window.novaFocusTimer
  );


  const tick = () => {

    const left =
      Math.max(
        0,
        focusEnd
          ? focusEnd-Date.now()
          : focusPaused
      );


    $("#focusClock").textContent =
      formatMs(left);


    if(
      focusEnd &&
      left <= 0
    ){

      clearInterval(
        window.novaFocusTimer
      );


      focusEnd = 0;

      focusPaused =
        25*60*1000;


      toast(
        "Sesión NOVA completada ✦"
      );

    }

  };


  tick();


  window.novaFocusTimer =
    setInterval(
      tick,
      250
    );

}


$("#commandBtn").onclick =
  openCommand;


$("#focusBtn").onclick =
  openFocus;


$("#pulseBtn").onclick =
  () => {

    const c =
      $("#novaCore");


    c.classList.remove(
      "nova-pulse"
    );


    void c.offsetWidth;


    c.classList.add(
      "nova-pulse"
    );


    toast(
      "Pulso NOVA activado"
    );

  };


$$("[data-close-command]")
  .forEach(
    x =>
      x.onclick =
        closeCommand
  );


$("#commandInput").oninput =
  e =>
    renderCommands(
      e.target.value
    );


$("#focusStart").onclick =
  () => {

    if(!focusEnd){

      focusEnd =
        Date.now() +
        focusPaused;

    }

    focusTick();

  };


$("#focusPause").onclick =
  () => {

    if(focusEnd){

      focusPaused =
        Math.max(
          0,
          focusEnd-Date.now()
        );

      focusEnd = 0;

    }


    clearInterval(
      window.novaFocusTimer
    );


    focusTick();

  };


$("#focusReset").onclick =
  () => {

    focusEnd = 0;

    focusPaused =
      (
        Number(
          state.focusMinutes
        ) || 25
      ) * 60000;


    focusTick();

  };


$("#focusClose").onclick =
  closeFocus;


/* =========================================================
   ATAJOS DE TECLADO
========================================================= */

window.addEventListener(
  "keydown",
  e => {

    if(
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "k"
    ){

      e.preventDefault();

      openCommand();

    }


    if(
      e.key === "Escape"
    ){

      closeCommand();


      if(
        $("#modal")
          .classList
          .contains("open")
      ){

        closeModal();

      }

    }

  }
);


/* =========================================================
   PARALLAX NOVA
========================================================= */

window.addEventListener(
  "pointermove",
  e => {

    if(!state.motion)
      return;


    const core =
      $("#novaCore");


    if(!core)
      return;


    const x =
      (
        e.clientX/
        innerWidth-
        .5
      )*8;


    const y =
      (
        e.clientY/
        innerHeight-
        .5
      )*8;


    core.style.setProperty(
      "--mx",
      x+"px"
    );


    core.style.setProperty(
      "--my",
      y+"px"
    );

  },
  {
    passive:true
  }
);


/* =========================================================
   SERVICE WORKER
========================================================= */

if(
  "serviceWorker" in navigator
){

  navigator.serviceWorker
    .register("./sw.js")
    .catch(
      () => {}
    );

}

})();

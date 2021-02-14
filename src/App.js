import { utcToZonedTime } from "date-fns-tz"
import axios from "axios";
import Calendar from "react-calendar";
import React, { useEffect, useState } from "react";
import "./App.css";
import "./Calendar.css";
import Check from "./check.gif"

function App() {
  const today = utcToZonedTime(new Date(), 'America/Sao_Paulo');
  const [date, setDate] = useState(today);
  const [lastYearFetched, setLastYearFetched] = useState(null);
  const [readings, setReadings] = useState([]);
  const [helpOpened, setHelpOpened] = useState(false);
  const [userProgress, setUserProgress] = useState(0);
  const [yearProgress, setYearProgress] = useState(0);
  const [userHistory, setUserHistory] = useState(
    localStorage.getItem("history")
      ? JSON.parse(localStorage.getItem("history"))
      : []
  );
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);

  useEffect(() => {
    let selectedYear = date.getFullYear();
    let history = localStorage.getItem("history")
      ? JSON.parse(localStorage.getItem("history"))
      : [];

    setUserProgress(history.length);

    if (selectedYear !== lastYearFetched) {
      axios.get(`${selectedYear}.json`)
        .then(res => {
          setReadings(res.data);
          setLastYearFetched(selectedYear);
        })
        .catch(() => setReadings([]));
    }
  }, [date, lastYearFetched])

  function verifyDay({ date }) {
    if (readings[formatDateToString(date)] === null) {
      return "completed-day";
    }

    if (
      userHistory[formatDateToString(date)]
      && userHistory[formatDateToString(date)][1] !== null
      && userHistory[formatDateToString(date)][2] !== null
    ) {
      return "completed-day";
    }
  }

  function formatDateToString(date) {
    return date.toLocaleDateString().split("/").reverse().join("-");
  }

  function toggleCheckbox(number) {
    if (number === 1) {
      if (!checkbox1) {
        userHistory[formatDateToString(date)][1] = utcToZonedTime(new Date(), 'America/Sao_Paulo');
      } else {

      }
      return;
    }


  }

  function importHistory(e) {
    var file = e.target.files[0];

    if (file.type === "text/plain") {
      var reader = new FileReader();

      reader.readAsText(file);

      reader.onload = (ev) => {
        let text = ev.target.result;
        let json = JSON.parse(text);

        if (
          Object.keys(json).length > 0
          && new Date(Object.keys(json)[0]) instanceof Date
        ) {
          localStorage.setItem("history", text);
          setUserHistory(json);
        }
      };
    }
  }

  function exportHistory() {

  }

  return (
    <div className="App">
      <div id="background"></div>

      <div id="container">
        <div>
          <h1>Leitura Bíblica</h1>

          <Calendar
            onChange={date => setDate(date)}
            value={date}
            calendarType="US"
            tileClassName={verifyDay}
            showNeighboringMonth={false}
          />



          {
            readings[formatDateToString(date)]
              && readings[formatDateToString(date)] !== null
              ?
              <section id="content">
                <article>
                  <header>
                    <h2>
                      Leitura de <span id="text1">
                        {readings[formatDateToString(date)][1]}
                      </span>
                    </h2>
                  </header>

                  <div className="checkbox-div">
                    <input type="checkbox" name="checkbox1" id="checkbox1" checked={checkbox1} onChange={() => {
                      setCheckbox1(!checkbox1);
                      toggleCheckbox(1);
                    }} />

                    <label id="label1" htmlFor="checkbox1">
                      {
                        userHistory[formatDateToString(date)]
                          ? <span>
                            Concluída em<br />
                            {new Date(userHistory[formatDateToString(date)][1]).toLocaleString("pt-BR")}
                          </span>
                          : "Pendente"
                      }
                    </label>
                  </div>
                </article>

                <article>
                  <header>
                    <h2>
                      Leitura de <span id="text2">
                        {readings[formatDateToString(date)][2]}
                      </span>
                    </h2>
                  </header>

                  <div className="checkbox-div">
                    <input type="checkbox" name="checkbox2" id="checkbox2" checked={checkbox2} onChange={() => {
                      setCheckbox2(!checkbox2);
                      toggleCheckbox(2);
                    }} />

                    <label id="label2" htmlFor="checkbox2">
                      {
                        userHistory[formatDateToString(date)]
                          ? <span>
                            Concluída em<br />
                            {new Date(userHistory[formatDateToString(date)][2]).toLocaleString("pt-BR")}
                          </span>
                          : "Pendente"
                      }
                    </label>
                  </div>
                </article>
              </section>
              :
              <div id="no-content">
                <p>
                  Sem texto previsto para hoje.<br />
                  Aproveite para recapitular algo ou colocar sua leitura em dia.
              </p>
              </div>
          }
        </div>

        <footer>
          <div id="progress">
            <div>
              <b>{userProgress}</b> de <span><b>{yearProgress}</b> dias concluídos</span>
            </div>
            <img id="badge" src={Check} alt="Check" />
          </div>

          <div className="backup">
            <button id="export" onClick={exportHistory}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Exportar
            </button>

            <label id="import">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>

              Importar

              <input type="file" name="importInput" id="importInput" accept="text/plain"
                onChange={importHistory} />
            </label>
          </div>

          <div>
            Desenvolvido por <a href="https://www.ibasp.org.br" target="_blank" rel="noopener noreferrer">IBASP</a>
          </div>

          <button id="helpButton"
            onClick={e => {
              e.preventDefault();
              setHelpOpened(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </footer>

        <div id="help" style={{
          left: helpOpened ? 0 : "-100%"
        }}>
          <div className="content">
            <h2>Ajuda</h2>

            <h3>Como instalar no seu celular</h3>

            <h4>Android</h4>

            <ul>
              <li>
                Utilize preferencialmente o navegador Google Chrome ou Mozilla Firefox.
              </li>

              <li>
                Ao abrir o site, aparecerá a leitura do dia.
              </li>

              <li>
                Depois de alguns segundos, no rodapé, aparecerá a mensagem “Adicionar o app Leitura Bíblica à
                tela inicial”.
              </li>

              <li>
                Clique nela e, em seguida, em “Instalar”.
              </li>

              <li>
                O atalho será criado automaticamente na tela inicial do celular após alguns segundos.
              </li>

              <li>
                Caso a mensagem não apareça, clique no ícone na lateral direita superior (três bolinhas).
                Lá, vai aparecer a mensagem “adicionar à tela inicial” no Google Chrome, ou “Instalar” no
                Mozilla Firefox.
              </li>
            </ul>

            <h4>iOS</h4>

            <ul>
              <li>
                Utilize preferencialmente o navegador Safari ou Google Chrome.
              </li>

              <li>
                Aparecerá a leitura do dia.
              </li>

              <li>
                Clique no botão de compartilhar e, na sequência, em “adicionar à tela de início”.
              </li>
            </ul>

            <h3>
              Preciso trocar de celular – como faço para não perder meus registros?
            </h3>

            <p>
              Os dados do seu controle de leitura ficam registrados no próprio celular, por isso não temos como
              recuperar dados perdidos.
            </p>

            <p>
              Se você trocar de celular, dá para fazer um backup para ser importado no aparelho novo, seguindo os
              passos abaixo:
            </p>

            <ol>
              <li>
                No celular antigo, clique no botão “Exportar” e salve o arquivo em seu aparelho. (É bom anotar o
                nome
                do arquivo e o local exato em que ficou gravado.)
              </li>

              <li>
                Transfira o arquivo salvo para o novo aparelho (por cabo ou nuvem).
              </li>

              <li>
                No celular novo, abra este site no seu smartphone ou tablet (preferencialmente Google Chrome
                ou Mozilla Firefox).
              </li>

              <li>
                Aparecerá a leitura do dia.
              </li>

              <li>
                Clique no botão “Importar” e siga os passos indicados. (Obs.: seu arquivo de dados já precisa
                estar
                salvo no celular novo.)
              </li>
            </ol>

            <p>
              Obs.: No iOS, a função exportar precisa do iOS 13 ou superior. Caso a sua versão seja inferior,
              copie o texto que aparece ao clicar em Exportar e salve em um arquivo txt. Isto equivale ao passo
              1.
            </p>

            {
              helpOpened &&
              <button id="helpCloseButton" onClick={() => setHelpOpened(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

(() => {
  const POINTS_PER_HIT = 10;
  const questions = window.IIQUIZ_QUESTIONS;

  const screens = {
    start: document.getElementById("screen-start"),
    quiz: document.getElementById("screen-quiz"),
    result: document.getElementById("screen-result"),
  };

  const els = {
    startBtn: document.getElementById("btn-start"),
    counter: document.getElementById("question-counter"),
    liveScore: document.getElementById("live-score"),
    progressBar: document.getElementById("progress-bar"),
    progressFill: document.getElementById("progress-fill"),
    questionText: document.getElementById("question-text"),
    options: document.getElementById("options"),
    feedback: document.getElementById("feedback"),
    nextBtn: document.getElementById("btn-next"),
    resultTitle: document.getElementById("result-title"),
    resultScore: document.getElementById("result-score"),
    resultMessage: document.getElementById("result-message"),
    restartBtn: document.getElementById("btn-restart"),
    shareBtn: document.getElementById("btn-share"),
    shareStatus: document.getElementById("share-status"),
    sharePreview: document.getElementById("share-preview"),
    sharePreviewLabel: document.getElementById("share-preview-label"),
  };

  let index = 0;
  let score = 0;
  let answered = false;

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      const active = key === name;
      el.hidden = !active;
      el.classList.toggle("screen--active", active);
    });
  }

  function getRank(points) {
    if (points >= 90) {
      return {
        title: "iiMaster",
        message:
          "Excelente! Você domina os fundamentos de tecnologia e entende o impacto digital nas cidades e empresas.",
      };
    }
    if (points >= 70) {
      return {
        title: "Analista",
        message:
          "Muito bem! Você tem boa base em tech. Com um pouco mais de prática, chega ao topo.",
      };
    }
    if (points >= 40) {
      return {
        title: "Explorador",
        message:
          "Bom começo! Continue explorando — a tecnologia fica mais clara a cada pergunta.",
      };
    }
    return {
      title: "Iniciante",
      message:
        "Todo especialista já foi iniciante. Jogue de novo e fortaleça seus conhecimentos!",
    };
  }

  function renderQuestion() {
    const current = questions[index];
    answered = false;

    els.counter.textContent = `Pergunta ${index + 1} de ${questions.length}`;
    els.liveScore.textContent = `${score} pts`;
    els.progressBar.setAttribute("aria-valuenow", String(index + 1));
    els.progressFill.style.width = `${((index + 1) / questions.length) * 100}%`;

    els.questionText.textContent = current.question;
    els.options.innerHTML = "";
    els.feedback.hidden = true;
    els.feedback.textContent = "";
    els.feedback.className = "feedback";
    els.nextBtn.hidden = true;
    els.nextBtn.textContent =
      index === questions.length - 1 ? "Ver resultado" : "Próxima";

    current.options.forEach((label, optionIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.textContent = label;
      button.addEventListener("click", () => handleAnswer(optionIndex));
      els.options.appendChild(button);
    });
  }

  function handleAnswer(optionIndex) {
    if (answered) return;
    answered = true;

    const current = questions[index];
    const buttons = [...els.options.querySelectorAll(".option")];
    const correct = optionIndex === current.answer;

    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === current.answer) {
        btn.classList.add("option--correct");
      } else if (i === optionIndex && !correct) {
        btn.classList.add("option--wrong");
      } else {
        btn.classList.add("option--dim");
      }
    });

    if (correct) {
      score += POINTS_PER_HIT;
      els.feedback.textContent = "Resposta correta!";
      els.feedback.classList.add("feedback--ok");
    } else {
      els.feedback.textContent = "Resposta incorreta.";
      els.feedback.classList.add("feedback--err");
    }

    els.liveScore.textContent = `${score} pts`;
    els.feedback.hidden = false;
    els.nextBtn.hidden = false;
    els.nextBtn.focus();
  }

  function resetShareUI() {
    els.shareStatus.hidden = true;
    els.shareStatus.textContent = "";
    els.sharePreview.hidden = true;
    els.sharePreviewLabel.hidden = true;
    els.sharePreview.value = "";
  }

  function showResult() {
    const rank = getRank(score);
    els.resultTitle.textContent = rank.title;
    els.resultScore.textContent = `${score} / ${questions.length * POINTS_PER_HIT}`;
    els.resultMessage.textContent = rank.message;
    resetShareUI();
    showScreen("result");
  }

  function startQuiz() {
    index = 0;
    score = 0;
    showScreen("quiz");
    renderQuestion();
  }

  function nextStep() {
    if (!answered) return;
    index += 1;
    if (index >= questions.length) {
      showResult();
      return;
    }
    renderQuestion();
  }

  function buildShareMessage() {
    const acertos = score / POINTS_PER_HIT;
    return [
      `Acertei ${acertos} de ${questions.length} perguntas no iiQuiz da iiBrasil!`,
      "Você consegue superar minha pontuação?",
      "",
      window.location.href,
    ].join("\n");
  }

  function showSharePreview(message) {
    els.sharePreview.value = message;
    els.sharePreview.hidden = false;
    els.sharePreviewLabel.hidden = false;
    els.sharePreview.focus();
    els.sharePreview.select();
  }

  function copyFullMessage(message) {
    showSharePreview(message);

    try {
      const selected = document.getSelection();
      const range = document.createRange();
      range.selectNodeContents(els.sharePreview);
      selected.removeAllRanges();
      selected.addRange(range);
      els.sharePreview.select();
      els.sharePreview.setSelectionRange(0, message.length);
      return document.execCommand("copy");
    } catch (error) {
      return false;
    }
  }

  async function shareResult() {
    const fullMessage = buildShareMessage();
    let copied = copyFullMessage(fullMessage);

    if (!copied && navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(fullMessage);
        copied = true;
        showSharePreview(fullMessage);
      } catch (error) {
        copied = false;
      }
    }

    if (copied) {
      els.shareStatus.textContent =
        "Mensagem copiada! Cole no WhatsApp, Instagram ou onde quiser.";
      els.shareStatus.hidden = false;
      return;
    }

    els.shareStatus.textContent =
      "Selecione o texto abaixo e copie (Ctrl+C ou toque longo).";
    els.shareStatus.hidden = false;
    showSharePreview(fullMessage);
  }

  els.startBtn.addEventListener("click", startQuiz);
  els.nextBtn.addEventListener("click", nextStep);
  els.restartBtn.addEventListener("click", startQuiz);
  els.shareBtn.addEventListener("click", shareResult);

  showScreen("start");
})();

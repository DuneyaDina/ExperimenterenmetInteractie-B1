let model, webcam, labelContainer, maxPredictions;
let lastQuoteTime = 0;

// === GELUIDEN ===
const sounds = {
  other: new Audio("my_sounds/andWhatThisSupposedTeBe.mp3"),
  neutral: new Audio("my_sounds/icantseet.mp3"),
  ball: new Audio("my_sounds/foodAmazing.mp3")
};

// === AFBEELDINGEN ===
const images = {
  eyeNormal: "my_images/eye_normal.png",
  eyeRight: "my_images/eye_right.png",
  eyeHeart: "my_images/eye_heart.png",
  mouthClosed: "my_images/mouth_closed.png",
  mouthOpen: "my_images/mouth_open.png"
};

// === QUOTES ===
const ballQuotes = [
  "Jaaaaa! Dat wil ik! Gooi hem naar mij! 🏀",
  "Oeh een bal! Kom maar hier! 😍",
  "Yesss, ik zie hem! Mag ik spelen? ⚽",
  "Wat een mooie bal, ik wil hem hebben! 💖",
  "Wacht even... is dat echt voor mij? 😲"
];
const otherQuotes = [
  "Hmm... dat is geen bal. Wat is dat dan? 🤔",
  "Ik dacht dat het een bal was... oh nee 😅",
  "Dat lijkt verdacht op iets ronds... of toch niet?",
  "Ik wacht op iets leuks om te spelen! 🎯",
  "Hé, ik wil een bal zien, geen gekke dingen 😝"
];
const neutralQuotes = [
  "Ik heb honger... kan je wat geven? 🍪",
  "Hellooo? Waar is iedereen? 😴",
  "Ik verveel me... laat me iets leuks zien! 😩",
  "Ben ik alleen hier? 🥺",
  "Kom op, geef me wat om naar te kijken! 👀"
];

const randomQuote = arr => arr[Math.floor(Math.random() * arr.length)];

// === INIT FUNCTIE ===
async function init() {
  const URL = "https://teachablemachine.withgoogle.com/models/1xWKZOAXe/"; // <-- je model map in je project

  labelContainer = document.getElementById("label-container");
  const webcamContainer = document.getElementById("webcam-container");
  const eyeDiv = document.getElementById("eye-display");
  const mouthDiv = document.getElementById("mouth-display");
  const predText = document.getElementById("prediction");

  // Start neutraal
  eyeDiv.innerHTML = `<img src="${images.eyeNormal}" alt="eye">`;
  mouthDiv.innerHTML = `<img src="${images.mouthClosed}" alt="mouth">`;

  // === GELUID ONTBLOKKEN ===
  document.body.addEventListener("click", () => {
    Object.values(sounds).forEach(sound => sound.play().then(() => sound.pause()));
    console.log("Geluiden geactiveerd ✅");
  }, { once: true });

  // === MODEL LADEN ===
  try {
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = model.getTotalClasses();
    console.log("Model geladen!");
  } catch (err) {
    console.error("Model load error:", err);
    return;
  }

  // === WEBCAM INSTELLEN ===
  webcam = new tmImage.Webcam(400, 300, true);
  await webcam.setup();
  await webcam.play();
  webcamContainer.appendChild(webcam.canvas);

  // Maak label-divs
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  // === PREDICTIE FUNCTIE ===
  async function predict() {
    const prediction = await model.predict(webcam.canvas);
    prediction.forEach((p, i) => {
      labelContainer.childNodes[i].innerHTML = `${p.className}: ${p.probability.toFixed(2)}`;
    });

    const best = prediction.reduce((a, b) => (a.probability > b.probability ? a : b));
    const label = best.className;
    const prob = best.probability;

    const now = Date.now();
    if (now - lastQuoteTime > 3000) {
      if (label === "Rond" && prob > 0.5) {
        eyeDiv.innerHTML = `<img src="${images.eyeHeart}" alt="eye">`;
        mouthDiv.innerHTML = `<img src="${images.mouthOpen}" alt="mouth">`;
        predText.innerText = randomQuote(ballQuotes);
        sounds.ball.currentTime = 0;
        sounds.ball.play();
      } else if (prob > 0.8) {
        eyeDiv.innerHTML = `<img src="${images.eyeRight}" alt="eye">`;
        mouthDiv.innerHTML = `<img src="${images.mouthClosed}" alt="mouth">`;
        predText.innerText = randomQuote(otherQuotes);
        sounds.other.currentTime = 0;
        sounds.other.play();
      } else {
        eyeDiv.innerHTML = `<img src="${images.eyeNormal}" alt="eye">`;
        mouthDiv.innerHTML = `<img src="${images.mouthClosed}" alt="mouth">`;
        predText.innerText = randomQuote(neutralQuotes);
        sounds.neutral.currentTime = 0;
        sounds.neutral.play();
      }
      lastQuoteTime = now;
    }
  }

  // === LOOP ===
  async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
  }
  loop();
}


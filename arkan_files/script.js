// --- Орнотуулар ---
let position = 0;
const STEP = 50;
const WIN_LIMIT = 300;

let teamLeft, teamRight;
let quizAnswers = { left: '', right: '' }; 
let gameActive = false;

// 🗺️ ГЕОГРАФИЯ БОЮНЧА СУРООЛОР ЖАНА ЖООПТОР БАЗАСЫ
const quizDatabase = [
    // --- Дүйнө жүзү ---
    {
        question: "Жер шарында канча материк бар?",
        correct: "6",
        options: ["4", "5", "6", "7", "8", "9"]
    },
    {
        question: "Эң узун тоо системасы.",
        correct: "Анд тоолору",
        options: ["Гималай", "Урал", "Ала-Тоо", "Анд тоолору", "Альп тоолору", "Рокки тоолору"]
    },
    {
        question: "Дүйнөдөгү эң терең көл.",
        correct: "Байкал",
        options: ["Ысык-Көл", "Титикака", "Виктория", "Каспий", "Байкал", "Үч-Көл"]
    },
    {
        question: "Африка материгиндеги эң узун дарыя.",
        correct: "Нил",
        options: ["Конго", "Амазонка", "Нил", "Волга", "Янцзы", "Лена"]
    },
    {
        question: "Күн тутулуу процесси кандай аталат?",
        correct: "Затмение",
        options: ["Революция", "Затмение", "Циклон", "Пас", "Парад", "Эклиптика"]
    },
    
    // --- Кыргызстан ---
    {
        question: "Кыргызстандагы эң бийик чоку.",
        correct: "Жеңиш чокусу",
        options: ["Хан-Тенгри", "Ак-Сай", "Жеңиш чокусу", "Манзат", "Мөңгү-Төр", "Чыңгыз Айтматов чокусу"]
    },
    {
        question: "Ысык-Көлдүн максималдуу тереңдиги канча метрге жетет?",
        correct: "668",
        options: ["278", "389", "501", "668", "702", "850"]
    },
    {
        question: "Бишкек шаары деңиз деңгээлинен канча метр бийиктикте жайгашкан? (Жакынкы бүтүн сан)",
        correct: "750",
        options: ["500", "750", "900", "1100", "1500", "2000"]
    }
];

// --- Калган код (Музыка, Коргоо, Баштоо, Логикалык функциялар) Химия оюнундагыдай эле, ӨЗГӨРҮҮСҮЗ калат. ---

// 🔊 Музыка элементин аныктоо
const backgroundMusic = document.getElementById("background-music");


// =========================================================
// --- КОРГОО ЛОГИКАСЫ (Өзгөрүүсүз калат) ---
// ... (Сиз жөнөткөн коргоо логикасы бул жерге кирет) ...
document.addEventListener('contextmenu', event => { event.preventDefault(); });
(function() {
    let devtoolsOpen = false;
    let threshold = 160; 

    function checkDevTools() {
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;

        if (widthDiff > threshold || heightDiff > threshold || (widthDiff > 20 && heightDiff > 20)) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                gameActive = false;
                backgroundMusic.pause();
                alert("Кодду текшерүүгө тыюу салынат! Оюн токтотулду.");
            }
        } else {
            devtoolsOpen = false;
        }
        setTimeout(checkDevTools, 500);
    }
    checkDevTools();
})();


// Баштоо
document.getElementById("startBtn").onclick = () => {
    if (!gameActive) {
        teamLeft = document.getElementById("nameLeft").value || "1-Команда";
        teamRight = document.getElementById("nameRight").value || "2-Команда";
        
        document.getElementById("headerLeft").innerText = teamLeft;
        document.getElementById("headerRight").innerText = teamRight;
        
        document.getElementById("startScreen").style.display = "none";
        
        const arenaWinnerDisplay = document.getElementById("arenaWinnerDisplay");
        if (arenaWinnerDisplay) arenaWinnerDisplay.style.display = "none";
        
        const blueGif = document.getElementById("blueWinGif");
        const redGif = document.getElementById("redGif");
        if (blueGif) blueGif.style.display = 'none';
        if (redGif) redGif.style.display = 'none';
        
        position = 0;
        updateRope();
        
        startCountdown();
    }
};

// --- АРТКА САНАП БАШТОО ---
function startCountdown() {
    let count = 3;
    const cd = document.getElementById("countdown");
    cd.style.display = "block";
    cd.classList.remove("go"); 
    
    backgroundMusic.currentTime = 0; 
    backgroundMusic.play().catch(e => {
        console.log("Музыканы баштоо мүмкүн болгон жок.");
    });
    
    let timer = setInterval(() => {
        if(count > 0) {
            cd.innerText = count;
            count--;
        } else {
            cd.innerText = "БАШТАДЫК!";
            cd.classList.add("go"); 
            clearInterval(timer);
            gameActive = true;
            setTimeout(() => {
                cd.style.display = "none";
                generateQuizProblem('left'); 
                generateQuizProblem('right'); 
            }, 800);
        }
    }, 1000);
}

// =========================================================
// --- ТЕСТ ЛОГИКАСЫ (Өзгөрүүсүз калат) ---
// =========================================================

// Массивди аралаштыруу функциясы (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 🧠 СУРОО ТҮЗҮҮ ЖАНА ВАРИАНТТАРДЫ КӨРСӨТҮҮ
function generateQuizProblem(side) {
    if (!gameActive) return;

    const problemEl = document.getElementById(side + "Problem");
    const keypadEl = document.getElementById(side + "QuizKeypad");
    
    // Суроону кокусунан тандоо
    const randomIndex = Math.floor(Math.random() * quizDatabase.length);
    const quiz = quizDatabase[randomIndex];

    // Суроону көрсөтүү
    problemEl.innerText = quiz.question; // Суроо.
    quizAnswers[side] = quiz.correct; // Туура жоопту сактоо

    // Варианттарды аралаштыруу
    const shuffledOptions = shuffleArray([...quiz.options]);

    // Варианттарды HTMLге жүктөө
    keypadEl.innerHTML = ''; 
    shuffledOptions.slice(0, 6).forEach(option => { // Эң көп 6 вариант
        const btn = document.createElement('button');
        btn.classList.add('quiz-btn');
        btn.innerText = option;
        
        // Тест баскычын басканда жоопту текшерүү
        btn.onclick = () => checkQuizAnswer(side, option);
        // Сенсордук экрандар үчүн (мурункудай эле)
        btn.ontouchend = (e) => {
            e.preventDefault();
            checkQuizAnswer(side, option);
        };
        
        keypadEl.appendChild(btn);
    });
}

// 📝 ЖООПТУ ТЕКШЕРҮҮ
function checkQuizAnswer(side, selectedOption) {
    if (!gameActive) return;

    const keypadEl = document.getElementById(side + "QuizKeypad");
    const problemEl = document.getElementById(side + "Problem");
    const isCorrect = (selectedOption === quizAnswers[side]);
    
    // Бардык баскычтарды убактылуу өчүрүү (кайра басууну болтурбоо үчүн)
    keypadEl.querySelectorAll('.quiz-btn').forEach(btn => btn.disabled = true);
    
    // Жоопту белгилөө
    let selectedBtn = null;
    keypadEl.querySelectorAll('.quiz-btn').forEach(btn => {
        if (btn.innerText === selectedOption) {
            selectedBtn = btn;
        }
    });

    if (isCorrect) {
        // --- ТУУРА ЖООП ЛОГИКАСЫ ---
        if (selectedBtn) {
            selectedBtn.style.backgroundColor = "#4caf50"; // Жашыл
            selectedBtn.style.color = "white";
        }
        
        problemEl.style.backgroundColor = "#2e7d32"; // Коюу жашыл
        
        // Арканды жылдыруу
        if(side === 'left') position -= STEP;
        else position += STEP;
        
        updateRope();

        setTimeout(() => {
            // Анимациядан кийин кайра баштоо
            problemEl.style.backgroundColor = (side === 'left' ? '#3f51b5' : '#b42444'); // Эски түсүн кайтаруу
            keypadEl.querySelectorAll('.quiz-btn').forEach(btn => btn.disabled = false); // Баскычтарды иштетүү
            generateQuizProblem(side);
            checkWin();
        }, 800);

    } else {
        // --- КАТА ЖООП ЛОГИКАСЫ ---
        if (selectedBtn) {
            selectedBtn.classList.add("shake-input");
            selectedBtn.style.backgroundColor = "#e53935"; // Кызыл
            selectedBtn.style.color = "white";
        }
        
        // ❌ АРКАНДЫ АРТКА ЖЫЛДЫРУУ (1/3 кадам)
        if(side === 'left') position += (STEP / 3); 
        else position -= (STEP / 3);
        updateRope();
        
        setTimeout(() => {
            // Эски түсүн кайтаруу
            if (selectedBtn) {
                selectedBtn.classList.remove("shake-input");
                selectedBtn.style.backgroundColor = "#e0f7fa";
                selectedBtn.style.color = "black";
            }
            keypadEl.querySelectorAll('.quiz-btn').forEach(btn => btn.disabled = false); // Баскычтарды иштетүү
            
            // 🔥 ДАРОО ЖАҢЫ СУРОО ЧЫГАРУУ
            generateQuizProblem(side); 
            checkWin(); 
        }, 1000);
    }
}


// --- updateRope, checkWin, triggerConfetti логикасы өзгөрүүсүз калат ---
function updateRope() {
    const container = document.getElementById("imageContainer");
    container.style.transform = `translateX(calc(-50% + ${position}px))`;
}

function checkWin() {
    if(Math.abs(position) >= WIN_LIMIT) {
        gameActive = false;
        backgroundMusic.pause();

        const arenaWinnerDisplay = document.getElementById("arenaWinnerDisplay");
        const winnerNameEl = document.getElementById("winnerNameArena");
        const blueGif = document.getElementById("blueWinGif");
        const redGif = document.getElementById("redGif");

        let winner = position < 0 ? teamLeft : teamRight;
        
        if (winnerNameEl) winnerNameEl.innerText = winner;
        
        // GIF СҮРӨТТҮ ТАНДОО ЛОГИКАСЫ
        if (position < 0) {
            if (blueGif) blueGif.style.display = 'block';
            if (redGif) redGif.style.display = 'none';
        } else {
            if (blueGif) blueGif.style.display = 'none';
            if (redGif) redGif.style.display = 'block';
        }
        
        if (arenaWinnerDisplay) arenaWinnerDisplay.style.display = "flex";
        if (arenaWinnerDisplay) triggerConfetti(arenaWinnerDisplay); 
    }
}

// --- КОНФЕТТИ (САЛЮТ) АНИМАЦИЯСЫ (АРЕНА ИЧИНДЕ) ---
function triggerConfetti(container) {
    const colors = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#9c27b0'];
    const count = 30; 
    
    container.querySelectorAll('.confetti-arena').forEach(c => c.remove()); 

    const arenaRect = container.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
        const c = document.createElement('div');
        c.classList.add('confetti-arena');
        
        c.style.top = `-5px`; 
        c.style.left = `${Math.random() * arenaRect.width}px`; 
        c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const size = Math.random() * 8 + 4;
        c.style.width = `${size}px`;
        c.style.height = `${size}px`;
        c.style.opacity = '1';

        container.appendChild(c);

        const duration = Math.random() * 1.5 + 2; 
        c.style.transition = `transform ${duration}s linear, opacity 0.5s linear ${duration - 0.5}s`;
        
        const endX = Math.random() * arenaRect.width * 0.8 - arenaRect.width * 0.4; 
        const endY = arenaRect.height + 10; 
        
        c.style.transform = `translate(${endX}px, ${endY}px) rotate(${Math.random() * 360}deg)`;

        setTimeout(() => {
            c.remove();
        }, duration * 1000);
    }
}
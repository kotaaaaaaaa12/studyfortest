let quizData = [];
let currentQuestions = [];
let mistakeQuestions = [];
let currentIndex = 0;
let correctAnswers = 0;
let startTime, endTime;

document.addEventListener('DOMContentLoaded', () => {
    displaySubjectButtons();
});

function displaySubjectButtons() {
    const subjectButtons = document.getElementById('subjectButtons');

    // ボタンを生成
    const subjects = [
        { id: 'geographyButton', name: '地理' },
        { id: 'historyButton', name: '歴史' },
        { id: 'mathButton', name: '数学' },
        { id: 'scienceButton', name: '理科' },
        { id: 'languageButton', name: '語感の豊かな言葉' },
        { id: 'elementButton', name: '元素' },
        { id: 'kanjiButton', name: '漢字' },
        { id: 'englishButton', name: '英単語' },
    ];

    subjects.forEach(subject => {
        const button = document.createElement('button');
        button.id = subject.id;
        button.textContent = subject.name;
        button.addEventListener('click', () => {
            fetchQuestions(subject.id);
        });
        subjectButtons.appendChild(button);
    });
}

function fetchQuestions(subjectId) {
    let jsonFile;
    switch (subjectId) {
        case 'geographyButton':
            jsonFile = 'json/geography.json';
            break;
        case 'historyButton':
            jsonFile = 'json/history.json';
            break;
        case 'mathButton':
            jsonFile = 'json/math.json';
            break;
        case 'scienceButton':
            jsonFile = 'json/science.json';
            break;
        case 'languageButton':
            jsonFile = 'json/language.json';
            break;
        case 'elementButton':
            jsonFile = 'json/element.json';
            break;
        case 'kanjiButton':
            jsonFile = 'json/kanji.json';
            break;
        case 'englishButton':
            jsonFile = 'json/english.json';
            break;
        default:
            return;
    }

    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            quizData = data;
            document.getElementById('maxQuestions').textContent = quizData.length;
            document.getElementById('numQuestions').max = quizData.length; // 最大問題数を設定
            document.getElementById('numQuestions').style.display = 'inline';
            document.getElementById('questionCountLabel').style.display = 'inline';
            document.getElementById('startQuiz').style.display = 'inline';
            document.getElementById('startQuiz').onclick = () => {
                const numQuestions = parseInt(document.getElementById('numQuestions').value);
                if (numQuestions < 1) {
                    alert('問題数は1以上にしてください。');
                    return;
                }
                startTime = new Date(); // クイズの開始時間を記録
                correctAnswers = 0; // 正解数のリセット
                startQuiz(selectRandomQuestions(numQuestions));
            };
        })
        .catch(error => {
            console.error('エラーが発生しました:', error);
        });
}

function selectRandomQuestions(numQuestions) {
    const selectedQuestions = [];
    const usedIndices = new Set();
    while (selectedQuestions.length < numQuestions) {
        const randomIndex = Math.floor(Math.random() * quizData.length);
        if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            selectedQuestions.push(quizData[randomIndex]);
        }
    }
    return selectedQuestions;
}

function startQuiz(questions) {
    currentQuestions = questions;
    mistakeQuestions = [];
    currentIndex = 0;
    document.getElementById('quizContainer').innerHTML = '';
    document.getElementById('retryMistakes').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
    renderQuestion();
}

function renderQuestion() {
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = '';

    if (currentIndex < currentQuestions.length) {
        const questionItem = currentQuestions[currentIndex];
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <p>${currentIndex + 1}. ${questionItem.question}</p>
            <input type="text" class="answer-input" id="answerInput">
            <button onclick="checkAnswer('${questionItem.answer}')">解答</button>
        `;
        quizContainer.appendChild(questionElement);
    } else {
        finishQuiz();
    }
}

function checkAnswer(correctAnswer) {
    const answerInput = document.getElementById('answerInput').value.trim();
    const feedback = document.createElement('div');
    feedback.classList.add('feedback');

    const correctSound = document.getElementById('correctSound');
    const incorrectSound = document.getElementById('incorrectSound');

    if (answerInput === correctAnswer) {
        feedback.textContent = '⭕';
        feedback.classList.add('correct');
        correctAnswers++; // 正解数をカウント
        correctSound.play();
    } else {
        feedback.textContent = '❌';
        feedback.classList.add('incorrect');
        incorrectSound.play();

        const correctAnswerElement = document.createElement('div');
        correctAnswerElement.classList.add('correct-answer');
        correctAnswerElement.textContent = `正しい答え: ${correctAnswer}`;
        document.querySelector('.question').appendChild(correctAnswerElement);

        mistakeQuestions.push(currentQuestions[currentIndex]);
    }

    document.querySelector('.question').appendChild(feedback);
    currentIndex++;
    setTimeout(renderQuestion, 2000);
}

function finishQuiz() {
    endTime = new Date(); // クイズの終了時間を記録
    const timeTaken = calculateTimeTaken(startTime, endTime);

    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = '<p>クイズが終了しました。</p>';

    const statsContainer = document.getElementById('stats');
    statsContainer.style.display = 'block';
    statsContainer.innerHTML = `
        <p>正答率: ${correctAnswers}/${currentQuestions.length}</p>
        <p>掛かった時間: ${timeTaken}</p>
    `;

    if (mistakeQuestions.length > 0) {
        document.getElementById('retryMistakes').style.display = 'block';
    } else {
        resetQuiz();
    }
}

function calculateTimeTaken(start, end) {
    const timeDiff = end - start; // ミリ秒単位の差を取得
    const minutes = Math.floor(timeDiff / 1000 / 60);
    const seconds = Math.floor((timeDiff / 1000) % 60);
    return `${minutes}分${seconds}秒`;
}

function resetQuiz() {
    document.getElementById('numQuestions').value = '1';
    document.getElementById('retryMistakes').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
    document.getElementById('quizContainer').innerHTML = '';
}

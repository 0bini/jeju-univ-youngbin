// 9페이지: 인용문 배열
const quotes = [
    'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
    'There is nothing more deceptive than an obvious fact.',
    'I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.',
    'I never make exceptions. An exception disproves the rule.',
    'What one man can invent another can discover.',
    'Nothing clears up a case so much as stating it to another person.',
    'Education never ends, Watson. It is a series of lessons, with the greatest for the last.',
];

// 10페이지: 초기값 세팅
let words = [];
let wordIndex = 0;
let startTime = Date.now();

// 11페이지: DOM 요소 가져오기
const quoteElement = document.getElementById('quote');
const messageElement = document.getElementById('message');
const typedValueElement = document.getElementById('typed-value');
const startButton = document.getElementById('start');

// [과제] 모달창 및 LocalStorage 관련 요소/상수 가져오기
const modal = document.getElementById('modal');
const modalScoreElement = document.getElementById('modal-score');
const modalHighScoreElement = document.getElementById('modal-high-score');
const closeBtn = document.querySelector('.close-btn');
const highScoreDisplayElement = document.getElementById('high-score-display');
const HIGH_SCORE_KEY = 'typingGameHighScore'; // LocalStorage 키

// [과제] 페이지 로드 시 최고 점수 표시
updateHighScoreDisplay();

// [과제] 모달창 닫기 이벤트
closeBtn.addEventListener('click', () => modal.classList.remove('show'));
window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.classList.remove('show');
    }
});

// [실습] 페이지 로드 시, 입력창 비활성화
typedValueElement.disabled = true;

// 12-13페이지: 'start' 버튼 클릭 이벤트
startButton.addEventListener('click', () => {
    // [실습] 버튼/입력창 활성화/비활성화
    startButton.disabled = true;
    typedValueElement.disabled = false;

    // 랜덤 인용문 선택
    const quoteIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[quoteIndex];
    
    words = quote.split(' ');
    wordIndex = 0;

    const spanWords = words.map(function(word) { return `<span>${word} </span>` });
    quoteElement.innerHTML = spanWords.join('');
    
    quoteElement.childNodes[0].className = 'highlight';
    
    messageElement.innerText = '';
    typedValueElement.value = '';
    typedValueElement.focus();

    startTime = new Date().getTime();
});

// 14-15페이지: 입력창 'input' 이벤트
typedValueElement.addEventListener('input', () => {
    const currentWord = words[wordIndex];
    const typedValue = typedValueElement.value;

    // 1. (성공) 마지막 단어까지 정확히 입력 완료
    if (typedValue === currentWord && wordIndex === words.length - 1) {
        const elapsedTime = new Date().getTime() - startTime;

        // [실습] 완료 시 비활성화
        typedValueElement.disabled = true;
        startButton.disabled = false;
        
        // [과제] LocalStorage 최고 점수 확인 및 저장
        const currentHighScore = localStorage.getItem(HIGH_SCORE_KEY) || Infinity;
        if (elapsedTime < currentHighScore) {
            localStorage.setItem(HIGH_SCORE_KEY, elapsedTime);
            updateHighScoreDisplay(); // 최고 점수판 갱신
        }

        // [과제] 모달창에 점수 표시 및 모달 열기
        const formattedTime = (elapsedTime / 1000).toFixed(2);
        const formattedHighScore = (localStorage.getItem(HIGH_SCORE_KEY) / 1000).toFixed(2);
        
        modalScoreElement.innerText = `Your time: ${formattedTime}s`;
        modalHighScoreElement.innerText = `Best time: ${formattedHighScore}s`;
        modal.classList.add('show');
        typedValueElement.className = ''; // 입력창 스타일 초기화

    // 2. (다음 단어) 단어 정확히 입력 후 스페이스바 눌렀을 때
    } else if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) {
        typedValueElement.value = '';
        wordIndex++;
        
        for (const wordElement of quoteElement.childNodes) {
            wordElement.className = '';
        }
        
        quoteElement.childNodes[wordIndex].className = 'highlight';
        typedValueElement.className = ''; // 입력창 스타일 초기화

    // 3. (정타) 현재 단어를 올바르게 입력 중일 때
    } else if (currentWord.startsWith(typedValue)) {
        // [과제] Input 효과 CSS (.correct) 적용
        typedValueElement.className = 'correct';
    
    // 4. (오타) 현재 단어와 다르게 입력했을 때
    } else {
        typedValueElement.className = 'error';
    }
});

// [과제] 최고 점수를 화면에 표시하는 함수
function updateHighScoreDisplay() {
    const highScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (highScore) {
        highScoreDisplayElement.innerText = `Best Score: ${(highScore / 1000).toFixed(2)}s`;
    } else {
        highScoreDisplayElement.innerText = 'Best Score: --';
    }
}
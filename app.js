const STARTING_POKER_CHIPS = 100; // pointsUse Cmd+I to generate code
const PLAYERS = 3;
const NO_OF_STARTER_CARDS = 2;
let gameHasEnded = false;

let playerOneName = "도홍";
let playerTwoName = "준영";
let playerThreeName = "문준";

console.log(`Welcome! 챔피언십 테이블은 ${playerOneName}, ${playerTwoName}, ${playerThreeName} 중 한 명에게 주어집니다. 각 선수는 ${STARTING_POKER_CHIPS}의 칩을 가지고 시작합니다. 흥미진진한 경기가 될 것입니다. 최고의 선수가 승리하길 바랍니다!`);

let playerOnePoints = STARTING_POKER_CHIPS;
let playerTwoPoints = STARTING_POKER_CHIPS;
let playerThreePoints = STARTING_POKER_CHIPS;

playerOnePoints = 50;
playerTwoPoints = 25;
playerThreePoints = 75;

gameHasEnded = ((playerOnePoints + playerTwoPoints) == 0) || // 플레이어3 우승 조건
               ((playerTwoPoints + playerThreePoints) == 0) || // 플레이어1 우승 조건
               ((playerOnePoints + playerThreePoints) == 0);   // 플레이어2 우승 조건

console.log("게임이 종료되었습니다:", gameHasEnded);
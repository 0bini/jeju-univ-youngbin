let cardOne = 7;
let cardTwo = 5;
let cardThree = 7;
let playerSum = cardOne + cardTwo + cardThree;

let cardOneBank = 7;
let cardTwoBank = 5;
let cardThreeBank = 6;
let cardFourBank =1;
let dealerSum = cardOneBank + cardTwoBank + cardThreeBank + cardFourBank;

console.log(`플레이어의 점수: ${playerSum}`); 
console.log(`딜러의 점수: ${dealerSum}`); 

if (playerSum > 21) {
    console.log("플레이어가 21을 초과했습니다. 딜러 승리");
} 
else if (dealerSum > 21) {
    console.log("딜러가 21을 초과했습니다. 플레이어 승리");
}
else if (playerSum === 21) {
    console.log("플레이어 승리");
}
else if (playerSum === dealerSum) {
    console.log("점수가 같습니다. 무승부");
}
else if (playerSum > dealerSum) {
    console.log("플레이어 승리!");
} else {
    console.log("딜러 승리!");
}
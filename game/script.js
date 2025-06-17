SpeechRecognition = webkitSpeechRecognition || SpeechRecognition; //音声認識を行うためのインスタンスを生成
const sr = new SpeechRecognition(); 

sr.interimResults = false; //途中経過を表示するかどうか　今回は途中は不要なのでfalseにする 
sr.continuous = true; 

const wordDisplay = document.getElementById("wordDisplay"); 
const timerDisplay = document.getElementById("timerDisplay"); 
const log = document.getElementById("textLog"); 

let correctAnswers = 0; // 正解数を格納する変数
let mistakes = 0; // ミス数を格納する変数
let targetCorrect = 0; //目標の正解数

// 新たに正解単語とミス単語を格納する配列を作成
let correctWordsArray = [];
let mistakeWordsArray = [];

let currentWord = getRandomWord(); //次の単語を取得．currentWordは現在の単語を表す．getRandomWordは単語リストからランダムに単語を取得する 
previousWord = currentWord;
let gameIsOver = false; //ゲームの終了状態を表す

function setTarget(){
  const targetInput = document.getElementById("targetCorrect");
  const targetValue = parseInt(targetInput.value);

  if (!isNaN(targetValue) && targetValue >= 0) {
    targetCorrect = targetValue;
    alert("目標の正解数を設定しました: " + targetCorrect);
  } else {
    alert("正しい目標の正解数を入力してください。");
  }
}

//ランダムな単語を取得する関数
function getRandomWord() { 
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

//制限時間を管理する関数
function timer() {
  timeLimit--;
  if (timeLimit < 0) { // 制限時間がマイナス秒になったら終了
    timeLimit = 0;
    endGame();
    return;
  }
  timerDisplay.textContent = "Time: " + timeLimit;
  setTimeout(timer, 1000);
}

//ゲームを開始する関数
function startGame() { 
  currentWord = getRandomWord(); 
  wordDisplay.textContent = currentWord; 
  correctAnswers = 0; // 正解数をリセット
  mistakes = 0; // ミス数をリセット
  timerDisplay.textContent = "Time: " + timeLimit; //制限時間を表示
  sr.start(); 
  timer(); //タイマーを開始 
}

//'DOMContentLoaded'イベントは，HTMLドキュメントの読み込みが完了したときに発生する．これに対するイベントリスナー内で，ページの要素を取得して初期化する処理が行われる
document.addEventListener("DOMContentLoaded", function() {
  const timerInput = document.getElementById("timer_input"); //ユーザーが制限時間を入力するためのテキスト入力要素を取得
  const timerButton = document.getElementById("timer-button"); //ユーザーが制限時間を設定してゲームを開始するためのボタン要素を取得。
  const warningMessage = document.getElementById("warning"); //不正な入力時に表示する警告メッセージ要素を取得
  const initialScreen = document.getElementById("initial-screen"); //初期の制限時間入力セクションを取得
  const playingScreen = document.getElementById("playing-screen"); //ゲームが進行するセクションを取得

  //タイマーボタンのクリックイベントリスナー
  timerButton.addEventListener("click", function() {
    const enteredTime = parseInt(timerInput.value);
    if (!isNaN(enteredTime) && enteredTime > 0) { //正しい場合は，'timeLimit'変数に制限時間を格納し，初期画面を非表示にしてゲーム画面を表示する．その後，'startGame()'関数を呼び出してゲームを開始
      timeLimit = enteredTime;
      initialScreen.style.display = "none"; // 制限時間入力セクションを非表示にする
      playingScreen.style.display = "block"; // ゲーム画面セクションを表示する
      startGame();
    }else{ //'warningMessage'要素にクラスを追加して警告を表示
      warningMessage.classList.add("is-active"); //不正な入力の警告を表示
    }
  });
});

// ひらがなを漢字に変換する
function hiraganaToKanji(text) {
  const hiraganaToKanjiMap = {
    'かきごおり': 'かき氷',
    'くもり':'曇り',
    '重いで':'思い出'
    
    // 他のひらがなと対応する漢字のマッピングを追加
  };

  if (hiraganaToKanjiMap[text]) {
    return hiraganaToKanjiMap[text];
  } else {
    return text;
  }
}

//音声認識結果のイベントリスナー
sr.addEventListener("result", function(e) {
  const lastResult = e.results[e.results.length - 1][0].transcript.trim();
  const normalizedLastResult = hiraganaToKanji(lastResult);
  const normalizedCurrentWord = hiraganaToKanji(currentWord);
  const recognitionStartTime = new Date(); // 認識開始時刻を記録
  const recognitionEndTime = new Date(); //認識終了時刻を記録
  const recognitionTime = (recognitionEndTime - recognitionStartTime) / 1000; // 認識されるまでの時間（秒単位）を計算

  log.innerHTML = "<div>" + normalizedLastResult + (normalizedLastResult === normalizedCurrentWord ? " 正解！！！" : " 残念！！！");

  if (normalizedLastResult === normalizedCurrentWord) { //ユーザーが正解した場合の処理を行う．正解した場合，correctAnswersを増やし，新しいランダムな単語を取得しcurrentWordに設定し，次の単語を表示するようにする
    previousWord = currentWord; //正解した単語を保存
    currentWord = getRandomWord();
    wordDisplay.textContent = currentWord;
    correctAnswers++; // 正解の場合，正解数を増やす
    correctWordsArray.push(previousWord);//正解した単語をリストに追加
  } else { //ユーザーが不正解した場合の処理を行う．不正解した場合，mistakeを増やし，新しいランダムな単語を取得しcurrentWordに設定し，次の単語を表示するようにする
    previousWord = currentWord; //不正解した単語を保存
    currentWord = getRandomWord();
    wordDisplay.textContent = currentWord;
    mistakes++; // 不正解の場合，ミス数を増やす
    mistakeWordsArray.push(lastResult + "(" + previousWord + ")"); // 不正解した単語と認識された単語を配列に追加
  }
});



function endGame() {
  const url = `A_play_end.html?correct=${correctAnswers}&mistakes=${mistakes}&correctWords=${correctWordsArray.join("，")}&mistakeWords=${mistakeWordsArray.join("，")}&targetCorrect=${targetCorrect}`;
  window.location.href = url;
}

//音声認識の開始のイベントリスナー
sr.addEventListener("start", function() {
  timerButton.disabled = true;
});

//音声認識の終了のイベントリスナー
sr.addEventListener("end", function() {
  timerButton.disabled = false;
});

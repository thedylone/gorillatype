const wordsFile = "/gorillatype/static/js/commonwords.json";

const duration = 30;

let started = false;
let ended = false;
let wordCount = 0;
let minWord = 0;
let letterCount = 0;
let correctWords = 0;
let correctLetters = 0;
let incorrectLetters = 0;
let keyboard;
let toggleScramble = true;

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}


function fillWords() {
    fetch(wordsFile)
        .then(response => response.json())
        .then(data => {
            var words = data['commonWords'];
            shuffle(words);
            for (i = 0; i < 100; i++) {
                var newWord = document.createElement("div");
                newWord.className = "word";
                if (i == 0) {
                    newWord.className = "word active";
                }
                document.getElementById("type-words").appendChild(newWord);
                words[i].split('').forEach(letter => {
                    var newLetter = document.createElement("letter");
                    newLetter.innerText = letter;
                    newWord.appendChild(newLetter);
                })
            }
        });
}

function moveCaret(dist) {
    document.querySelector("#type-words").style.setProperty("--caretLeft", dist + "em")
}

function resetKeyboard() {
    keyboard = { 'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h', 'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p', 'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y', 'z': 'z' };
    displayKeyboard();
}

// jquery needed
function displayScrambled(text) {
    var display = $("#type-scrambled");
    display.text(text);
    display.fadeIn()
    setTimeout(function () {
        display.fadeOut();
    }, 1000)
}

function toggleScrambleFunction() {
    if (toggleScramble) {
        toggleScramble = false;
        resetKeyboard();
        displayScrambled("scramble off");
    } else {
        toggleScramble = true;
        displayScrambled("scramble on");
    }
}

function scrambleKeyboard() {
    alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    scrambled = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    shuffle(scrambled);
    for (i = 0; i < alphabet.length; i++) {
        keyboard[alphabet[i]] = scrambled[i]
    }
    displayScrambled("scrambled!");
    displayKeyboard();
}

function displayKeyboard() {
    Object.keys(keyboard).forEach(letter => {
        document.querySelector("[data-char='" + letter + "']").innerText = keyboard[letter];
    })
}

function clearPressKeyboard() {
    document.querySelectorAll(".keyboard-letter").forEach(key => {
        key.className = "keyboard-letter";
    })
}

function pressKeyboard(letter) {
    clearPressKeyboard();
    document.querySelector("[data-char='" + letter + "']").className = "keyboard-letter pressed";
}

function startType(e) {
    var activeWord = document.getElementsByClassName("active")[0];
    if (e.keyCode > 64 && e.keyCode < 91 && !ended) {
        // if alpha
        pressKeyboard(e.key);
        if (!started) {
            timer(duration);
            started = true;
        };
        if (letterCount < activeWord.childElementCount) {
            var currentLetter = document.getElementsByClassName("active")[0].children[letterCount];
            if (keyboard[e.key] == currentLetter.innerText) {
                currentLetter.className = "correct";
                // correctLetters++;
            } else {
                currentLetter.className = "incorrect";
                incorrectLetters++;
            }
            letterCount++;
            moveCaret(letterCount * 0.6);
        } else if (activeWord.childElementCount < 20) {
            // appends extra letters
            var wrongLetter = document.createElement("letter");
            wrongLetter.className = "appended incorrect";
            wrongLetter.innerText = keyboard[e.key];
            activeWord.appendChild(wrongLetter);
            letterCount++;
            incorrectLetters++;
            moveCaret(letterCount * 0.6);
        }

    } else if (e.keyCode == 8 && started) {
        // if backspace
        if (letterCount) {
            letterCount--;
            (activeWord.lastChild.className == "appended incorrect") ? activeWord.removeChild(activeWord.lastChild) : document.getElementsByClassName("active")[0].children[letterCount].className = null;
            moveCaret(letterCount * 0.6);
        } else if (wordCount > minWord) {
            // go to previous word until last correct word
            wordCount--;
            activeWord.className = "word";
            document.getElementsByClassName("word")[wordCount].className = "word active";
            letterCount = document.getElementsByClassName("word")[wordCount].childElementCount;
            moveCaret(0);
            moveCaret(letterCount * 0.6);
        }

    } else if (e.keyCode == 32 && started && letterCount) {
        // if spacebar
        e.preventDefault();
        wordCount++;
        if (letterCount >= activeWord.childElementCount) {
            if (activeWord.querySelectorAll(".incorrect").length == 0) {
                // all correct
                activeWord.className = "word";
                correctLetters += ++activeWord.childElementCount;
                minWord = wordCount;
                if (toggleScramble) scrambleKeyboard();
            } else {
                activeWord.className = "word incorrect";
            }
        } else {
            activeWord.className = "word incorrect";
            activeWord.querySelectorAll("letter:not(.correct)").forEach(letter => {
                letter.className = "incorrect"
            })
        }
        document.getElementsByClassName("word")[wordCount].className = "word active";
        letterCount = 0;
        moveCaret(0);
    }
}

function showResults() {
    var wpm = Math.round(correctLetters * 12 / duration);
    var acc = Math.round(100 * correctLetters / (correctLetters + incorrectLetters));
    document.getElementById("wpm").innerText = "wpm: " + wpm;
    document.getElementById("acc").innerText = "accuracy: " + acc + "%";
    document.getElementById("type-container").style.display = "none";
    document.getElementById("type-results").style.display = "block";
    clearPressKeyboard();
}

let endTime
let timerInterval
function timer(duration) {
    timerElement = document.getElementById("type-timer");
    endTime = new Date()
    endTime.setSeconds(endTime.getSeconds() + duration)
    timerInterval = setInterval(() => {
        var countdown = getTimerTime();
        if (countdown >= 0) {
            timerElement.innerText = countdown;
        } else {
            started = false;
            ended = true;
            clearInterval(timerInterval);
            showResults();
        }
    }, 100)
}

function getTimerTime() {
    return Math.round((endTime - new Date()) / 1000)
}

function init() {
    clearInterval(timerInterval);
    document.getElementById("type-container").style.display = "flex";
    document.getElementById("type-results").style.display = "none";
    document.getElementById("type-words").innerHTML = null;
    document.getElementById("type-scrambled").innerHTML = null;
    document.getElementById("type-timer").innerHTML = null;
    fillWords();
    started = false;
    ended = false;
    wordCount = 0;
    minWord = 0;
    letterCount = 0;
    correctWords = 0;
    correctLetters = 0;
    incorrectLetters = 0;
    resetKeyboard();
    clearPressKeyboard();
    moveCaret(0);
}

window.onload = () => {
    init();
}

window.onkeydown = startType;

window.onpaste = event => false;
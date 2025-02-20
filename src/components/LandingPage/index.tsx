import { useState, useRef } from "react";
import jeremiah12 from "./data.json";
import { SingleDataPoint } from "../../types/data";
import AfterGameLineChart from "../AfterGameLineChart";

const LandingPage = () => {
  const wordIndex = useRef(0);
  const letterIndex = useRef(0);

  const allWordsRef = useRef<HTMLDivElement | null>(null);
  const inputFieldRef = useRef<HTMLInputElement | null>(null);

  const ctrl = useRef(false);

  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);

  const [prevLineWordIndex, setPrevLineWordIndex] = useState(0);

  const [typing, setTyping] = useState(false);
  const [readyToStart, setReadyToStart] = useState(true);
  const [endScreen, setEndScreen] = useState(false);
  const timeLength = useRef(60);
  const [startTime, setStartTime] = useState(Date.now());
  const [remaining, setRemaining] = useState(timeLength.current);
  const [wpm, setWpm] = useState(0); // WPM to display after timer ends
  const [rawWpm, setRawWpm] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const [wpmTime, setWpmTime] = useState<SingleDataPoint>({});
  const [rawWpmTime, setRawWpmTime] = useState<SingleDataPoint>({});
  const [mistakesTime, setMistakesTime] = useState<SingleDataPoint>({});

  const [correctCharCount, setCorrectCharCount] = useState(0);

  let countWordIndex = -1;

  const [words, setWords] = useState<JSX.Element[]>([]);

  const restart = () => {
    console.log("restarting");

    // Reset state and refs
    setRemaining(timeLength.current);
    setTyping(false);
    setReadyToStart(true);
    // setWordCount(0);
    setWpm(0);
    setRawWpm(0);
    setRawWpmTime({});
    setWpmTime({});
    setMistakesTime([]);
    setMistakes(0);
    setEndScreen(false);
    setCorrectCharCount(0);
    wordIndex.current = 0;
    letterIndex.current = 0;
    countWordIndex = -1; // Reset countWordIndex for accurate element IDs

    // Generate fresh content from jeremiah12
    // setWords([]);
    const text = jeremiah12.split("\n").map((line, index) => (
      <div className="line" key={index} id={"line" + index.toString()}>
        {line.split(" ").map((word, wordIndex) => {
          if (word.trim() !== "") {
            countWordIndex++;
            return (
              <div
                className="word"
                key={wordIndex}
                id={"word" + countWordIndex.toString()}
              >
                {word.split("").map((letter, letterInx) => (
                  <div className="letter" key={letterInx}>
                    {letter}
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })}
        <div className="endline">↵</div>
      </div>
    ));
    // setWords(text); // Reset words with fresh content

    // Clear any previous cursor positions
    setCursorX(0);
    setCursorY(0);

    // Reset classes for all letters and words (if any)
    const allLetters = document.getElementsByClassName("letter");
    Array.from(allLetters).forEach((letter) => {
      letter.classList.remove("typed", "correct-letter", "incorrect-letter");
      if (letter.classList.contains("added")) {
        letter.remove();
      }
    });
    const hiddenElements = document.getElementsByClassName("hidden");
    Array.from(hiddenElements).forEach((element) => {
      console.log("FINDING", element.textContent);
      element.classList.remove("hidden");
    });
    // const hiddenElements = document.querySelectorAll(".hidden");
    // // Remove the "hidden" class from each element
    // hiddenElements.forEach((element) => {
    //   element.classList.remove("hidden");
    // });
    inputFieldRef.current?.focus();
    updateCursor(); // Reposition the cursor at the beginning
  };

  const handleCtrl = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Control") {
      ctrl.current = false;
    }
  };

  const getWordWithIndex = (index: number) => {
    return document.getElementById(`word${index.toString()}`);
  };

  const getLineWithIndex = (index: number) => {
    return document.getElementById(`line${index.toString()}`);
  };

  const remainingTime = () => {
    return timeLength.current - (Date.now() - startTime) / 1000;
  };

  const calculateWPM = () => {
    let correctCount = 0;
    for (let index = 0; index <= wordIndex.current; index++) {
      if (isWordCorrect(index)) {
        correctCount++;
      }
    }

    const tempRemainingTime = remainingTime();
    const currentTimeMulti = (timeLength.current - tempRemainingTime) / 60;
    const currentWpm = Math.round(correctCount / currentTimeMulti);
    return currentWpm;
  };

  const isWordCorrect = (index: number) => {
    let wordToCheck: HTMLElement = getWordWithIndex(index)!;
    if (wordToCheck == null) {
      return false;
    }

    let letters: string | any[] = [];
    letters = Array.from(wordToCheck.getElementsByClassName("letter"));
    for (let i = 0; i < letters.length; i++) {
      if (
        !letters[i].classList.contains("typed") ||
        letters[i].classList.contains("incorrect-letter")
      ) {
        return false;
      }
    }
    return true;
  };

  const updateTime = () => {
    const tempRemainingTime = remainingTime();

    setRemaining(Math.round(tempRemainingTime));
    const currentTimeMulti = (timeLength.current - tempRemainingTime) / 60;
    const currentWpm = calculateWPM();

    const currentRawWpm = Math.round(
      (wordIndex.current + 0.5) / currentTimeMulti
    );

    if (timeLength.current > 1) {
      recordWpm(currentWpm);
      recordRawWpm(currentRawWpm);
    }
    setWpm(currentWpm);
    setRawWpm(currentRawWpm);

    if (tempRemainingTime <= 0) {
      stopCurrentGame();
    }
  };

  const stopCurrentGame = () => {
    setEndScreen(true);
    setReadyToStart(false); // Stop typing when timer reaches zero
  };

  const recordMistake = () => {
    setMistakes((prev) => prev + 1);
    const currentTime = Math.round(timeLength.current - remainingTime());
    const temp =
      1 + (currentTime in mistakesTime ? mistakesTime[currentTime] : 0);
    setMistakesTime({
      ...mistakesTime,
      [currentTime]: temp,
    });
  };

  const recordWpm = (wpm: number) => {
    const currentTime = Math.round(timeLength.current - remainingTime());
    setWpmTime({ ...wpmTime, [currentTime]: wpm });
  };

  const recordRawWpm = (rawWpm: number) => {
    const currentTime = Math.round(timeLength.current - remainingTime());
    setRawWpmTime({ ...rawWpmTime, [currentTime]: rawWpm });
  };

  const handleChange = (e: React.KeyboardEvent<HTMLElement>) => {
    if (typing) {
      updateTime();
    }
    if (e.key === "Control") {
      ctrl.current = true;
    }
    if (e.key.length > 1 && e.key !== "Backspace" && e.key !== "Enter") {
      return;
    }

    if (!readyToStart) return; // Prevent typing if everything is not ready

    if (!typing) {
      setTyping(true);
      setStartTime(Date.now());
    }

    updateCursor();

    let activeWord: HTMLElement = getWordWithIndex(wordIndex.current)!;

    let letters: string | any[] = [];
    if (activeWord !== null) {
      letters = Array.from(activeWord.getElementsByClassName("letter"));
      letterIndex.current = letters.length;
      for (let i = 0; i < letters.length; i++) {
        if (!letters[i].classList.contains("typed")) {
          letterIndex.current = i;
          break;
        }
      }
    } else {
      stopCurrentGame();
      return;
    }

    let parentLine = activeWord.parentElement;
    let siblingWords: Array<Element> = [];
    if (parentLine !== null) {
      siblingWords = Array.from(parentLine.getElementsByClassName("word"));
    }

    if (e.key === " ") {
      if (letterIndex.current !== 0) {
        if (siblingWords[siblingWords.length - 1] === activeWord) {
          return;
        }
        wordIndex.current++;
        updateCursor();
      }
      return;
    }

    if (e.key === "Enter" && parentLine !== null) {
      let nextLineId = parseInt(parentLine.id.slice(4)) + 1;
      let nextLine = getLineWithIndex(nextLineId);
      if (nextLine === null) {
        stopCurrentGame();
        return;
      }
      // let nextLine = getLineWithIndex(parseInt(parentLine.id) + 1);
      if (letterIndex.current !== 0) {
        if (siblingWords[siblingWords.length - 1] === activeWord) {
          wordIndex.current++;
          updateCursor();
        }
      }
      return;
    }

    // Backspace logic.
    if (e.key === "Backspace") {
      if (letterIndex.current === 0) {
        let prevWord = getWordWithIndex(wordIndex.current - 1);
        if (prevWord && !prevWord.classList.contains("hidden"))
          wordIndex.current--;
        if (ctrl.current === true) {
          prevWord = getWordWithIndex(wordIndex.current);
          if (prevWord !== null) {
            letters = Array.from(prevWord.getElementsByClassName("letter"));
            letterIndex.current = letters.length - 1;
            while (letterIndex.current >= 0) {
              if (letters[letterIndex.current].classList.contains("added")) {
                activeWord.removeChild(letters[letterIndex.current]);
              } else {
                letters[letterIndex.current].classList.remove("typed");
                letters[letterIndex.current].classList.remove("correct-letter");
                letters[letterIndex.current].classList.remove(
                  "incorrect-letter"
                );
              }
              letterIndex.current--;
            }
          }
        }
      } else {
        letterIndex.current--;
        if (ctrl.current === false) {
          removeLetterFromWord(activeWord, letters);
        } else {
          while (letterIndex.current >= 0) {
            removeLetterFromWord(activeWord, letters);
            letterIndex.current--;
          }
        }
      }
    } else {
      if (letterIndex.current >= letters.length) {
        const newElement = document.createElement("div");
        newElement.className = "letter typed added incorrect-letter";
        newElement.textContent = e.key;
        activeWord.appendChild(newElement);
        recordMistake();
      } else {
        letters[letterIndex.current].classList.add("typed");
        if (letters[letterIndex.current].textContent === e.key) {
          letters[letterIndex.current].classList.add("correct-letter");
          setCorrectCharCount(correctCharCount + 1);
        } else {
          letters[letterIndex.current].classList.add("incorrect-letter");
          recordMistake();
        }
      }
    }
    updateCursor();
  };

  const updateCursor = () => {
    let activeWord: HTMLElement | null = getWordWithIndex(wordIndex.current);
    let letters: Array<Element> = [];
    if (activeWord === null) {
      return;
    }
    letters = Array.from(activeWord.getElementsByClassName("letter"));
    let letIndex = letters.length + 1;
    for (let i = 0; i < letters.length; i++) {
      if (!letters[i].classList.contains("typed")) {
        letIndex = i;
        break;
      }
    }
    let parentContainer = Array.from(
      document.getElementsByClassName("typing-container")
    )[0];

    let currentX = cursorX;
    let tempTop = currentX;
    let parent = parentContainer.getBoundingClientRect();
    if (letters[letIndex]) {
      let child = letters[letIndex].getBoundingClientRect();
      tempTop = child.top - parent.top;
      setCursorY(child.left - parent.left);
    } else if (letters[letters.length - 1]) {
      let child = letters[letters.length - 1].getBoundingClientRect();
      tempTop = child.top - parent.top;
      setCursorY(child.right - parent.left);
    } else {
      console.log("FAILED TO UPDATE");
    }

    if (Math.abs(currentX - tempTop) > 5 && currentX < tempTop) {
      // Cursor has changed lines.
      setPrevLineWordIndex(wordIndex.current);
      if (prevLineWordIndex !== 0 && wordIndex.current !== prevLineWordIndex) {
        setCursorX(currentX);
        hideEveryWordBeforeWordIndex(prevLineWordIndex);
      }
    }

    if (letters[letIndex]) {
      let child = letters[letIndex].getBoundingClientRect();
      setCursorX(child.top - parent.top);
    } else if (letters[letters.length - 1]) {
      let child = letters[letters.length - 1].getBoundingClientRect();
      setCursorX(child.top - parent.top);
    } else {
      console.log("FAILED TO UPDATE");
    }
  };

  const hideEveryWordBeforeWordIndex = (currentWordIndex: number) => {
    if (currentWordIndex === wordIndex.current) {
      return;
    }
    for (let index = currentWordIndex; index >= 0; index--) {
      let activeWord: HTMLElement | null = getWordWithIndex(index);
      if (activeWord === null || activeWord.classList.contains("hidden")) break;
      activeWord.classList.add("hidden");
    }
    // need to remove the ENTER that is on the end of every line.
    // first get the line and check if all the words are hidden. If YES then remove the "endline" classname
    let activeWord: HTMLElement | null = getWordWithIndex(wordIndex.current);
    if (activeWord === null) return;
    let parentLine = activeWord.parentElement;
    let siblingWords: Array<Element> = [];
    if (parentLine === null) return;
    let lineBeforeId = parseInt(parentLine.id.slice(4)) - 2;
    if (lineBeforeId < 0) return;
    // get line by parentLine.id - 1
    let lineBefore: HTMLElement | null = getLineWithIndex(lineBeforeId);
    if (lineBefore === null) return;
    siblingWords = Array.from(lineBefore.getElementsByClassName("word"));
    if (
      siblingWords.length !== 0 &&
      siblingWords[siblingWords.length - 1].classList.contains("hidden")
    ) {
      lineBefore.classList.add("hidden");
    }
  };

  const removeLetterFromWord = (
    activeWord: HTMLElement,
    letters: Array<HTMLElement>
  ) => {
    if (letters[letterIndex.current].classList.contains("added")) {
      activeWord.removeChild(letters[letterIndex.current]);
    } else {
      letters[letterIndex.current].classList.remove("typed");
      letters[letterIndex.current].classList.remove("correct-letter");
      letters[letterIndex.current].classList.remove("incorrect-letter");
    }
  };

  const handleChangeTimeLength = (duration: number) => {
    timeLength.current = duration;
    restart();
  };

  return (
    <div className="page-container">
      <h1>ABTyping</h1>
      <div className="dropdown">
        <button>{timeLength.current} Seconds</button>
        <div className="dropdown-content">
          <div
            className="dropdown-time"
            onClick={() => {
              handleChangeTimeLength(5);
            }}
          >
            5 test
          </div>
          <div
            className="dropdown-time"
            onClick={() => {
              handleChangeTimeLength(15);
            }}
          >
            15
          </div>
          <div
            className="dropdown-time"
            onClick={() => {
              handleChangeTimeLength(30);
            }}
          >
            30
          </div>
          <div
            className="dropdown-time"
            onClick={() => {
              handleChangeTimeLength(60);
            }}
          >
            60
          </div>
          <div
            className="dropdown-time"
            onClick={() => {
              handleChangeTimeLength(120);
            }}
          >
            120
          </div>
        </div>
      </div>
      {endScreen && (
        <div className="end-screen-container">
          <AfterGameLineChart
            wpm={wpmTime}
            rawWpm={rawWpmTime}
            mistakes={mistakesTime}
          />
        </div>
      )}
      <div
        style={{ display: endScreen ? "none" : "block" }}
        className="timer-display"
      >
        {remaining}
      </div>
      <div
        className="typing-container"
        style={{ display: endScreen ? "none" : "block" }}
      >
        <div className="all-words" ref={allWordsRef}>
          {words}
        </div>
        <input
          ref={inputFieldRef}
          className="input-field"
          readOnly
          onKeyDown={handleChange}
          onKeyUp={handleCtrl}
          disabled={!readyToStart} // Disable input when timer ends
        />
        <div
          className="letter-highlighter"
          style={{ top: `${cursorX}px`, left: `${cursorY}px` }}
        ></div>
      </div>
      <div className="display-stats-container">
        <div className="wpm-display">
          WPM: <span>{wpm}</span>
        </div>
        <div className="raw-wpm-display">RAW: {rawWpm}</div>
        <div className="mistakes-display">
          MISTAKES: <span>{mistakes}</span>
        </div>
      </div>
      <button
        onClick={() => {
          restart();
        }}
      >
        RESTART
      </button>
    </div>
  );
};

export default LandingPage;

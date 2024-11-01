import { useState, useRef, useEffect } from "react";
import jeremiah12 from "./data.json";

const LandingPage = () => {
  const wordIndex = useRef(0);
  const letterIndex = useRef(0);
  const allWordsRef = useRef<HTMLDivElement | null>(null);
  const ctrl = useRef(false);

  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);

  const [typing, setTyping] = useState(false);
  const [readyToStart, setReadyToStart] = useState(true);
  const [timeLength, setTimeLength] = useState(10);
  const [startTime, setStartTime] = useState(Date.now());
  const [remaining, setRemaining] = useState(timeLength);
  const [wordCount, setWordCount] = useState(0); // Track words typed
  const [wpm, setWpm] = useState(0); // WPM to display after timer ends
  const [rawWpm, setRawWpm] = useState(0);
  // const [timeMulti] = useState(timeLength / 60);

  const [wpmTime, setWpmTime] = useState<{ [key: number]: number }>({});
  const [rawWpmTime, setRawWpmTime] = useState<{ [key: number]: number }>({});
  const [mistakesTime, setMistakesTime] = useState<{ [key: number]: number }>(
    {}
  );

  let countWordIndex = -1;

  const [words, setWords] = useState<JSX.Element[]>([]);

  const restart = () => {
    console.log("restarting");

    // Reset state and refs
    setRemaining(timeLength);
    setTyping(false);
    setReadyToStart(true);
    setWordCount(0);
    setWpm(0);
    setRawWpm(0);
    setRawWpmTime({});
    setWpmTime({});
    setMistakesTime([]);

    wordIndex.current = 0;
    letterIndex.current = 0;
    countWordIndex = -1; // Reset countWordIndex for accurate element IDs

    // Generate fresh content from jeremiah12
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
        })}
      </div>
    ));
    setWords(text); // Reset words with fresh content

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

  const remainingTime = () => {
    return timeLength - (Date.now() - startTime) / 1000;
  };

  const updateTime = () => {
    const tempRemainingTime = remainingTime();
    setRemaining(Math.round(tempRemainingTime));
    let currentTimeMulti = (timeLength - tempRemainingTime) / 60;
    let currentWpm = Math.round(wordCount / currentTimeMulti);
    let currentRawWpm = Math.round(
      (wordIndex.current + 0.5) / currentTimeMulti
    );

    recordWpm(currentWpm);
    recordRawWpm(currentRawWpm);

    if (tempRemainingTime <= 0) {
      setReadyToStart(false); // Stop typing when timer reaches zero
      setWpm(currentWpm);
      setRawWpm(currentRawWpm);
      console.log(wpmTime);
      console.log(rawWpmTime);
      console.log(mistakesTime);
    }
  };

  const recordMistake = () => {
    const currentTime = Math.round(timeLength - remainingTime());
    const temp =
      1 + (currentTime in mistakesTime ? mistakesTime[currentTime] : 0);
    setMistakesTime({
      ...mistakesTime,
      [currentTime]: temp,
    });
  };

  const recordWpm = (wpm: number) => {
    const currentTime = Math.round(timeLength - remainingTime());
    setWpmTime({ ...wpmTime, [currentTime]: wpm });
  };

  const recordRawWpm = (rawWpm: number) => {
    const currentTime = Math.round(timeLength - remainingTime());
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
    }

    let parantLine = activeWord.parentElement;
    let siblingWords: Array<Element> = [];
    if (parantLine !== null) {
      siblingWords = Array.from(parantLine.getElementsByClassName("word"));
    }

    if (e.key === " ") {
      if (letterIndex.current !== 0) {
        if (siblingWords[siblingWords.length - 1] === activeWord) {
          return;
        }
        wordIndex.current++;
        setWordCount((prev) => prev + 1); // Increment word count when space is pressed
        updateCursor();
      }
      return;
    }

    if (e.key === "Enter") {
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
        if (wordIndex.current !== 0) wordIndex.current--;
        if (ctrl.current === true) {
          let prevWord = getWordWithIndex(wordIndex.current);
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
        } else {
          letters[letterIndex.current].classList.add("incorrect-letter");
          recordMistake();
        }
      }
    }
    updateCursor();
  };

  const updateCursor = () => {
    let activeWord: HTMLElement = getWordWithIndex(wordIndex.current)!;
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

    let parent = parentContainer.getBoundingClientRect();
    if (letters[letIndex]) {
      let child = letters[letIndex].getBoundingClientRect();
      setCursorX(child.top - parent.top);
      setCursorY(child.left - parent.left);
    } else if (letters[letters.length - 1]) {
      let child = letters[letters.length - 1].getBoundingClientRect();
      setCursorX(child.top - parent.top);
      setCursorY(child.right - parent.left);
    } else {
      console.log("FAILED TO UPDATE");
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

  return (
    <div>
      <h1>LandingPage</h1>
      <div className="typing-container">
        <div className="all-words" ref={allWordsRef}>
          {words}
        </div>
        <input
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
      <div className="timer-display">Time Left: {remaining}s</div>
      <div className="wpm-display">WPM: {wpm}</div>
      <div className="raw-wpm-display">RAW: {rawWpm}</div>
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

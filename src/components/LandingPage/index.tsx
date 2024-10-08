import { useState, useRef } from "react";

const textToDisplay =
  "Space is a near-perfect vacuum without any air. It is not empty: it contains many forms of radiation, as well as particles of gas, dust, and other matter floating around the void. From the Earth, we can observe planets, stars, and galaxies that are within 46.5 billion light-years in any direction from our planet. This region of space is called the observable universe. The estimated age of the universe is from 11.4 billion to 13.8 billion years. What is outer space? From our Earth-bound perspective, outer space is everything that lies outside the boundary separating the Earth from space. There are different definitions of where exactly outer space begins. The most widely used boundary is Karman’s line, which sits 100 km above mean sea level. Starting from this mark, the air becomes too thin for regular aircraft (relying on lift) to fly.";

const LandingPage = () => {
  const wordIndex = useRef(0);
  const letterIndex = useRef(0);
  const ctrl = useRef(false);
  const [text, setText] = useState("");
  const words = textToDisplay.split(" ").map((word, index) => (
    <div className="word" key={index} id={"word" + index.toString()}>
      {word.split("").map((letter, letterInx) => (
        <div className="letter" key={letterInx}>
          {letter}
        </div>
      ))}
    </div>
  ));

  const handleCtrl = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Control") {
      ctrl.current = false;
    }
  };

  const getWordWithIndex = (index: number) =>{
    return document.getElementById(`word${index.toString()}` );
  }

  const handleChange = (e: React.KeyboardEvent<HTMLElement>) => {
    // not letter
    if (e.key === "Control") {
      ctrl.current = true;
    }
    if (e.key.length > 1 && e.key !== "Backspace") {
      return;
    }

    if (e.key === " ") {
      wordIndex.current++;
      return;
    }

    let activeWord = getWordWithIndex(wordIndex.current) 

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

    // Backspace logic.
    if (e.key === "Backspace") {
      if (letterIndex.current === 0) {
        if (wordIndex.current !== 0) wordIndex.current--;
        if (ctrl.current === true) {
          //TODO IMPLEEMNET REMOVE PREVIOUS WORD
          let prevWord = getWordWithIndex(wordIndex.current)
          if (prevWord !== null) {
            letters = Array.from(prevWord.getElementsByClassName("letter"));
            letterIndex.current = letters.length-1;
            // for (let i = 0; i < letters.length; i++) {
            //   if (!letters[i].classList.contains("typed")) {
            //     letterIndex.current = i;
            //     break;
            //   }
            // }
            while (letterIndex.current >= 0) {
              if (letters[letterIndex.current].classList.contains("added")) {
                //remove letter from word
                activeWord?.removeChild(letters[letterIndex.current]);
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
          if (letters[letterIndex.current].classList.contains("added")) {
            //remove letter from word
            activeWord?.removeChild(letters[letterIndex.current]);
          } else {
            letters[letterIndex.current].classList.remove("typed");
            letters[letterIndex.current].classList.remove("correct-letter");
            letters[letterIndex.current].classList.remove("incorrect-letter");
          }
        } else {
          //remove this word
          while (letterIndex.current >= 0) {
            if (letters[letterIndex.current].classList.contains("added")) {
              //remove letter from word
              activeWord?.removeChild(letters[letterIndex.current]);
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
      if (letterIndex.current >= letters.length) {
        //add letter
        const newElement = document.createElement("div");
        newElement.className = "letter typed added incorrect-letter";
        newElement.textContent = e.key;
        activeWord?.appendChild(newElement);
      } else {
        //add incorrect if it is wrong and add correct if it is right
        letters[letterIndex.current].classList.add("typed");
        if (letters[letterIndex.current].textContent === e.key) {
          letters[letterIndex.current].classList.add("correct-letter");
        } else {
          letters[letterIndex.current].classList.add("incorrect-letter");
        }
        letterIndex.current++;
      }
    }
  };

  const removeLetterFromWord = (activeWord, letters) =>{
    if (letters[letterIndex.current].classList.contains("added")) {
      //remove letter from word
      activeWord?.removeChild(letters[letterIndex.current]);
    } else {
      letters[letterIndex.current].classList.remove("typed");
      letters[letterIndex.current].classList.remove("correct-letter");
      letters[letterIndex.current].classList.remove("incorrect-letter");
    }
  }

  return (
    <div>
      <h1>LandingPage</h1>
      <div className="all-words">{words}</div>
      <div className="letter-highlighter"></div>
      <input
        value={text}
        onKeyDown={handleChange}
        onKeyUp={handleCtrl}
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      {wordIndex.current}
    </div>
  );
};

export default LandingPage;

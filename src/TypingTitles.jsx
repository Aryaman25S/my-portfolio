import { useEffect, useState } from "react";

/**
 * Typewriter-style rotating titles with a blinking caret.
 * No external deps. Fully client-side.
 */
export default function TypingTitles({
  words = ["Software Developer", "Machine Learning Engineer", "Data Scientist", "Systems Builder"],
  typingSpeed = 80,      // ms per character while typing
  deletingSpeed = 40,    // ms per character while deleting
  pauseMs = 900,         // pause when a word is fully typed
  className = "",
}) {
  const [index, setIndex] = useState(0);          // which word
  const [text, setText] = useState("");          // visible substring
  const [deleting, setDeleting] = useState(false);
  const [caretOn, setCaretOn] = useState(true);   // blink caret w/o CSS

  // caret blink
  useEffect(() => {
    const id = setInterval(() => setCaretOn((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  // typing / deleting loop
  useEffect(() => {
    const full = words[index % words.length];
    let t = null;

    if (!deleting) {
      if (text.length < full.length) {
        t = setTimeout(() => setText(full.slice(0, text.length + 1)), typingSpeed);
      } else {
        t = setTimeout(() => setDeleting(true), pauseMs);
      }
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText(full.slice(0, text.length - 1)), deletingSpeed);
      } else {
        setDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      }
    }

    return () => t && clearTimeout(t);
  }, [text, deleting, index, words, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span className={`whitespace-nowrap ${className}`} aria-live="polite">
      <span>{text}</span>
      <span aria-hidden className="ml-1" style={{ opacity: caretOn ? 1 : 0 }}>|</span>
    </span>
  );
}

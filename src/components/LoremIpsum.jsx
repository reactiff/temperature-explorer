import React from 'react';
import { LoremIpsum, loremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

const LoremIpsumComponent = (props) => {

  const paragraphs = lorem.generateParagraphs(props.paragraphs);

  const units = props.words ? 'words' : (props.sentences ? 'sentences' : 'paragraphs');
  const count = props.words ? props.words : (props.sentences ? props.sentences : props.paragraphs);

  const tokens = loremIpsum({
    count,                // Number of "words", "sentences", or "paragraphs"
    format: "plain",         // "plain" or "html"
    paragraphLowerBound: 3,  // Min. number of sentences per paragraph.
    paragraphUpperBound: 7,  // Max. number of sentences per paragarph.
    random: Math.random,     // A PRNG function
    sentenceLowerBound: 5,   // Min. number of words per sentence.
    sentenceUpperBound: 15,  // Max. number of words per sentence.
    suffix: "\n",            // Line ending, defaults to "\n" or "\r\n" (win32)
    units: units,            // paragraph(s), "sentence(s)", or "word(s)"
    words: props.dictionary  // Array of words to draw from
  }).split('\n');

  return <> 
    {
      tokens.map((text, index) => {
        if (props.element) {
          return props.element(text);
        }
        return text;
      })
    }
  </>
}

export default LoremIpsumComponent;
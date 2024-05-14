import { Line, Type } from './line.js';

// Beispiel für Parse
const parsedLine = Line.parse("key=value");
if (parsedLine) {
	console.log(parsedLine);
} else {
  console.error("Line could not be parsed");
}


import { parse, parseFrame } from "./parser";
import {
  type Frame,
  canonicals,
  getFrame,
  getId,
  left,
  mapping,
  right,
  validWorlds,
  worlds,
} from "./semantics";
import { sample } from "./utils";

import { stdin, stdout } from "node:process";
import * as readline from "node:readline";

let frame: Frame = { relations: new Set() };
let count = 0;

const reset = () => {
  frame = getFrame(sample(canonicals, 1)[0]);
  count = 10;
  console.log(
    `A new Kripke frame is created! It has 4 worlds and ${frame.relations.size} relations.`,
  );
};

const show = () => {
  console.log(`id: ${getId(frame)}`);
  for (const rel of frame.relations) {
    console.log(`${left(rel)} ==> ${right(rel)}`);
  }
};

const query = (expr: string) => {
  const fml = parse(expr);
  return validWorlds(frame, fml).length;
};

const guess = (expr: string) => {
  const relations = parseFrame(expr);
  const id = mapping[getId({ relations })];
  return id === getId(frame);
};

const gameover = () => {
  console.log("game over!");
  show();
  reset();
};

const help = () => {
  console.log("<formula> ... check if the formula is valid in the frame");
  console.log("!guess <frame> ... guess the frame");
  console.log("!reset ... abandon this frame and start over");
  console.log("!show ... see the frame (CHEAT)");
  console.log("!help ... show this");
  console.log("!exit ... bye bye");
};

const rl = readline.createInterface({ input: stdin, output: stdout });
console.log("Run !help for available commands.");
reset();
rl.setPrompt(`[${count}] `);
rl.on("line", (line) => {
  const input = line.trim();
  if (input.startsWith("!reset")) reset();
  else if (input.startsWith("!show")) show();
  else if (input.startsWith("!exit")) rl.close();
  else if (input.startsWith("!help")) help();
  else if (input.startsWith("!guess")) {
    const expr = input.replace("!guess", "").trim();
    try {
      if (guess(expr)) {
        console.log("correct! congratulations!!");
        show();
        reset();
      } else {
        console.log("incorrect.");
        count = count - 1;
      }
    } catch (e) {
      console.log("invalid frame expression.");
      console.log("example: aRa, aRb, bRb");
    }
  } else {
    try {
      const num = query(input);
      if (num === 0) {
        console.log("invalid.");
      } else if (num < worlds.length) {
        console.log(`valid in ${num} worlds, invalid in the rest.`);
      } else {
        console.log("valid!");
      }
      count = count - 1;
    } catch (e) {
      console.log("invalid formula");
      console.log("example: Mp -> LMp");
    }
  }
  if (count === 0) gameover();
  rl.setPrompt(`[${count}] `);
  rl.prompt();
}).on("close", () => process.exit(0));
rl.prompt();

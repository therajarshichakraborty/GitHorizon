import readline from "node:readline";
import process from "node:process";
import { exec } from "node:child_process";

export default function executeCliCommands() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    rl.question("please type something in your terminal : \n", answer => {
      const cleanAnswer = answer.trim().toLowerCase();

      if (cleanAnswer === "horizon init") {
        exec(`mkdir .horizon`);
        exec(`touch .horizon/commit-history.json`);
        console.log("Initialized horizon repo in your local folder");
      }
      rl.close();
    });
  } catch (error) {
    console.error("something error happens");
  }
}

executeCliCommands();

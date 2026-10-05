import readline from "node:readline";
import { exec } from "node:child_process";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


rl.question("please type something in your terminal : \n", (answer) => {
    const cleanAnswer = answer.trim().toLowerCase();

    if (cleanAnswer === "horizon init") {
      exec(`mkdir .horizon`);
      exec(`touch .horizon/commit.history.json`)
      console.log("Initialized horizon repo in your local folder");
    } 
    rl.close();
});

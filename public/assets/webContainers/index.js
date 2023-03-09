import express from "express";
import fs from "fs";

const app = express();
const port = 3111;

app.get("/", (req, res) => {
  const data = '{ name: "Jhon Doe", preference: "Apple" }';
  const writeStream = fs.createWriteStream("list.txt");

  for (let count = 0; count < 10; count++) {
    res.write(data);
    writeStream.write(data);
  }

  writeStream.on("error", (err) => {
    console.log("ERROR", err);
  });

  writeStream.on("finish", () => {
    console.log("Finished");
  });

  writeStream.end();

  const readStream = fs.createReadStream("list.txt");
  readStream.pipe(res);
});

app.listen(port, () => {
  console.log(`App is live at http://localhost:${port}`);
});

import express from "express";

const app = express();
const port = 3111;

app.get("/", (req, res) => {
  res.send("Welcome to a WebContainers app Teste! 🥳");
});

app.get("/test", (req, res) => {
  res.send("This is a test endpoint");
});

app.listen(port, () => {
  console.log(`App is live at http://localhost:${port}`);
});

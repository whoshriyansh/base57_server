import express from "express";

const app = express();

app.use(express.json());

app.use("/", (req, res) => {
  res.send("hello Worls");
});

app.listen(8001, () => {
  console.log("App is listning on PORT 8001");
});

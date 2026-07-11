import { createApp } from "./app";
import { getServerEnv } from "./config/env";

const port = getServerEnv().PORT;
const app = createApp();

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

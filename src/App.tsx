import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";
import "./styles.css";

async function installDependencies(webContainerInstance: WebContainer) {
  const installProcess = await webContainerInstance.spawn("npm", ["install"]);

  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      },
    })
  );

  return installProcess.exit;
}

async function startDevServer(
  webContainerInstance: WebContainer,
  set: (value: any) => void
) {
  await webContainerInstance.spawn("npm", ["run", "start"]);

  webContainerInstance.on("server-ready", (port, url) => {
    set(url);
    console.log("URL", url);
  });
}

function App() {
  const [test, setTest] = useState("");

  // useEffect(() => {
  //   if (test) {
  //     async function fetchTest() {
  //       const testingApi = await fetch(test + "/test").then((resp) =>
  //         resp.text()
  //       );
  //       console.log({ testingApi });
  //     }
  //     fetchTest();
  //   }
  // }, [test]);

  useEffect(() => {
    window.addEventListener("load", async () => {
      const indexScript = await fetch("assets/webContainers/index.js")
        .then((resp) => resp.text())
        .then((data) => data);
      const packageScript = await fetch("assets/webContainers/package.json")
        .then((resp) => resp.text())
        .then((data) => data);

      const webContainerInstance = await WebContainer.boot();
      await webContainerInstance.mount({
        "index.js": {
          file: {
            contents: indexScript,
          },
        },
        "package.json": {
          file: {
            contents: packageScript,
          },
        },
      });

      const exitCode = await installDependencies(webContainerInstance);
      if (exitCode !== 0) {
        throw new Error("Installation failed");
      }

      await startDevServer(webContainerInstance, setTest);
    });
  }, []);

  return <div className="container">Test fetching scripts</div>;
}

export default App;

import { WebContainer } from "@webcontainer/api";
import { useEffect } from "react";
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

async function startDevServer(webContainerInstance: WebContainer) {
  await webContainerInstance.spawn("npm", ["run", "start"]);

  webContainerInstance.on("server-ready", (port, url) => {
    console.log("URL", url);
  });
}

function App() {
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

      await startDevServer(webContainerInstance);
    });
  }, []);

  return <div className="container">Test fetching scripts</div>;
}

export default App;

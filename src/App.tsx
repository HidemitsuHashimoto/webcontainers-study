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

  return webContainerInstance;
}

function App() {
  useEffect(() => {
    const frame: any = document.querySelector("#frame");
    window.addEventListener("load", async () => {
      const webContainerInstance = await WebContainer.boot();

      const indexScript = await fetch("assets/webContainers/index.js")
        .then((resp) => resp.text())
        .then((data) => data);
      const packageScript = await fetch("assets/webContainers/package.json")
        .then((resp) => resp.text())
        .then((data) => data);

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

      webContainerInstance.on("server-ready", (port, url) => {
        frame.src = url;
      });

      await startDevServer(webContainerInstance);
    });
  }, []);

  return (
    <div className="container">
      Test fetching scripts
      <iframe id="frame" src="loading.html"></iframe>
    </div>
  );
}

export default App;

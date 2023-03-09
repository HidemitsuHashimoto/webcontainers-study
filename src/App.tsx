import { WebContainer } from "@webcontainer/api";
import { useEffect } from "react";
import "./styles.css";
import { files } from "./webContainer/files";

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
  iframeEl: any
) {
  await webContainerInstance.spawn("npm", ["run", "start"]);

  webContainerInstance.on("server-ready", (port, url) => {
    console.log("URL", url);
    iframeEl.src = url;
  });
}

function App() {
  useEffect(() => {
    window.addEventListener("load", async () => {
      const webContainerInstance = await WebContainer.boot();
      await webContainerInstance.mount(files);

      const exitCode = await installDependencies(webContainerInstance);
      if (exitCode !== 0) {
        throw new Error("Installation failed");
      }

      await startDevServer(
        webContainerInstance,
        document.querySelector("#preview")
      );
    });
  }, []);

  return (
    <div className="container">
      <div className="editor">
        <textarea value={files["index.js"].file.contents}>
          I am a textarea
        </textarea>
      </div>
      <div className="preview">
        <iframe id="preview" src="loading.html"></iframe>
      </div>
    </div>
  );
}

export default App;

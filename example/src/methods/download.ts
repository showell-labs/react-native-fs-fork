import {
  completeHandlerIOS,
  downloadFile,
  readFile,
  stopDownload,
  TemporaryDirectoryPath,
} from "@dr.pogodin/react-native-fs";
import { AppState, Platform } from "react-native";
import { tryUnlink, type TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const downloadTests: TestMethods = {
  // TODO: This should live in a dedicated module, with a bunch of tests needed
  // to cover all download-related functions & scenarious; however, to get this
  // function checked faster, placing it here for now.
  "downloadFile()": async () => {
    const url =
      "https://raw.githubusercontent.com/birdofpreyru/react-native-fs/master/example/assets/test/good-utf8.txt";
    const path = `${TemporaryDirectoryPath}/döwnload-file-01`;
    const good = "GÖÖÐ\n";
    await tryUnlink(path);
    try {
      const { jobId, promise } = downloadFile({
        fromUrl: url,
        toFile: path,
      });
      const res = await promise;

      if (typeof jobId !== "number")
        return Result.error(`type ${typeof jobId} !== number`);
      if (res.bytesWritten !== 8)
        return Result.error(`bytesWritten ${res.bytesWritten} !== 8`);
      if (res.statusCode !== 200)
        return Result.error(`statusCode ${res.statusCode} !== 200`);

      const file = await readFile(path);
      if (file !== good) return Result.error(`${file} !== ${good}`);
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },

  "downloadFile() - progress callback": async () => {
    try {
      const url = "https://www.youtube.com/";
      const path = `${TemporaryDirectoryPath}/döwnload-file-01b`;

      return new Promise((resolve) => {
        const timeoutId = setTimeout(
          () => resolve(Result.error("timeout reached")),
          3000
        );

        const { jobId } = downloadFile({
          fromUrl: url,
          toFile: path,
          progress: () => {
            clearTimeout(timeoutId);
            stopDownload(jobId);
            resolve(Result.success());
          },
        });
      });
    } catch (e) {
      return Result.catch(e);
    }
  },
  // FOR THIS TEST TO RUN THE EXAMPLE APP SHOULD BE SENT TO THE BACKGROUND!
  "[iOS] Background downloadFile()": async () => {
    // ! The test should not fail if the platform is not supported
    if (Platform.OS !== "ios") return Result.error("iOS only test");

    const url =
      "https://raw.githubusercontent.com/birdofpreyru/react-native-fs/master/example/assets/test/good-utf8.txt";
    const path = `${TemporaryDirectoryPath}/backgröund-download-file-01`;
    const good = "GÖÖÐ\n";
    await tryUnlink(path);
    try {
      console.info(
        "Send the app to background to run the iOS background download test"
      );
      const promise = new Promise<{ type: "error" } | { type: "success" }>(
        (resolve) => {
          const sub = AppState.addEventListener("change", async (state) => {
            if (state === "background") {
              const { jobId, promise: downloadPromise } = downloadFile({
                fromUrl: url,
                toFile: path,
              });
              sub.remove();
              const res = await downloadPromise;
              completeHandlerIOS(jobId);
              if (
                typeof jobId !== "number" ||
                res.bytesWritten !== 8 ||
                res.statusCode !== 200
              ) {
                resolve(Result.error("Background download test failed"));
                return;
              }
              const file = await readFile(path);
              if (file !== good) {
                resolve(Result.error("Background download test failed"));
                return;
              }
              resolve(Result.success());
            }
          });
        }
      );
      return promise;
    } catch (e) {
      return Result.catch(e);
    }
  },

  // TODO: This is quite a sloppy test.
  "stopDownload()": async () => {
    const url =
      "https://raw.githubusercontent.com/birdofpreyru/react-native-fs/master/example/assets/test/good-utf8.txt";
    const path = `${TemporaryDirectoryPath}/ö-stop-download-test`;
    await tryUnlink(path);
    try {
      const { jobId, promise } = downloadFile({
        fromUrl: url,
        toFile: path,
      });
      stopDownload(jobId);
      try {
        await promise;
      } catch (e: any) {
        if (e.message === "Download has been aborted") return Result.success();
      }
      return Result.error(`Download was not stopped`);
    } catch (e) {
      return Result.catch(e);
    }
  },
};

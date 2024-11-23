import {
  readFile,
  stopUpload,
  TemporaryDirectoryPath,
  uploadFiles,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import { Platform } from "react-native";
import { tryUnlink, type TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';
import { FILE_DIR, waitServer } from "../testServer";

const UPLOAD_FILES_CONTROL_ANDROID = `--*****
Content-Disposition: form-data; name="upload-files-source-file"; filename="upload-files-source-file.txt"
Content-Type: text/plain
Content-length: 8

GÖÖÐ


--*****--
`;

const UPLOAD_FILES_CONTROL_IOS = `Content-Disposition: form-data; name="upload-files-source-file"; filename="upload-files-source-file.txt"
Content-Type: text/plain
Content-Length: 8

GÖÖÐ

`;

const UPLOAD_FILES_CONTROL_WINDOWS = `-------
Content-Length: 8
Content-Disposition: form-data; name="upload-files-source-file"; filename="upload-files-source-file.txt"; filename*=UTF-8''upload-files-source-file.txt

GÖÖÐ

`;

// TODO: Why these messages are different I am not sure. Perhaps WebDAV module
// of the static server outputs dumps incoming messages in different formats on
// different platforms. Should be double-checked at some point.
const UPLOAD_FILES_CONTROL = Platform.select({
  android: UPLOAD_FILES_CONTROL_ANDROID,
  ios: UPLOAD_FILES_CONTROL_IOS,
  macos: UPLOAD_FILES_CONTROL_IOS,
  windows: UPLOAD_FILES_CONTROL_WINDOWS,
  default: "",
});

export const uploadTests: TestMethods = {
  "uploadFiles()": async () => {
    try {
      const server = await waitServer();

      const good = "GÖÖÐ\n";
      const path = `${TemporaryDirectoryPath}/upload-files.txt`;
      await writeFile(path, good);

      const targetDevicePath = `${FILE_DIR}/dav/upload-files.txt`;

      await tryUnlink(targetDevicePath);

      const res = uploadFiles({
        toUrl: `${server?.origin!}/dav/upload-files.txt`,
        method: "PUT",
        files: [
          {
            name: "upload-files-source-file",
            filename: "upload-files-source-file.txt",
            filepath: path,
          },
        ],
      });
      await res.promise;

      let uploadedFile = await readFile(targetDevicePath);
      uploadedFile = uploadedFile.replace(/\r\n/g, "\n");

      if (uploadedFile !== UPLOAD_FILES_CONTROL) {
        console.log("MISMATCH", uploadedFile, UPLOAD_FILES_CONTROL);
      }

      return uploadedFile.includes(UPLOAD_FILES_CONTROL)
        ? Result.success()
        : Result.error(
            `uploadedFile does not include UPLOAD_FILES_CONTROL(${UPLOAD_FILES_CONTROL})`
          );
    } catch (e) {
      return Result.catch(e);
    }
  },
  "uploadFiles() - HTTP error handling": async () => {
    try {
      const server = await waitServer();

      const good = "GÖÖÐ\n";
      const path = `${TemporaryDirectoryPath}/upload-files.txt`;
      await writeFile(path, good);

      const targetDevicePath = `${FILE_DIR}/dav/upload-files.txt`;

      await tryUnlink(targetDevicePath);

      const res = uploadFiles({
        toUrl: `${server?.origin!}/invalid-path/upload-files.txt`,
        method: "PUT",
        files: [
          {
            name: "upload-files-source-file",
            filename: "upload-files-source-file.txt",
            filepath: path,
          },
        ],
      });
      await res.promise;
      return Result.error("HTTP error expected");
    } catch (e: any) {
      return e.message !== "Not Found" || e.result.statusCode !== 404
        ? Result.catch(e)
        : Result.success();
    }
  },
  "stopUpload()": async () => {
    try {
      const server = await waitServer();

      const good = "GÖÖÐ\n";
      const path = `${TemporaryDirectoryPath}/stöp-upload.txt`;
      await writeFile(path, good);

      const targetDevicePath = `${FILE_DIR}/dav/stöp-upload.txt`;

      await tryUnlink(targetDevicePath);

      const res = uploadFiles({
        toUrl: `${server?.origin!}/dav/stöp-upload.txt`,
        method: "PUT",
        files: [
          {
            name: "upload-files-source-file",
            filename: "upload-files-source-file.txt",
            filepath: path,
          },
        ],
      });
      stopUpload(res.jobId);
      await res.promise;

      await readFile(targetDevicePath);
      return Result.error(`File should not exist`);
    } catch (e: any) {
      if (
        e.message.startsWith("ENOENT: no such file or directory, open") &&
        e.message.endsWith("/tmp/test-server/dav/stöp-upload.txt'")
      ) {
        return Result.success();
      }
      return Result.catch(e);
    }
  },
};

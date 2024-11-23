import {
  TemporaryDirectoryPath,
  exists,
  mkdir,
  moveFile,
  readFile,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import { Platform } from "react-native";
import { tryUnlink, type TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const moveFileTests: TestMethods = {
  "moveFile()": async () => {
    // TODO: It should be also tested and documented:
    // -  How does it behave if the target item exists? Does it throw or
    //    overwrites it? Is it different for folders and files?
    // -  What does it throw when attempting to move a non-existing item?
    try {
      const path = `${TemporaryDirectoryPath}/möve-file-test`;
      await tryUnlink(path);
      await mkdir(`${path}/földer`);
      await writeFile(`${path}/ö-test-file.txt`, "Dummy content");
      await writeFile(
        `${path}/földer/anöther-test-file.txt`,
        "Another dummy content"
      );

      // Can it move a file?
      await moveFile(`${path}/ö-test-file.txt`, `${path}/möved-file.txt`);

      if (await exists(`${path}/ö-test-file.txt`)) {
        return Result.error(`file should not exist: ${path}/ö-test-file.txt`);
      }
      if ((await readFile(`${path}/möved-file.txt`)) !== "Dummy content") {
        return Result.error(`file should be moved`);
      }

      // Can it move a folder with its content?
      try {
        await moveFile(`${path}/földer`, `${path}/möved-folder`);
        if (
          (await exists(`${path}/földer`)) ||
          !(await exists(`${path}/möved-folder/anöther-test-file.txt`)) ||
          (await readFile(`${path}/möved-folder/anöther-test-file.txt`)) !==
            "Another dummy content"
        ) {
          return Result.error(`folder should be moved`);
        }
      } catch (e: any) {
        if (
          Platform.OS !== "windows" ||
          e.code !== "EUNSPECIFIED" ||
          e.message !== "The parameter is incorrect."
        ) {
          return Result.catch(e);
        }
      }

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};

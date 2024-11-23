import {
  TemporaryDirectoryPath,
  copyFile,
  copyFileAssets,
  copyFileRes,
  copyFolder,
  exists,
  mkdir,
  readFile,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import { Platform } from "react-native";
import { tryUnlink, type TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const copyTests: TestMethods = {
  // TODO reenable tests
  /*
    This test actually crashes the app... though... I guess it is correctly
    called, not sure what goes wrong inside it.
  'copyAssetsFileIOS()': async () => {
    try {
      // TODO: I even won't bother myself thinking how to automate this
      // test; fine to have it as a manual test for a real device - introduce
      // a valid asset name below, and it will try to copy and check it,
      // otherwise it will just report the test as hanging.
      const asset = 'IMG_6437';
      const path = `${TemporaryDirectoryPath}/cöpy-assets-file-ios`;
      await tryUnlink(path);
      await copyAssetsFileIOS(
        `ph://assets-library://asset/asset.JPG?id=${asset}`,
        path,
        640,
        640,
      );
      return { type: 'success'};
    } catch (e) {
      console.error(e);
      return { type: 'error'};
    }
  },
  'copyAssetsVideoIOS()': async () => {
    try {
      // TODO: I even won't bother myself thinking how to automate this
      // test; fine to have it as a manual test for a real device - introduce
      // a valid asset name below, and it will try to copy and check it,
      // otherwise it will just report the test as hanging.
      const asset = 'IMG_6437';
      const path = `${TemporaryDirectoryPath}/cöpy-assets-video-ios`;
      await tryUnlink(path);
      await copyAssetsVideoIOS(asset, path);
      return { type: 'success'};
    } catch (e) {
      console.error(e);
      return { type: 'error'};
    }
  },
  */
  "copyFile()": async () => {
    // TODO: It should be also tested and documented:
    // -  How does it behave if the target item exists? Does it throw or
    //    overwrites it? Is it different for folders and files?
    // -  What does it throw when attempting to move a non-existing item?
    try {
      const path = `${TemporaryDirectoryPath}/cöpy-file-test`;
      await tryUnlink(path);
      await mkdir(`${path}/földer`);
      await writeFile(`${path}/ö-test-file.txt`, "Dummy content");
      await writeFile(
        `${path}/földer/anöther-test-file.txt`,
        "Another dummy content"
      );

      // Can it move a file?
      await copyFile(`${path}/ö-test-file.txt`, `${path}/möved-file.txt`);
      if (
        (await readFile(`${path}/ö-test-file.txt`)) !== "Dummy content" ||
        (await readFile(`${path}/möved-file.txt`)) !== "Dummy content"
      ) {
        return Result.error("can not move a file");
      }

      //! this should be done in a separate test
      // Can it copy a folder with its content?
      try {
        await copyFile(`${path}/földer`, `${path}/möved-folder`);
        // TODO: For platforms that allow to copy folders, we should do more
        // checks here, similar to moveFile() checks.
        // ! the platform check should be done before the copyFile call and return Status.notAvailable() if the platform is not supported
        return ["android", "windows"].includes(Platform.OS)
          ? Result.error()
          : Result.success();
      } catch (e: any) {
        // ! the error message is not uniform across systems and may be translated depending on the system language
        // => we should probably just check for the error code instead
        if (Platform.OS === "windows") {
          if (
            e.code !== "EUNSPECIFIED" ||
            e.message !== "The parameter is incorrect."
          ) {
            return Result.catch(e);
          }
        } else {
          if (
            e.code !== "EISDIR" ||
            e.message !==
              `EISDIR: illegal operation on a directory, read '${TemporaryDirectoryPath}/cöpy-file-test/földer'`
          ) {
            return Result.catch(e);
          }
        }
      }

      return Result.success();
    } catch (e: any) {
      return Result.catch(e);
    }
  },
  "copyFolder()": async () => {
    // TODO: It should be also tested and documented:
    // -  How does it behave if the target item exists? Does it throw or
    //    overwrites it? Is it different for folders and files?
    // -  What does it throw when attempting to move a non-existing item?
    // ! this test is not independent, it depends on the writeFile test
    try {
      const path = `${TemporaryDirectoryPath}/cöpy-folder-test`;
      await tryUnlink(path);
      await mkdir(`${path}/földer`);
      await mkdir(`${path}/ö-dest`);
      await writeFile(
        `${path}/földer/anöther-test-file.txt`,
        "Another dummy content"
      );

      // Can it copy a folder with its content?
      try {
        await copyFolder(`${path}/földer`, `${path}/ö-dest`);
        // TODO: For platforms that allow to copy folders, we should do more
        // checks here, similar to moveFile() checks.
        // ! the platform check should be done before the copyFolder call and return Status.notAvailable() if the platform is not supported
        return ["android"].includes(Platform.OS)
          ? Result.error()
          : Result.success();
      } catch (e: any) {
        // ! the error message is not uniform across systems and may be translated depending on the system language
        if (Platform.OS === "windows") {
          if (
            e.code !== "EUNSPECIFIED" ||
            e.message !== "The parameter is incorrect."
          ) {
            return Result.catch(e);
          }
        } else {
          if (
            e.code !== "EISDIR" ||
            e.message !==
              `EISDIR: illegal operation on a directory, read '${TemporaryDirectoryPath}/cöpy-file-test/földer'`
          ) {
            return Result.catch(e);
          }
        }
      }

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
  "copyFileAssets()": async () => {
    const path = `${TemporaryDirectoryPath}/gööd-utf8.txt`;

    await tryUnlink(path);
    try {
      // ! what does this line do?:
      if (await exists(path)) return Result.error(`${path} should not exist`);
      await copyFileAssets("test/gööd-utf8.txt", path);
      const res = await readFile(path);
      if (res !== "GÖÖÐ\n") return Result.error(`${res} !== "GÖÖÐ\n"`);
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
  "copyFileAssets() - invalid path": async () => {
    const path = `${TemporaryDirectoryPath}/gööd-utf8.txt`;
    await tryUnlink(path);
    try {
      if (await exists(path)) return Result.error(`${path} should not exist`);
      await copyFileAssets("invalid-path", path);
      return Result.error("should throw an error for invalid path");
    } catch {
      return Result.success();
    }
  },
  // NOTE: This is a new test, for the updated function behavior.
  "copyFileAssets() - new": async () => {
    const dest = `${TemporaryDirectoryPath}/cöpy-file-assets-2`;
    await tryUnlink(dest);
    // await mkdir(dest);
    try {
      await copyFileAssets("test", dest);
      const res = await readFile(`${dest}/gööd-utf8.txt`);
      if (res !== "GÖÖÐ\n") return Result.error(`${res} !== "GÖÖÐ\n"`);
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
  "copyFileRes()": async () => {
    const path = `${TemporaryDirectoryPath}/res_gööd_utf8.txt`;
    await tryUnlink(path);
    try {
      if (await exists(path)) return Result.error(`${path} should not exist`);
      await copyFileRes("good_utf8.txt", path);
      const res = await readFile(path);
      if (res !== "GÖÖÐ\n") return Result.error(`${res} !== "GÖÖÐ\n"`);
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};

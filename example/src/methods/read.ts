import {
  mkdir,
  read,
  readdir,
  readDir,
  readDirAssets,
  readFileAssets,
  readFileRes,
  TemporaryDirectoryPath,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import { isEqual } from "lodash";
import { Platform } from "react-native";
import { SEPARATOR, tryUnlink, type TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const readTests: TestMethods = {
  "read()": async () => {
    try {
      const good = "GÖÖÐ\n";
      const utf8 = "\x47\xC3\x96\xC3\x96\xC3\x90\x0A";
      const path = `${TemporaryDirectoryPath}/ö-read-test`;
      await writeFile(path, utf8, "ascii");

      const expected = ["android", "windows"].includes(Platform.OS) ? "" : good;
      if ((await read(path)) !== expected)
        return Result.error(`Platform dependent read !== ${expected}`);
      if ((await read(path, 8)) !== good)
        return Result.error(`read(8) !== ${good}`);
      if ((await read(path, 5)) !== "GÖÖ")
        return Result.error("read(5) !== GÖÖ");
      // NOTE: No matter the encoding, the length is in bytes, rather than
      // in read symbols.
      if ((await read(path, 4, 1)) !== "ÖÖ")
        return Result.error("read(4, 1) !== ÖÖ");
      if ((await read(path, 2, 1, "ascii")) !== "\xC3\x96")
        return Result.error("read(2, 1, ascii) !== Ö");
      if ((await read(path, 2, 1, "base64")) !== "w5Y=")
        return Result.error("read(2, 1, base64) !== w5Y=");

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
  "readdir()": async () => {
    try {
      const path = `${TemporaryDirectoryPath}/ö-read-dir-test`;
      await tryUnlink(path);
      await mkdir(`${path}/földer`);
      await writeFile(`${path}/ö-file-a.txt`, "A test file");
      await writeFile(`${path}/ö-file-b.txt`, "A second test file");
      const dir = await readdir(path);

      // TODO: As of now, readdir() does not guarantee any specific order
      // of names in the returned listing.
      dir.sort();

      if (
        !isEqual(dir, [
          "földer".normalize(),
          "ö-file-a.txt".normalize(),
          "ö-file-b.txt".normalize(),
        ])
      ) {
        return Result.error(
          `${dir} !== ["földer", "ö-file-a.txt", "ö-file-b.txt"]`
        );
      }

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
  "readDir()": async () => {
    try {
      let path = TemporaryDirectoryPath;
      if (!path.endsWith(SEPARATOR)) path += SEPARATOR;
      path += "read-dir-test";
      await tryUnlink(path);
      const now = Date.now();
      await mkdir(`${path}/földer`);
      await writeFile(`${path}/ö-file-a.txt`, "A test file");
      await writeFile(`${path}/ö-file-b.txt`, "A second test file");
      const dir = await readDir(path);

      // TODO: Currently there is no guarantee on the sort order of the result.
      dir.sort((a, b) => a.name.localeCompare(b.name));

      // First object is a folder created by mkdir.
      let item = dir[0];
      //! WTF
      if (
        !item ||
        (Platform.OS === "android"
          ? item.ctime !== null
          : item.ctime!.valueOf() < now - 1000 ||
            item.ctime!.valueOf() > now + 1000) ||
        !item.isDirectory() ||
        item.isFile() ||
        !(item.mtime instanceof Date) ||
        item.mtime.valueOf() < now - 1000 ||
        item.mtime.valueOf() > now + 1000 ||
        item.name !== "földer".normalize() ||
        item.path !== `${path}${SEPARATOR}földer`.normalize() ||
        // TODO: This is platform dependent,
        // also... why a folder size is 4096 or whatever bytes?
        // Is it really a value reported by OS, or is it
        // something resulting from how the library works?
        item.size !==
          Platform.select({
            android: 4096,
            windows: 0,
            default: 64,
          })
      ) {
        return Result.error("First object is not a folder created by mkdir");
      }

      // Second object is the smaller "file-a.txt"
      item = dir[1];
      if (
        !item ||
        (Platform.OS === "android"
          ? item.ctime !== null
          : item.ctime!.valueOf() < now - 1000 ||
            item.ctime!.valueOf() > now + 1000) ||
        item.isDirectory() ||
        !item.isFile() ||
        !(item.mtime instanceof Date) ||
        item.mtime.valueOf() < now - 1000 ||
        item.mtime.valueOf() > now + 1000 ||
        item.name !== "ö-file-a.txt".normalize() ||
        item.path !== `${path}${SEPARATOR}ö-file-a.txt`.normalize() ||
        // TODO: This can be platform dependent.
        item.size !== 11
      ) {
        return Result.error('Second object is not the smaller "file-a.txt"');
      }

      // Second object is the larger "file-b.txt"
      item = dir[2];
      if (
        !item ||
        (Platform.OS === "android"
          ? item.ctime !== null
          : item.ctime!.valueOf() < now - 1000 ||
            item.ctime!.valueOf() > now + 1000) ||
        item.isDirectory() ||
        !item.isFile() ||
        !(item.mtime instanceof Date) ||
        item.mtime.valueOf() < now - 1000 ||
        item.mtime.valueOf() > now + 1000 ||
        item.name !== "ö-file-b.txt".normalize() ||
        item.path !== `${path}${SEPARATOR}ö-file-b.txt`.normalize() ||
        // TODO: This can be platform dependent.
        item.size !== 18
      ) {
        return Result.error('Third object is not the larger "file-b.txt"');
      }

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
  "readDirAssets()": async () => {
    try {
      let assets = await readDirAssets("test");

      for (let i = 0; i < assets.length; ++i) {
        const a = assets[i];
        if (a?.isDirectory() || !a?.isFile())
          return Result.error(`Item ${i} is not a file`);
      }

      const assets2 = assets.map((asset) => ({
        name: asset.name,
        path: asset.path,
        size: asset.size,
      }));

      if (
        !isEqual(assets2, [
          {
            name: "gööd-latin1.txt",
            path: "test/gööd-latin1.txt",
            size: -1,
          },
          {
            name: "gööd-utf8.txt",
            path: "test/gööd-utf8.txt",
            size: -1,
          },
        ])
      ) {
        return Result.error(
          `Assets do not match the expected list: ${JSON.stringify(assets2)}`
        );
      }

      assets = await readDirAssets("");
      const asset = assets.find((a) => a.name === "test");
      if (!asset?.isDirectory() || asset?.isFile())
        return Result.error("test asset is not a directory");

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }

    /*  TODO: This would be the ideal test, but because isDirectory and isFile
        are functions, making this isEqual check falsy. We'll hovewer probably
        drop these functions in future, and thus use this test then. Also,
        note that currently it does not return ctime, mtime, size values
        for assets. Should we fix something here?
    if (
      !isEqual(await readDirAssets('test'), [
        {
          ctime: null,
          isDirectory: '[Function isDirectory]',
          isFile: '[Function isFile]',
          mtime: null,
          name: 'gööd-latin1.txt',
          path: 'test/gööd-latin1.txt',
          size: 0,
        },
        {
          ctime: null,
          isDirectory: '[Function isDirectory]',
          isFile: '[Function isFile]',
          mtime: null,
          name: 'gööd-utf8.txt',
          path: 'test/gööd-utf8.txt',
          size: 0,
        },
      ])
    ) {
      return { type: 'error'};
    }
    */
  },
  "readFileAssets()": async () => {
    try {
      let res = await readFileAssets("test/gööd-latin1.txt", "ascii");
      if (res !== "GÖÖÐ\n") return Result.error(`ascii: ${res} !== GÖÖÐ\n`);

      res = await readFileAssets("test/gööd-utf8.txt", "ascii");
      if (res !== "\x47\xC3\x96\xC3\x96\xC3\x90\x0A")
        return Result.error(`ascii: ${res} !== GÖÖÐ\n`);

      res = await readFileAssets("test/gööd-utf8.txt", "utf8");
      if (res !== "GÖÖÐ\n") return Result.error(`utf8: ${res} !== GÖÖÐ\n`);

      res = await readFileAssets("test/gööd-utf8.txt");
      if (res !== "GÖÖÐ\n") return Result.error(`default: ${res} !== GÖÖÐ\n`);

      res = await readFileAssets("test/gööd-latin1.txt", "base64");
      if (res !== "R9bW0Ao=")
        return Result.error(`base64: ${res} !== R9bW0Ao=`);

      res = await readFileAssets("test/gööd-utf8.txt", "base64");
      if (res !== "R8OWw5bDkAo=")
        return Result.error(`base64: ${res} !== R8OWw5bDkAo=`);

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
  "readFileRes()": async () => {
    try {
      let res = await readFileRes("good_latin1.txt", "ascii");
      if (res !== "GÖÖÐ\n") return Result.error(`ascii: ${res} !== GÖÖÐ\n`);

      res = await readFileRes("good_utf8.txt", "ascii");
      if (res !== "\x47\xC3\x96\xC3\x96\xC3\x90\x0A")
        return Result.error(`ascii: ${res} !== GÖÖÐ\n`);

      res = await readFileRes("good_utf8.txt", "utf8");
      if (res !== "GÖÖÐ\n") return Result.error(`utf8: ${res} !== GÖÖÐ\n`);

      res = await readFileRes("good_utf8.txt");
      if (res !== "GÖÖÐ\n") return Result.error(`default: ${res} !== GÖÖÐ\n`);

      res = await readFileRes("good_latin1.txt", "base64");
      if (res !== "R9bW0Ao=")
        return Result.error(`base64: ${res} !== R9bW0Ao=`);

      res = await readFileRes("good_utf8.txt", "base64");
      if (res !== "R8OWw5bDkAo=")
        return Result.error(`base64: ${res} !== R8OWw5bDkAo=`);

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};

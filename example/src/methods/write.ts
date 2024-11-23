import {
  readFile,
  TemporaryDirectoryPath,
  unlink,
  write,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import type { TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const writeTests: TestMethods = {
  "readFile() and writeFile()": async () => {
    const good = "GÖÖÐ\n";
    const utf8 = "\x47\xC3\x96\xC3\x96\xC3\x90\x0A";
    const path = `${TemporaryDirectoryPath}/ö-test-file`;
    try {
      await writeFile(path, utf8, "ascii");
      let res = await readFile(path);
      if (res !== good) return Result.error(`${res} !== ${good}`);
      res = await readFile(path, "ascii");
      if (res !== utf8) return Result.error(`${res} !== ${utf8}`);
      await writeFile(path, good);
      res = await readFile(path);
      if (res !== good) return Result.error(`${res} !== ${good}`);
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
  "write()": async () => {
    // TODO: This test is copied from "readFile() and writeFile()", and it is
    // just slightly modified, without much thinking - it does not test all
    // promised behavior of write(). Also, we probably should combine write()
    // and writeFile() functions into one.
    const good = "GÖÖÐ\n";
    const utf8 = "\x47\xC3\x96\xC3\x96\xC3\x90\x0A";
    const path = `${TemporaryDirectoryPath}/ö-write-test`;
    try {
      try {
        await unlink(path);
      } catch {}
      await write(path, utf8, -1, "ascii");
      let res = await readFile(path);
      if (res !== good) return Result.error(`${res} !== ${good}`);
      await write(path, good);
      res = await readFile(path);
      if (res !== `${good}${good}`)
        return Result.error(`${res} !== ${good}${good}`);

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};

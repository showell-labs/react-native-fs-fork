import {
  appendFile,
  readFile,
  TemporaryDirectoryPath,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import type { TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const appendTests: TestMethods = {
  "appendFile()": async () => {
    // TODO: I guess, this test should be improved and elaborated...
    // The current version is just copied & modified from the "readFile() and
    // writeFile()" test, without much thinking about it.
    const good = "GÖÖÐ\n";
    const utf8 = "\x47\xC3\x96\xC3\x96\xC3\x90\x0A"; // === "GÖÖÐ\n"
    const path = `${TemporaryDirectoryPath}/ö-append-file-test`;
    try {
      await writeFile(path, utf8, "ascii");
      await appendFile(path, utf8, "ascii");

      let res = await readFile(path);
      if (res !== `${good}${good}`)
        return Result.error("failed to append utf8");

      await writeFile(path, good);
      await appendFile(path, good);

      res = await readFile(path);
      if (res !== `${good}${good}`)
        return Result.error("failed to append text");

      return Result.success();
    } catch (e: any) {
      return Result.catch(e);
    }
  },
};

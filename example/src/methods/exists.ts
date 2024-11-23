import {
  exists,
  existsAssets,
  existsRes,
  TemporaryDirectoryPath,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import { tryUnlink, type TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const existsTests: TestMethods = {
  "exists()": async () => {
    const path = `${TemporaryDirectoryPath}/ö-test-exists-file`;
    await tryUnlink(path);
    try {
      if (await exists(path)) return Result.error("file should not exist yet");
      await writeFile(path, "xxx");
      if (!(await exists(path))) return Result.error("file should exist");
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
  "existsAssets()": async () => {
    try {
      if (!(await existsAssets("test/gööd-utf8.txt")))
        return Result.error("file should exist");
      if (await existsAssets("test/non-existing.txt"))
        return Result.error("file should not exist");

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
  "existsRes()": async () => {
    try {
      if (!(await existsRes("good_utf8.txt")))
        return Result.error("file should exist");
      if (await existsRes("non_existing.txt"))
        return Result.error("file should not exist");

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};

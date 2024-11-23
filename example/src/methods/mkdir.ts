import {
  TemporaryDirectoryPath,
  exists,
  mkdir,
} from "@dr.pogodin/react-native-fs";
import { tryUnlink, type TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const mkdirTests: TestMethods = {
  "mkdir()": async () => {
    const pathA = `${TemporaryDirectoryPath}/ö-test-mkdir-path`;
    const pathB = `${pathA}/ö-inner/ö-path`;
    await tryUnlink(pathA);
    try {
      if (await exists(pathA))
        return Result.error(`file should not exist yet: ${pathA}`);
      await mkdir(pathB);
      if (!(await exists(pathB)))
        return Result.error(`file should exist: ${pathB}`);
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};

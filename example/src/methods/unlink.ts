import {
  TemporaryDirectoryPath,
  exists,
  mkdir,
  unlink,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import type { TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const unlinkTests: TestMethods = {
  "unlink()": async () => {
    try {
      const dirPath = `${TemporaryDirectoryPath}/ö-test-unlink-dir`;
      const filePath = `${dirPath}/ö-test-unlink-file`;
      await mkdir(dirPath);
      await writeFile(filePath, "xxx");
      if (!(await exists(filePath))) return Result.error("file should exist");
      await unlink(filePath);
      if (await exists(filePath)) return Result.error("file should not exist");
      await writeFile(filePath, "xxx");
      if (!(await exists(filePath))) return Result.error("file should exist");
      await unlink(dirPath);
      if (await exists(filePath)) return Result.error("file should not exist");
      try {
        await unlink(dirPath);
        return Result.error("unlink() should fail");
      } catch {}
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};

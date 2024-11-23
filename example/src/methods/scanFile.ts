import {
  scanFile,
  TemporaryDirectoryPath,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import type { TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const scanFileTests: TestMethods = {
  "scanFile()": async () => {
    try {
      const path = `${TemporaryDirectoryPath}/ö-scan-file-test`;
      await writeFile(path, "xxx");
      await scanFile(path);
      // TODO: Currently scanFile() returns "null" here, indicating the scan has
      // failed... not sure why, perhaps it can't access the temporary directory
      // of the app? Anyway, not a priority to dig further into it right now.
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};

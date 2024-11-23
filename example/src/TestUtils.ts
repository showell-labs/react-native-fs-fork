import { unlink } from "@dr.pogodin/react-native-fs";
import type {
  ErrorStatus,
  NotAvailableStatus,
  PendingStatus,
  SuccessStatus,
} from "./TestTypes";
export const Result = {
  error: (...message: string[]): ErrorStatus => ({
    type: "error",
    message: message.join(" "),
  }),
  catch: (error: any): ErrorStatus => ({
    type: "error",
    message: `${error.code}: ${error.message}`,
  }),
  success: (...message: string[]): SuccessStatus => ({
    type: "success",
    message: message.join(" "),
  }),
  pending: (): PendingStatus => ({ type: "pending" }),
  notAvailable: (): NotAvailableStatus => ({ type: "notAvailable" }),
};

export async function tryUnlink(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch {}
}

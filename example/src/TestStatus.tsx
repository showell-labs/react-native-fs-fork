
interface ErrorStatus {
  type: 'error';
  message?: string;
}
interface SuccessStatus {
  type: 'success';
  message?: string;
}
interface PendingStatus {
  type: 'pending';
}
interface NotAvailableStatus {
  type: 'notAvailable';
}

export type Status = ErrorStatus | SuccessStatus | PendingStatus | NotAvailableStatus;

export type StatusOrEvaluator = Status |
  (() => Status) |
  (() => Promise<Status>);

export const Result = {
  error: (...message: string[]): ErrorStatus => ({ type: 'error', message: message.join(' ') }),
  catch: (error: any): ErrorStatus => ({ type: 'error', message: `${error.code}: ${error.message}` }),
  success: (...message: string[]): SuccessStatus => ({ type: 'success', message: message.join(' ') }),
  pending: (): PendingStatus => ({ type: 'pending' }),
  notAvailable: (): NotAvailableStatus => ({ type: 'notAvailable' }),
};



export interface ValidationErrorDetail {
  field: string;
  error: string;
}

export interface GraphQLFormattedError {
  error: boolean;
  code: string;
  message: string;
  statusCode: number;
  validationErrors?: ValidationErrorDetail[];
}

export interface OriginalErrorResponse {
  message?: string | ValidationErrorItem[];
  error?: string;
  statusCode?: number;
}

export interface ValidationErrorItem {
  property: string;
  message?: string;
  constraints?: Record<string, string>;
}

export interface GraphQLErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

export function isValidationErrorItemArray(
  message: unknown,
): message is ValidationErrorItem[] {
  return (
    Array.isArray(message) &&
    message.length > 0 &&
    typeof message[0] === 'object' &&
    message[0] !== null &&
    'property' in message[0]
  );
}

export function isValidationErrorResponse(
  error: unknown,
): error is OriginalErrorResponse & { message: ValidationErrorItem[] } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    (error as OriginalErrorResponse).statusCode === 400 &&
    'message' in error &&
    isValidationErrorItemArray((error as OriginalErrorResponse).message)
  );
}

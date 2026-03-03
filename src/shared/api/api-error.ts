export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

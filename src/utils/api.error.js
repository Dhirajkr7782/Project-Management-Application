class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message); // Call parent Error constructor

        this.statusCode = statusCode;   // HTTP status code (e.g., 400, 404, 500)
        this.message = message;         // Error message
        this.errors = errors;           // Extra error details (array of errors, validation issues, etc.)
        this.success = false;           // Typo fixed: "succes" → "success"
        this.data = null;               // Any data (null in case of error)

        if (stack) {
            this.stack = stack;         // Use provided stack
        } else {
            Error.captureStackTrace(this, this.constructor); // Generate stack trace automatically
        }
    }
}

export { ApiError };

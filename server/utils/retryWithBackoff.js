/**
 * Retry utility with exponential backoff for handling concurrent updates
 * Useful for MongoDB operations that may fail due to concurrent modifications
 */

/**
 * Execute a function with retry logic and exponential backoff
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @param {Number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {Number} options.initialDelay - Initial delay in milliseconds (default: 100)
 * @param {Number} options.maxDelay - Maximum delay in milliseconds (default: 5000)
 * @param {Number} options.backoffMultiplier - Multiplier for exponential backoff (default: 2)
 * @param {Function} options.shouldRetry - Function to determine if error should trigger retry
 * @returns {Promise} Result of the function execution
 */
async function retryWithBackoff(fn, options = {}) {
    const {
        maxRetries = 3,
        initialDelay = 100,
        maxDelay = 5000,
        backoffMultiplier = 2,
        shouldRetry = defaultShouldRetry
    } = options;

    let lastError;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Execute the function
            const result = await fn();
            
            // If successful, return the result
            if (attempt > 0) {
                console.log(`Operation succeeded after ${attempt} retry attempt(s)`);
            }
            return result;

        } catch (error) {
            lastError = error;

            // Check if we should retry this error
            if (!shouldRetry(error)) {
                console.error('Error is not retryable:', error.message);
                throw error;
            }

            // Check if we've exhausted all retries
            if (attempt >= maxRetries) {
                console.error(`Max retries (${maxRetries}) exceeded`);
                break;
            }

            // Log retry attempt
            console.warn(`Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);

            // Wait before retrying
            await sleep(delay);

            // Calculate next delay with exponential backoff
            delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
    }

    // If we get here, all retries failed
    throw new Error(`Operation failed after ${maxRetries} retries: ${lastError.message}`);
}

/**
 * Default function to determine if an error should trigger a retry
 * @param {Error} error - The error to check
 * @returns {Boolean} True if should retry, false otherwise
 */
function defaultShouldRetry(error) {
    // Retry on these MongoDB error codes:
    // - 11000: Duplicate key error (concurrent insert)
    // - 112: WriteConflict (concurrent update)
    // - 133: FailedToParse
    // - 251: NoSuchTransaction
    
    if (error.code === 11000) {
        // Duplicate key error - might be concurrent insert
        return true;
    }

    if (error.code === 112) {
        // WriteConflict - concurrent modification
        return true;
    }

    if (error.code === 251) {
        // NoSuchTransaction - transaction might have been aborted
        return true;
    }

    // Check for version key mismatch (optimistic locking)
    if (error.name === 'VersionError') {
        return true;
    }

    // Check for transaction errors
    if (error.message && error.message.includes('Transaction')) {
        return true;
    }

    // Check for concurrent modification errors
    if (error.message && (
        error.message.includes('concurrent') ||
        error.message.includes('conflict') ||
        error.message.includes('version')
    )) {
        return true;
    }

    // Don't retry other errors
    return false;
}

/**
 * Sleep for a specified duration
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wrapper for database operations with retry logic
 * Specifically designed for MongoDB operations
 * @param {Function} operation - Async database operation to execute
 * @param {String} operationName - Name of the operation (for logging)
 * @param {Object} retryOptions - Options for retry logic
 * @returns {Promise} Result of the operation
 */
async function retryDatabaseOperation(operation, operationName = 'Database operation', retryOptions = {}) {
    console.log(`Executing ${operationName}...`);
    
    try {
        const result = await retryWithBackoff(operation, {
            maxRetries: 3,
            initialDelay: 100,
            maxDelay: 2000,
            backoffMultiplier: 2,
            ...retryOptions
        });

        console.log(`${operationName} completed successfully`);
        return result;

    } catch (error) {
        console.error(`${operationName} failed after all retries:`, error.message);
        throw error;
    }
}

/**
 * Retry a transaction with exponential backoff
 * Handles MongoDB transaction-specific errors
 * @param {Function} transactionFn - Function that executes the transaction
 * @param {Object} retryOptions - Options for retry logic
 * @returns {Promise} Result of the transaction
 */
async function retryTransaction(transactionFn, retryOptions = {}) {
    return retryWithBackoff(transactionFn, {
        maxRetries: 3,
        initialDelay: 200,
        maxDelay: 3000,
        backoffMultiplier: 2,
        shouldRetry: (error) => {
            // Retry on transaction-specific errors
            if (error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError')) {
                return true;
            }
            
            // Use default retry logic for other errors
            return defaultShouldRetry(error);
        },
        ...retryOptions
    });
}

module.exports = {
    retryWithBackoff,
    retryDatabaseOperation,
    retryTransaction,
    defaultShouldRetry,
    sleep
};

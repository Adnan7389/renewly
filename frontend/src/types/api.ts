/**
 * API Response Type Definitions
 * 
 * These types define the structure of API responses and errors.
 */

/**
 * Standard API error response structure
 */
export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Array<{
        field?: string;
        message: string;
    }>;
}

/**
 * Generic API response wrapper
 * Used when the API returns data with additional metadata
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

/**
 * Axios error with typed response
 */
export interface TypedAxiosError {
    response?: {
        data: ApiError;
        status: number;
        statusText: string;
    };
    message: string;
}

type ErrorLike = {
    message?: string;
    response?: {
        status?: number;
        data?: {
            message?: string;
        };
    };
};

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
    const typedError = (typeof error === 'object' && error !== null ? error : {}) as ErrorLike;
    const status = typedError.response?.status;
    const errorMessage = typedError.message;

    if (typeof status === 'number' && status >= 500 && typeof errorMessage === 'string' && errorMessage.trim()) {
        return errorMessage.trim();
    }

    const responseMessage = typedError.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
        return responseMessage.trim();
    }

    if (typeof errorMessage === 'string' && errorMessage.trim()) {
        return errorMessage.trim();
    }

    return fallback;
};

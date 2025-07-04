export async function handleResponse(
  response: Response,
  defaultMessage: string
) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(response.statusText || defaultMessage);
    }

    if (errorData.errors && Array.isArray(errorData.errors)) {
      const error = new Error(errorData.message || defaultMessage);
      (error as any).errors = errorData.errors;
      throw error;
    }
    throw new Error(errorData.message || defaultMessage);
  }

  return response.json();
}

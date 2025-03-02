import { env } from "@/env";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

type QueryParams = Record<string, string | number | string[]>;

/**
 * Calls the Polygon.io API using the provided endpoint and query parameters.
 *
 * @param endpoint - The API endpoint (relative or full URL). For example:
 *   '/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2023-02-10'
 *   or a full URL.
 * @param queryParams - An object representing query parameters to append to the URL.
 * @param options - Additional options for fetch (e.g., method, body).
 *
 * @returns A Promise resolving to the response typed as T.
 *
 * @throws An error if the API call fails or if the response status is not OK.
 */
export async function polygonApiCall(
  endpoint: string,
  queryParams: QueryParams = {},
  options: RequestOptions = {},
): Promise<any> {
  // Replace with your actual API token or load it from your environment.
  const API_KEY = env.POLYGON_IO_API_KEY;

  // If the endpoint does not start with "http", use the base URL.
  const baseUrl = endpoint.startsWith("http")
    ? endpoint
    : `https://api.polygon.io${endpoint}`;

  // Create a URL instance and append query parameters.
  const url = new URL(baseUrl);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((val) => url.searchParams.append(key, String(val)));
    } else {
      url.searchParams.append(key, String(value));
    }
  });

  // Set up the headers (with the API token in the Authorization header).
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
    ...(options.headers || {}),
  };

  const fetchOptions: RequestOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url.toString(), fetchOptions);
    if (!response.ok) {
      let errorInfo: string;
      try {
        errorInfo = await response.text();
      } catch (e) {
        errorInfo = response.statusText;
      }
      throw new Error(`Polygon API error ${response.status}: ${errorInfo}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return "No data found";
  }
}

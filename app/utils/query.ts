import { ErrorResponse } from "@remix-run/react";
import camelcaseKeys from "camelcase-keys";
import { User } from "@prisma/client";

function fetchData<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  return fetch(`/apis${path}`, options)
    .then(async (response) => {
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        const errorMessage = errorData.data || "Unknown error";
        throw new Error(errorMessage);
      }
      return response.json();
    })
    .then((result) => camelcaseKeys(result, { deep: true }) as T)
    .catch((error) => {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Something wrong");
      }
    });
}

type EmployeesResponse = Array<Pick<User, "id" | "name" | "email">>;
export async function getEmployees({ q }: { q: string }) {
  const params = new URLSearchParams();
  params.append("q", q);
  const queryString = params.toString();
  return fetchData<EmployeesResponse>(`/employees?${queryString}`).then(
    (data) => data
  );
}

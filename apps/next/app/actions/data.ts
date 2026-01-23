"use server";

const EXPRESS_API_URL = process.env.EXPRESS_API_URL || "http://localhost:3002";

export async function serverActionFetchData(id: number) {
  const response = await fetch(`${EXPRESS_API_URL}/api/data?id=${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
}


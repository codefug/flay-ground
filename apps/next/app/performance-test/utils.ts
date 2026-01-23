export async function fetchRouteHandlerData(id: number) {
  const response = await fetch(`/api/data?id=${id}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch");
  }
  return response.json();
}

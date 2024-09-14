export async function getUuid() {
  try {
    const response = await fetch("/pong/api/v1/auth/token/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    console.log(data);
    if (!response.ok) {
      throw new Error(data.message || "Failed to verify token");
    }
    return data.uuid;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function getUserFromUuid(uuid) {
  try {
    const response = await fetch(`/pong/api/v1/users/${uuid}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    console.log(data);
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user data");
    }
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

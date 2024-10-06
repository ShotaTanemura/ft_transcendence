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

export async function getUsersDataFromName(name) {
  try {
    const response = await fetch(`/pong/api/v1/users/search/${name}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok || !data || !data.users) {
      throw new Error(data.message || "Failed to fetch user data");
    }
    return data.users;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function getAvailablePongGameRoomId() {
  try {
    const response = await fetch(`/ponggame/api/v1/available-roomid`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const matchResultsData = await response.json();
    if (!response.ok) {
      throw new Error(matchResultsData.message || "Failed to fetch user data");
    }
    if (!matchResultsData["roomid"]) {
      throw new Error("Failed to fetch match results");
    }
    console.log(matchResultsData["roomid"]);
    return matchResultsData["roomid"];
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

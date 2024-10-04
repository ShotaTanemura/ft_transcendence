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

export async function getFriendsData() {
  try {
    const response = await fetch(`/pong/api/v1/friends/friends`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok || !data || !data.friends) {
      throw new Error(data.message || "Failed to fetch user data");
    }
    return data.friends;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function getRequestedFriendsData() {
  try {
    const response = await fetch(`/pong/api/v1/friends/friends/requested`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok || !data || !data["requested-friends"]) {
      throw new Error(data.message || "Failed to fetch user data");
    }
    return data["requested-friends"];
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function getPendingFriendsData() {
  try {
    const response = await fetch(`/pong/api/v1/friends/friends/pending`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok || !data || !data["pending-friends"]) {
      throw new Error(data.message || "Failed to fetch user data");
    }
    return data["pending-friends"];
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function sendFriendRequest(name) {
  const send_data = {
    "requested-user-name": name,
  };
  try {
    const response = await fetch(`/pong/api/v1/friends/request/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(send_data),
    });
    const data = await response.json();
    if (!response.ok || !data) {
      throw new Error(data.message || "Failed to send friend request data");
    }
    return true;
  } catch (error) {
    console.error("Error send friend request data:", error);
    return false;
  }
}

export async function approveFriendRequest(name) {
  const send_data = {
    "request-user-name": name,
  };
  try {
    const response = await fetch(`/pong/api/v1/friends/request/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(send_data),
    });
    const data = await response.json();
    if (!response.ok || !data) {
      throw new Error(data.message || "Failed to send friend request data");
    }
    return true;
  } catch (error) {
    console.error("Error send friend request data:", error);
    return false;
  }
}

export async function getUserStatus(name) {
  try {
    const response = await fetch(`/pong/api/v1/users/status/${name}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok || !data || !data["status"]) {
      throw new Error(data.message || "Failed to fetch user data");
    }
    return data["status"];
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

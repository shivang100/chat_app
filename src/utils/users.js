const users = [];

const addUser = ({ id, username, room }) => {
  //clean data
  username = username.trim().toLowerCase();
  room = String(room).trim().toLowerCase(); // Convert room to a string first

  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // validate user name
  if (existingUser) {
    return {
      error: "Username is in use",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsers = (room) => {
  const room_id = String(room).trim().toLowerCase();
  const usersInRoom = users.filter((user) => user.room === room_id);
  return usersInRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsers,
};

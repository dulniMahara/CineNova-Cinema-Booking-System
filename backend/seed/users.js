const User = require("../models/User");

const seedUsers = async () => {
  const users = [
    {
      name: "Cinema Admin",
      email: "admin@cinema.com",
      password: "CinemaAdmin2026",
      role: "admin",
      isEmailVerified: true,
    },
    {
      name: "Demo Customer",
      email: "customer@cinema.com",
      password: "Customer2026",
      role: "customer",
      isEmailVerified: true,
    },
  ];

const createdUsers = [];

for (const userData of users) {
  const user = new User(userData);
  await user.save();
  createdUsers.push(user);
}

  console.log("✅ Users seeded");

  return createdUsers;
};

module.exports = seedUsers;
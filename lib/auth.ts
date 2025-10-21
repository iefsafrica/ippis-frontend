// export async function login(username, password) {
//   // Simulate authentication
//   await new Promise((resolve) => setTimeout(resolve, 1000))

//   if (username === "admin" && password === "admin123") {
//     return true
//   } else {
//     return false
//   }
// }
type User = {
  username: string; // can be email or username
  password: string;
};

const users: User[] = [
  { username: "admin", password: "admin123" },
  { username: "kaumilkalii@gmail.com", password: "admin123" },
  { username: "saidukoto@gmail.com", password: "admin123" },
  { username: "isiakachinwe@gmail.com", password: "admin123" },
];

export async function login(username: string, password: string): Promise<boolean> {
  // Simulate authentication delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  return !!user; // true if user exists and password matches
}

export interface User {
  id: number;
  email: string;
  password: string;
}

let users: User[] = [{
  id: 1,
  email: 'divanshuj17@gmail.com',
  password: '123456'
}];
let nextId = 1;

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function findUserById(id: number): User | undefined {
  return users.find((u) => u.id === id);
}

export function saveUser({ email, password }: { email: string; password: string }): User {
  const user: User = { id: nextId++, email, password };
  users.push(user);
  return user;
}

export { users };

// Role is a plain String column in the D1/SQLite schema (Prisma enums aren't
// supported on the sqlite connector) — this literal union mirrors the values
// actually written to the "role" column.
export type Role = "CUSTOMER" | "ADMIN" | "STAFF";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
    };
  }
  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
  }
}

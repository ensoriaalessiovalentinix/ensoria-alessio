import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { AppError, ConflictError, UnauthorizedError } from '../../lib/errors.js';
import type { RegisterBody, LoginBody } from './auth.schema.js';

export async function register(body: RegisterBody) {
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw new ConflictError('Email already registered');

  const hashedPassword = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hashedPassword,
      name: body.name,
    },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function login(body: LoginBody) {
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const valid = await bcrypt.compare(body.password, user.password);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

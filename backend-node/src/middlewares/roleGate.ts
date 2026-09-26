import { Request, Response, NextFunction } from 'express';

export const roleGate = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.headers['x-user-role'] || req.query.role || 'guest') as string;
    // 'system' is for internal microservices/ML Engine
    if (role === 'system') return next();
    
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: `Forbidden: Role '${role}' lacks sufficient permissions.` });
    }
    next();
  };
};

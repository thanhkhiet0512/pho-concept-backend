import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface AuthCustomerInfo {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  type: 'customer';
}

interface AuthAdminInfo {
  id: number;
  email: string;
  name: string;
  role: string;
  type: 'admin';
}

interface RequestUser {
  _info?: AuthCustomerInfo | AuthAdminInfo;
}

export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    const info = user?._info;

    if (!info) return null;

    if (field) {
      return info[field as keyof typeof info];
    }

    return info;
  },
);

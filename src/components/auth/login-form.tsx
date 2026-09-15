'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LockKeyhole, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormError } from '@/components/common/form-error';
import { useSession } from '@/components/common/session-provider';
import { PasswordInput } from '@/components/common/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { setSession } from '@/lib/auth/session';
import { describeError } from '@/lib/utils/errors';
import { ApiError, ERROR_CODES } from '@/types/api';

const schema = z.object({
  username: z.string().trim().min(1, 'Nhập tên đăng nhập'),
  password: z.string().min(1, 'Nhập mật khẩu'),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [failure, setFailure] = useState<string | null>(null);

  // Đã có phiên (F5 mà cookie refresh còn hạn) thì vào thẳng.
  useEffect(() => {
    if (!loading && user) router.replace('/tong-quan');
  }, [loading, user, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFailure(null);
    try {
      const result = await authApi.login(values);
      setSession(result.access_token, result.user);
      router.replace('/tong-quan');
    } catch (error) {
      // Rẽ nhánh theo `error.code`, không so khớp chuỗi `message`.
      if (error instanceof ApiError && error.is(ERROR_CODES.AUTHENTICATION_FAILED)) {
        setFailure('Tên đăng nhập hoặc mật khẩu không đúng.');
      } else {
        setFailure(describeError(error));
      }
      form.setValue('password', '');
      form.setFocus('password');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormError message={failure} />

      <div className="space-y-2">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="username"
            autoComplete="username"
            autoFocus
            spellCheck={false}
            placeholder="vd. nguyen.van.a"
            aria-invalid={Boolean(errors.username)}
            className="h-11 pl-9"
            {...form.register('username')}
          />
        </div>
        <FieldError message={errors.username?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            className="h-11 pl-9"
            {...form.register('password')}
          />
        </div>
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="h-11 w-full text-[15px] shadow-lg shadow-primary/25">
        {isSubmitting && <Loader2 className="animate-spin" />}
        Đăng nhập
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-danger">{message}</p>;
}

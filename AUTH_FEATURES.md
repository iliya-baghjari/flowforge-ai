# Authentication & Security Features

This document outlines all the authentication and security features implemented in the FlowForge AI application.

## Features Implemented

### 1. **Route Protection & Middleware**
- **File**: `middleware.ts`
- **Description**: Protects all application routes by checking user authentication status
- **Features**:
  - Redirects unauthenticated users to `/login` with callback URL
  - Public routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/auth/error`
  - Protected routes: All `/dashboard/*` routes and other authenticated areas

### 2. **Session Management**
- **Provider**: NextAuth.js v4.24.15 with JWT strategy
- **Features**:
  - Supports multiple authentication providers:
    - Credentials (Email/Password)
    - Google OAuth
    - GitHub OAuth
  - Session includes user info: id, name, email, image, emailVerified

### 3. **Password Reset Flow**
- **Pages**:
  - `/forgot-password` - Email input form
  - `/reset-password?token=` - New password creation
  
- **API Routes**:
  - `POST /api/auth/forgot-password` - Generate and send reset token
  - `POST /api/auth/reset-password` - Validate token and update password

- **Features**:
  - Generates secure tokens (32-byte random hex)
  - Tokens expire in 1 hour
  - Passwords hashed with bcryptjs
  - Security: Email existence not revealed (same message for existing/non-existing emails)

### 4. **Email Verification**
- **Pages**:
  - `/verify-email?token=` - Email verification confirmation
  - `/resend-verification` - Request new verification email

- **API Routes**:
  - `POST /api/auth/verify-email` - Verify email token and mark user as verified
  - `POST /api/auth/resend-verification` - Generate and send new verification token

- **Features**:
  - Tokens expire in 24 hours
  - Users cannot verify already verified emails
  - Success notification and redirect to login after verification

### 5. **Logout Functionality**
- **Component**: `<LogoutButton />` in navbar
- **Features**:
  - Clears NextAuth session
  - Redirects to login page
  - Integrated in user profile dropdown

### 6. **Avatar Upload**
- **Component**: `<AvatarUpload />`
- **API Route**: `POST /api/user/avatar`
- **Features**:
  - Preview before upload
  - Supported formats: JPEG, PNG, WebP
  - Max file size: 5MB
  - Remove/clear functionality
  - Validates file type and size client-side and server-side
  - Stores as base64 (production: use cloud storage like S3/Cloudinary)

### 7. **User Profile Management**
- **Page**: `/dashboard/profile`
- **Features**:
  - View personal information
  - Upload and manage avatar
  - See email verification status
  - View verified email date

## Environment Variables Required

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (optional)
AUTH_GOOGLE_ID=your-google-id
AUTH_GOOGLE_SECRET=your-google-secret
AUTH_GITHUB_ID=your-github-id
AUTH_GITHUB_SECRET=your-github-secret

# Email Service (optional, for actual email sending)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com
```

## Database Schema

### User Model
```prisma
model User {
  id                    String
  name                  String?
  email                 String?  @unique
  emailVerified         DateTime?
  image                 String?
  password              String?
  accounts              Account[]
  sessions              Session[]
  passwordResetTokens   PasswordResetToken[]
  emailVerificationTokens EmailVerificationToken[]
}
```

### Supporting Models
- `PasswordResetToken` - For password reset flow
- `EmailVerificationToken` - For email verification flow
- `VerificationToken` - NextAuth standard token
- `Account` - OAuth account linking
- `Session` - User sessions

## Security Best Practices Implemented

1. **Password Hashing**: bcryptjs with 10 rounds
2. **Token Security**: 32-byte random hex tokens
3. **Token Expiration**: 1 hour for reset, 24 hours for verification
4. **Email Security**: No revealing of email existence
5. **Session Strategy**: JWT (stateless, secure)
6. **File Validation**: Client and server-side validation for avatar uploads
7. **Route Protection**: Middleware-based protection for all protected routes

## Frontend Components

### Authentication Components
- `<LoginForm />` - Email/password login with forgot password link
- `<ForgotPasswordForm />` - Email input for password reset
- `<ResetPasswordForm />` - New password creation with validation
- `<EmailVerificationForm />` - Auto-verify on page load
- `<ResendVerificationForm />` - Resend verification email
- `<LogoutButton />` - Logout with session clearing
- `<AvatarUpload />` - Avatar upload with preview

## Usage Examples

### Basic Login
```typescript
import { signIn } from "next-auth/react";

// In your form handler
await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  redirect: false,
});
```

### Get Current Session
```typescript
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session } = useSession();
  
  return <div>{session?.user?.email}</div>;
}
```

### Logout
```typescript
import { signOut } from "next-auth/react";

await signOut({ redirect: false });
// Handle redirect manually
```

### Update Session (e.g., after avatar upload)
```typescript
import { useSession } from "next-auth/react";

const { data: session, update } = useSession();

// After avatar upload
await update({
  user: {
    ...session?.user,
    image: newImageUrl,
  },
});
```

## Testing Authentication Flows

### 1. Test Password Reset
1. Go to `/forgot-password`
2. Enter any email (will show success message)
3. Check console for the reset URL
4. Visit the URL and reset password
5. Login with new password

### 2. Test Email Verification
1. Register new account
2. Go to `/resend-verification`
3. Enter email
4. Check console for verification URL
5. Visit the URL to verify
6. See "Email verified" in profile

### 3. Test Avatar Upload
1. Go to `/dashboard/profile`
2. Click "Upload Avatar"
3. Select image (JPEG, PNG, or WebP)
4. Verify preview shows image
5. Image is stored and displayed in navbar

### 4. Test Logout
1. Click user dropdown in navbar
2. Click "Logout"
3. Should redirect to login
4. Session is cleared

## Migration Steps (if needed)

Run Prisma migrations:
```bash
npx prisma migrate dev --name add_auth_features
npx prisma db push
```

## Troubleshooting

### Session not persisting
- Check `NEXTAUTH_SECRET` is set
- Verify JWT strategy is configured
- Check browser cookies are enabled

### Middleware not protecting routes
- Verify `middleware.ts` is in root directory
- Check matcher pattern matches your routes
- Clear Next.js cache: `rm -rf .next`

### Email not sending
- Configure SMTP environment variables
- Replace console.log with actual email service in `lib/email.ts`
- Recommended services: SendGrid, Mailgun, AWS SES

### Avatar upload not working
- Check file size < 5MB
- Verify file type is JPEG/PNG/WebP
- Check `/api/user/avatar` permissions
- For production, set up cloud storage (S3, Cloudinary, etc.)

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social login integration (Google, GitHub, Discord)
- [ ] Password strength meter
- [ ] Account recovery codes
- [ ] Session management (view active sessions, logout all)
- [ ] Login activity log
- [ ] Email change verification
- [ ] Account deletion with email confirmation
- [ ] Avatar crop/resize functionality
- [ ] Cloud storage integration for avatars (S3, Cloudinary)

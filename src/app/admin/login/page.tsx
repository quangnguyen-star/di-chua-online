export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main>
      <h1>Admin sign in</h1>
      {error ? <p role="alert">Email or password is incorrect.</p> : null}
      <form method="post" action="/api/admin/login">
        <p>
          <label>
            Email <input name="email" type="email" required autoComplete="username" />
          </label>
        </p>
        <p>
          <label>
            Password <input name="password" type="password" required autoComplete="current-password" />
          </label>
        </p>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}

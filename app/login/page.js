import LoginForm from "./LoginForm";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  return <LoginForm linkError={sp?.error === "link"} />;
}

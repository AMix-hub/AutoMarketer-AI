import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
      <SignUp />
    </main>
  );
}

import { SignedOut, SignIn, SignedIn } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <SignedOut>
      <SignIn
        fallbackRedirectUrl='/dashboard'
        appearance={{ elements: { footerAction: { display: "none" } } }}
        routing='hash'
      />
      </SignedOut>
      <SignedIn>
      <a
        href="/dashboard"
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Ir al dashboard
      </a>
      </SignedIn>
    </div>
  );
}

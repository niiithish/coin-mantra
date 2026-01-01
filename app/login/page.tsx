import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginCard from "@/components/login-card";
import ReviewCard from "@/components/review-card";
import Image from "next/image";
const Login = async () => {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <>
      <div className="flex flex-row h-screen">
        <div className="flex flex-col flex-2 items-start justify-center">
          <header className="flex mt-6 ml-6 gap-2">
            <Image src="/logo.svg" alt="logo" height={30} width={30} />
            <h1 className="text-xl font-bold">CoinWatch</h1>
          </header>
          <div className="flex items-center justify-center h-full w-full">
            <LoginCard />
          </div>
        </div>
        <div className="flex flex-3 flex-col justify-center bg-card">
          <div className="flex items-center items-center justify-center h-full">
            <ReviewCard />
          </div>
          <div className="flex items-end justify-end">
            <Image src="/dashboard.webp" alt="Image" height={560} width={480} />
          </div>
        </div>
      </div>
    </>
  );
};
export default Login;

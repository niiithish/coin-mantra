import Image from "next/image";
import LoginCard from "@/components/login-card";
import ReviewCard from "@/components/review-card";

const Login = async () => {
  return (
    <div className="flex h-screen flex-row">
      <div className="flex flex-2 flex-col items-start justify-center">
        <div className="flex h-full w-full items-center justify-center">
          <LoginCard />
        </div>
      </div>
      <div className="flex flex-3 flex-col justify-center bg-card">
        <div className="flex h-full items-center items-center justify-center">
          <ReviewCard />
        </div>
        <div className="flex items-end justify-end">
          <Image alt="Image" height={560} src="/dashboard.webp" width={480} />
        </div>
      </div>
    </div>
  );
};
export default Login;

/* eslint-disable react/prop-types */
import AuthBg from "../../assets/images/AuthBg.png";
import Navbar from "./widgets/Navbar";

export default function OnboardingLayout({ children }) {
  return (
    <main
      className="min-h-screen bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${AuthBg})` }}
    >
      <div className="lg:max-w-screen-xl mx-auto">
        <div className="w-fit lg:w-auto mx-auto">
          <Navbar />
        </div>
        <div className="flex justify-center items-center">{children}</div>
      </div>
    </main>
  );
}

export function OnboardingLayout2({ children }) {
  return (
    <main className="min-h-screen bg-secondary">
      <div className="max-w-screen-xl mx-auto">
        <div className="w-fit lg:w-auto mx-auto">
          <Navbar />
        </div>{" "}
        <div className="flex justify-center items-center">{children}</div>
      </div>
    </main>
  );
}

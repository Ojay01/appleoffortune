import { Logo } from "../atoms/Logo"

export const Header = () => (
  <header className="sticky top-0 z-10 shadow-md">
    {/* Background image container */}
    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: "url('/bgimg.jpg')" }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
    </div>
        <div className="relative bg-transperent ">
      <div className="max-w-md mx-auto px-4 md:max-w-screen-md lg:max-w-screen-lg">
        <div className="py-3 flex items-center justify-center">
          <div className="relative z-10">
            <Logo />
          </div>
        </div>
      </div>
    </div>
  </header>
);
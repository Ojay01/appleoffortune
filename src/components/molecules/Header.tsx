import { Logo } from "../atoms/Logo"

export const Header = () => (
  <header className="sticky top-0 z-10 bg-gradient-to-r from-green-700 to-green-600 shadow-md">
    <div className="max-w-md mx-auto px-4 md:max-w-screen-md lg:max-w-screen-lg">
      <div className="py-3 flex items-center justify-center">
        <Logo />
      </div>
    </div>
  </header>
);
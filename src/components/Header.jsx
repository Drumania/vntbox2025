import { Link } from "react-router-dom";
import Search from "./Search";
import HeaderAvatar from "./HeaderAvatar";

const Header = () => {
  return (
    <nav className="mb-5">
      <Link to="/" className="logo">
        <img src="/logo.png" alt="vntbox" />
      </Link>

      <div className="row no-gutters">
        <Search />
      </div>

      <HeaderAvatar />
    </nav>
  );
};

export default Header;

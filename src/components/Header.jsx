import { Link } from "react-router-dom";
import Search from "./Search";
import HeaderAvatar from "./HeaderAvatar";

const Header = () => {
  return (
    <nav className="row mb-4">
      <Link to="/" className="col-3 logo">
        <img src="/logo.png" alt="vntbox" />
      </Link>

      <div className="col-5 row no-gutters">
        <Search />
      </div>

      <div className="col-4">
        <HeaderAvatar />
      </div>
    </nav>
  );
};

export default Header;

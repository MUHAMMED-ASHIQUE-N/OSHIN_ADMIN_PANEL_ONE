import logo from "../../assets/logo/Oshin_Calicut_Logo.jpg";
import { FaUserCircle } from "react-icons/fa";

function Nav() {
  return (
    <div className="flex justify-between items-center px-4 md:px-8 py-2   border-b border-gray-200 bg-background ">
      <img src={logo} width={50} alt="" />
      <div className="flex  items-center gap-4">
        {" "}
        <FaUserCircle className="text-3xl text-pink-700" />
        <p className="text-[#949CA1]">Admin</p>
      </div>
    </div>
  );
}

export default Nav;

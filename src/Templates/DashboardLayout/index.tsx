/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Avatar } from "@mui/material";
import MessageModal from "../../Components/Modals/MessageModal";
import BasitechLogo2 from "../../assets/icons/BasitechLogo2.svg";
import LogoutIcon from "../../Components/Vectors/LogoutIcon";
import CustomLink from "../../Components/CustomLink";
import MenuLink from "./widgets/MenuLink";
import { useDispatch } from "react-redux";
import AdminDashboard from "../../Pages/Dashboard/Home";
import { logout } from "../../redux/slice/userSlice";

export default function DashboardLayout() {
  const [pageTitle, setPageTitle] = useState("");
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const location = useLocation();
  const [schMgtDropdown, setSchMgtDropdown] = useState(false);
  // const match = Boolean(location.pathname.includes("school-management"));
  // const match2 = function (path) {
  //   return Boolean(location.pathname.includes(path));
  // };
  const APP_URL = window.location.pathname;
  // const { search } = useLocation();
  // const params = new URLSearchParams(search);
  // const tab = params.get("tab");
  const dropdownRef = useRef<HTMLButtonElement | null>(null);
  // console.log(children)

  const dispatch = useDispatch();

  // Auto-set page title from URL if not already set
  useEffect(() => {
    const pathMap: Record<string, string> = {
      '/school-management/academics': 'Academics',
      '/school-management/admission': 'Admission',
      '/school-management/attendance': 'Attendance',
      '/school-management/fee-management': 'Fee Management',
      '/school-management/inventory': 'Inventory',
      '/staff-management': 'Staff Management',
      '/student-management': 'Student Management',
      '/settings': 'Settings',
      '/support': 'Support',
      '/': 'Dashboard',
    };
    const matchedTitle = Object.entries(pathMap).find(([path]) => 
      location.pathname.startsWith(path) && path !== '/'
    );
    if (matchedTitle) {
      setPageTitle(matchedTitle[1]);
    } else if (location.pathname === '/') {
      setPageTitle('Dashboard');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.removeItem("token");
    window.location.href = "/login";
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSchoolManagementActive =
    location.pathname.startsWith("/school-management");
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({
        behavior: "instant",
        block: "start",
      });
    }
  }, [location.pathname]);

  return (
    <div className="max-h-screen overflow-hidden py-5 pr-0 flex items-stretch">
      <aside
        className={`overflow-y-auto my-2 flex flex-col z-50 fixed max-h-screen bg-white min-h-screen w-[70%] max-w-[280px] min-w-[80px] transition-all duration-500 lg:sticky lg:min-w-[283px] ${
          isSideBarOpen
            ? "left-0 w-[70%] lg:min-w-[280px]"
            : "-left-[100vw] lg:left-0"
        }`}
      >
        <div className="flex items-center">
          <img
            src={BasitechLogo2}
            alt="logo"
            className="ml-[34px] mt-7 mb-[30px] h-[52px] w-[52px]"
          />
          <p className="font-semibold text-2xl text-black ml-3">Super Admin</p>
        </div>

        <div className="flex flex-col justify-between h-full">
          <div className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-y-6 text-text-sec">
              {MenuLink.map((menu, i) =>
                menu.name === "School Management" ? (
                  <div key={i}>
                    <div className="flex flex-row gap-x-5">
                      <span
                        className={`${
                          isSchoolManagementActive
                            ? "bg-tertiary"
                            : "bg-transparent"
                        } h-[45px] w-[20px] rounded-s-none rounded-[10px]`}
                      ></span>
                      <button
                        ref={dropdownRef}
                        className={`flex items-center gap-x-4 w-full rounded-[5px] p-2 ${
                          isSchoolManagementActive
                            ? "bg-tertiary text-white"
                            : "text-text-sec hover:text-white hover:bg-tertiary"
                        }`}
                        onClick={() => setSchMgtDropdown(!schMgtDropdown)}
                      >
                        {menu.icon} {menu.name}
                      </button>
                    </div>
                    <ul
                      className={`mt-5 flex-col gap-y-[13px] pl-9 duration-150 transition-all ${
                        schMgtDropdown ? "flex" : "hidden"
                      }`}
                    >
                      {menu.sublinks?.map((sublink, i) => (
                        <li
                          key={i}
                          onClick={() => {
                            setIsSideBarOpen(!isSideBarOpen);
                            setPageTitle(sublink.name);
                          }}
                        >
                          <Link
                            to={`/${menu.link}/${sublink.link}`}
                            className={`w-full py-2.5 px-11 text-sm hover:text-tertiary ${
                              location.pathname ===
                              `/${menu.link}/${sublink.link}`
                                ? "text-tertiary"
                                : "text-sec"
                            }`}
                          >
                            {sublink.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <li
                    key={i}
                    className="flex flex-row gap-x-5"
                    onClick={() => {
                      setIsSideBarOpen(false);
                      setPageTitle(menu.name);
                    }}
                  >
                    <CustomLink
                      to={menu.link}
                      icon={menu.icon}
                      name={menu.name}
                    />
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="mt-auto pb-8">
            <button
              onClick={() => setOpenLogout(true)}
              className="flex items-center gap-x-4 text-text-sec pl-12"
            >
              <LogoutIcon /> <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
      <div className="relative pt-3 flex flex-col overflow-y-auto flex-grow overflow-x-hidden lg:ml-3">
        <nav className="sticky top-[-1em] left-0 right-0 z-[10] bg-white flex items-center justify-between py-2 px-4 md:py-4 sm:px-6 lg:hidden">
          <Link to="/" className="lg:hidden">
            <img src={BasitechLogo2} alt="logo" className="h-[52px] w-[52px]" />
          </Link>
          <div className="flex gap-4 w-full justify-end items-center">
            <button
              type="button"
              onClick={() => setIsSideBarOpen(!isSideBarOpen)}
              aria-label="toggle mobile navigation menu"
              className="z-[1000] lg:hidden wfit flex1 flex flex-col items-end transition-all duration-700 ease-in-out"
            >
              <span
                className={`my-1 h-px bg-black transition-all duration-300 ease-linear ${
                  isSideBarOpen ? "w-6 rotate-45" : "w-6"
                }`}
              ></span>
              <span
                className={`my-0.5 h-px bg-black transition-all duration-300 ease-linear ${
                  isSideBarOpen ? "hidden" : "block w-6"
                }`}
              ></span>
              <span
                className={`my-1 h-px bg-black transition-all duration-300 ease-linear ${
                  isSideBarOpen ? "relative -top-2 w-6 -rotate-45" : "w-6"
                }`}
              ></span>
            </button>
          </div>
        </nav>
        <div
          ref={scrollRef}
          className={`lg:border border-[#DEE0E0] rounded-[20px] flex-grow py-6 px-[18px] w-full md:w-[99%] relative ${
            APP_URL.includes("/support") ? "md:bg-bg-2" : "bg-white"
          }`}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-9">
              <p className="font-semibold md:text-2xl text-black capitalize text-lg">
                {pageTitle}
              </p>
              {window.screen.availWidth >= 800 && (
                <Avatar
                  src="/images/placeholder.png"
                  alt="placeholder"
                  sx={{ width: 79, height: 79 }}
                />
              )}
            </div>
            {APP_URL !== "/" ? <Outlet /> : <AdminDashboard />}
          </div>
        </div>
      </div>

      {/* Logout screen modal */}
      <MessageModal
        openModal={openLogout}
        closeModal={() => setOpenLogout(false)}
        desc="Are you sure you want to logout?"
        btn1Name="Yes, Log out"
        handleClick={() => {
          setOpenLogout(false);
          handleLogout();
          console.log("Deleting user stored history");
        }}
        column
      />
    </div>
  );
}
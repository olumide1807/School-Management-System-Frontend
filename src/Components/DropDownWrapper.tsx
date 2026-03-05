import React, { useEffect, useRef, useState } from "react";

// Define the types for the DropDownWrapperProps
interface DropDownWrapperProps {
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contentPadding?: string;
  position?: string;
  orientation?: string;
  mobilePosition?: string;
  closeOnBtnClick?: boolean;
  extraClick?: () => void;
}

const DropDownWrapper: React.FC<DropDownWrapperProps> = ({
  action,
  children,
  className,
  contentPadding = "px-4",
  position = "right",
  orientation = "bottom",
  mobilePosition,
  closeOnBtnClick = false,
  extraClick = () => {},
}) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (
        showDropDown &&
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        setShowDropDown(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [showDropDown]);

  return (
    <div ref={ref} className={`relative w-fit ${className || ""}`}>
      <div
        onClick={() => {
          extraClick();
          setShowDropDown(!showDropDown);
        }}
        className="flex"
      >
        {action}
      </div>
      <div
        className={`absolute w-fit flex flex-col justify-start items-start border shadow rounded-[10px] bg-white z-10 transform scale-0 transition-all duration-150 ${
          mobilePosition ? mobilePosition : `right-0`
        } md:${position}-0 ${
          position === "right" ? "origin-top-right" : "origin-top-left"
        } ${showDropDown ? "scale-100" : ""} ${
          orientation === "top"
            ? `origin-bottom-right bottom-[120%]`
            : `origin-top-right top-[120%]`
        }`}
      >
        <div
          className={`py-2 w-max ${contentPadding} flex flex-col items-start`}
          onClick={() =>
            closeOnBtnClick ? setShowDropDown((prev) => !prev) : null
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default DropDownWrapper;

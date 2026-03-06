import { useState, useRef, useEffect } from "react";
import { MenuItem, Checkbox } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface MenuOption {
  label: string;
  value: string;
  handleClick?: (value: string) => void; // Make handleClick optional
}

interface FilterComponentProps {
  choice?: string;
  menuOptions?: MenuOption[];
  setChoice?: (choice: string) => void;
  otherClasses?: string;
  otherClasses2?: string;
  textColor?: string;
  iconColor?: string;
  multiSelect?: string[]; // Changed from boolean to string array
  label?: string;
  menuLabel?: string;
  setMultiSelect?: (multiSelect: string[]) => void; // Adjusted type
}
export default function FilterComponent({
  choice,
  menuOptions,
  setChoice,
  otherClasses,
  otherClasses2,
  textColor = "#757575",
  iconColor,
  multiSelect,
  label,
  menuLabel,
  setMultiSelect,
}: FilterComponentProps) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const menuOption: MenuOption[] = [
    {
      label: "View class",
      value: "View class",
    },
    {
      label: "Assign teacher",
      value: "Assign teacher",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block mb-2 font-bold text-gray-700">{label}</label>
      <div
        className={`flex flex-col relative border border-[#ABABAB] rounded-[5px] min-w-[163px] ${otherClasses}`}
      >
        <button
          className={`h-[42px] px-3 flex items-center justify-between ${otherClasses2}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          type="button"
        >
          <p className={`${textColor || "text-black"} truncate`}>
            {menuLabel ? menuLabel : choice ? choice : "Select level"}
          </p>
          <span className="flex items-center">
            {dropdownOpen ? (
              <KeyboardArrowUpIcon fontSize="small" sx={{ color: iconColor }} />
            ) : (
              <KeyboardArrowDownIcon
                fontSize="small"
                sx={{ color: iconColor }}
              />
            )}
          </span>
        </button>
      </div>
      {/* Rest of the component remains the same */}
      <div
        style={{ zIndex: 1000 }}
        className={`${
          multiSelect
            ? "w-full mt-3 max-h-48 overflow-y-scroll"
            : "w-max absolute"
        } top-16 border right-0 z-10 flex flex-col gap-y-1  ${
          dropdownOpen ? "" : "hidden"
        } bg-white min-w-[123px] rounded-[10px] py-6 px-4`}
      >
        {(menuOptions ? menuOptions : menuOption)?.map((menu, i) => (
          <MenuItem
            key={i}
            value={menu.value}
            sx={{ padding: "8px", width: "100%" }}
            onClick={() => {
              if (multiSelect) {
                menu.handleClick
                  ? menu.handleClick(menu.value)
                  : setChoice?.(menu.value);
              } else {
                setDropdownOpen(false);
                menu.handleClick
                  ? menu.handleClick(menu.value)
                  : setChoice?.(menu.value);
              }
            }}
          >
            <label htmlFor={"checkbox" + i}>{menu.label}</label>
            <div className="ml-auto">
              {multiSelect && (
                <Checkbox
                  sx={{ border: "none", p: 0 }}
                  defaultChecked={false}
                  id={"checkbox" + i}
                  onClick={() => {
                    menu.handleClick
                      ? menu.handleClick(menu.value)
                      : setChoice?.(menu.value);
                  }}
                />
              )}
            </div>
          </MenuItem>
        ))}
      </div>

      {multiSelect && (
        <div className="flex flex-wrap my-4">
          {multiSelect.map((select, i) => (
            <div
              key={i}
              className="flex bg-[#EFF5F8] p-1 px-2 rounded-full mx-1 my-1 items-center"
            >
              <p className="text-sm">{select}</p>
              <span
                className="cursor-pointer text-red-500 ml-2"
                onClick={() =>
                  // setMultiSelect(multiSelect.filter((e) => e !== select))
                  setMultiSelect
                    ? setMultiSelect(multiSelect.filter((e) => e !== select))
                    : null
                }
              >
                x
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
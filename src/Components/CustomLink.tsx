/* eslint-disable react/prop-types */
import { Link, useMatch } from "react-router-dom";

export default function CustomLink({ icon, name, to, baseUrl = "/" }) {
	let match = useMatch(to !== baseUrl ? baseUrl + to + "/*" : baseUrl);
	return (
		<>
			<span
				className={`${
					match ? "bg-tertiary" : "bg-transparent"
				} h-[45px] w-[20px] rounded-s-none rounded-[10px]`}
			></span>
			<Link
				className={`flex items-center gap-x-4 w-full rounded-[5px] p-2 ${
					match
						? "bg-tertiary text-white"
						: "text-text-sec hover:text-white hover:bg-tertiary"
				}`}
				to={baseUrl === to ? to : baseUrl + to}
			>
				{icon} <span>{name}</span>
			</Link>
		</>
	);
}

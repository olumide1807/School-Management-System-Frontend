/* eslint-disable react/prop-types */
import Avatar from "@mui/material/Avatar";

export default function ProfileDisplay({ src, width, height, name, role }) {
	return (
		<div className="flex items-center gap-x-2.5">
			<Avatar
				src={src || ""}
				alt=""
				sx={{ width: width || "43px", height: height || "43px" }}
			/>
			<div className="flex flex-col gap-y-1.5">
				<p className="text-sm">{name}</p>
				<p className="text-sm">{role}</p>
			</div>
		</div>
	);
}

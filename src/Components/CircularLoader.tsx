import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

export default function CircularLoader() {
	return (
		<Stack
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				height: "60vh",
				width: "100%",
			}}
		>
			<CircularProgress color="primary" />
			<br />
			<h3 className="text-white">Loading...</h3>
		</Stack>
	);
}

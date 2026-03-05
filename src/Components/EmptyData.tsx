/* eslint-disable react/prop-types */
import { Button } from "@mui/material";

export default function EmptyData({
	handleClick1,
	handleClick2,
	btn1Name,
	btn2Name,
	message,
}) {
	return (
		<div className="flex items-center justify-center h-[380px]">
			<div className="flex flex-col items-center">
				<p className="mb-[71px]">{message || "No created class level"}</p>
				<div className="flex flex-col gap-y-7">
					{btn1Name && (
						<Button
							color="tertiary"
							variant="outlined"
							onClick={handleClick1}
							sx={{
								color: "tertiary",
								borderRadius: "10px",
								textTransform: "capitalize",
								paddingY: "12px",
								width: "221px",
							}}
						>
							{btn1Name || "Create level with template"}
						</Button>
					)}
					<Button
						color="tertiary"
						variant="contained"
						onClick={handleClick2}
						sx={{
							color: "white",
							borderRadius: "10px",
							textTransform: "capitalize",
							paddingY: "12px",
							width: "221px",
						}}
					>
						{btn2Name || "Create class level"}
					</Button>
				</div>
			</div>
		</div>
	);
}

/* eslint-disable react/prop-types */
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { IconButton } from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import moment from 'moment';


export default function BasicTable({ headcells, tableData, onClick, sideIcon }) {
	return (
		<TableContainer
			sx={{ boxShadow: "none", marginTop: "40px" }}
			component={Paper}
		>
			<Table>
				<TableHead>
					<TableRow>
						{headcells?.map((data, i) => (
							<TableCell key={i} sx={{ fontWeight: 600, fontSize: 14 }}>
								{data?.name}
							</TableCell>
						))}
						{ sideIcon &&
						<TableCell>

						</TableCell>
						}
					</TableRow>
				</TableHead>
				<TableBody>
					{tableData?.map((row, rowIndex) => (
						<TableRow key={rowIndex}>
							{headcells?.map((col, colIndex) => (
								<TableCell align="left" key={colIndex} sx={{ fontWeight: 500, fontSize: 13 }}>
									{row[col.key]}
								</TableCell>
							))}
							{ sideIcon &&
							<TableCell align="left" sx={{ fontWeight: 500, fontSize: 16 }} >
								<IconButton onClick={() => onClick(row)}>
									<MoreHoriz/>
								</IconButton>
							</TableCell>
							}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
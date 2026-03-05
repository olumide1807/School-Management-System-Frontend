/* eslint-disable react/prop-types */
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import DropDownWrapper from "../DropDownWrapper";
import EmptyData from "../EmptyData";

export default function ModifiedTableComponent({
  tableData,
  headcells,
  handleClick1,
  handleClick2,
  btn1Name,
  btn2Name,
  message,
}) {
  return (
    <TableContainer sx={{ boxShadow: "none", zIndex: "999" }} component={Paper}>
      <Table stickyHeader={true}>
        <TableHead>
          <TableRow>
            {headcells?.map((data, i) => (
              <TableCell
                key={i}
                sx={{
                  fontWeight: 600,
                  fontSize: `${window.innerWidth > 800 ? "18px" : "15px"}`,
                  textAlign: `${
                    data?.name === "Arm" || data?.name === "Amount"
                      ? "center"
                      : "start"
                  }`,
                }}
              >
                {data?.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        {tableData?.length <= 0 || !tableData ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={headcells.length} align="center">
                <EmptyData
                  handleClick1={handleClick1}
                  handleClick2={handleClick2}
                  btn1Name={btn1Name}
                  btn2Name={btn2Name}
                  message={message}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {tableData?.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headcells
                  .filter((col) => col.key !== "actions")
                  .map((col, colIndex) => (
                    <TableCell
                      sx={{
                        fontSize: "15px",
                        textAlign: `${
                          col.key === "arm" || col.key === "amount"
                            ? "center"
                            : "start"
                        }`,
                        textTransform: "capitalize",
                        color:
                          col.key === "status" && row[col.key] === "Not set"
                            ? "#DD6B01"
                            : row[col.key] === "Set"
                            ? "#0DBE83"
                            : "inherit",
                      }}
                      align="left"
                      key={`-row_${rowIndex}-col_${colIndex}`}
                    >
                      {row[col.key]}
                    </TableCell>
                  ))}
                {row.note && (
                  <>
                    <TableCell sx={{ color: "#43A6CA " }}>
                      <Button onClick={row.note.handleClick}>View note</Button>
                    </TableCell>
                  </>
                )}
                {row?.actions && (
                  <TableCell sx={{ zIndex: "999" }}>
                    <DropDownWrapper
                      className=""
                      action={
                        <IconButton aria-label="actions">
                          <MoreHorizIcon color="tertiary" />
                        </IconButton>
                      }
                      orientation={
                        rowIndex === tableData?.length - 1 ? "top" : "bottom"
                      }
                    >
                      {row?.actions?.map((action, i) => (
                        <Button
                          key={i}
                          sx={{ color: "#000" }}
                          onClick={action.handleClick}
                        >
                          {action.name}
                        </Button>
                      ))}
                    </DropDownWrapper>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </TableContainer>
  );
}

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
  // useMediaQuery
} from "@mui/material";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DropDownWrapper from "../DropDownWrapper";
import EmptyData from "../EmptyData";
import moment from "moment";

interface Action {
  name: string;
  handleClick: (row: any) => void;
}

export interface HeadCell {
  key: string;
  name: any;
}

interface TableComponentProps {
  tableData: any[];
  headcells: HeadCell[];
  handleClick1?: () => void;
  handleClick2?: () => void;
  btn1Name?: string;
  btn2Name?: string;
  message?: string;
}
export default function TableComponent({
  tableData,
  headcells,
  handleClick1,
  handleClick2,
  btn1Name,
  btn2Name,
  message,
}: TableComponentProps) {
  return (
    <>
      <TableContainer
        sx={{ boxShadow: "none", zIndex: "999" }}
        component={Paper}
      >
        <Table stickyHeader={true}>
          <TableHead>
            <TableRow>
              {headcells?.map((data, i) => (
                <TableCell
                  key={i}
                  sx={{
                    fontWeight: 600,
                    fontSize: `${window.innerWidth > 800 ? "18px" : "15px"}`,
                    textAlign: data?.key === "actions" ? "center" : "start",
                  }}
                >
                  {typeof data?.name === "string" ? data?.name : null}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData?.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headcells.map((col, colIndex) => (
                  <TableCell
                    sx={{
                      fontSize: "11px",
                      textAlign:
                        col.key === "arm" || col.key === "amount"
                          ? "center"
                          : "start",
                      textTransform: "capitalize",
                      color:
                        col.key === "status" && row[col.key] === "Not set"
                          ? "#DD6B01"
                          : row[col.key] === "Set"
                          ? "#0DBE83"
                          : "inherit",
                    }}
                    // lg={{
                    //   fontSize: "14px",
                    // }}
                    align="left"
                    key={`-row_${rowIndex}-col_${colIndex}`}
                  >
                    {col.key === "createdAt"
                      ? row[col.key]
                      : row[col.key]}
                    {col.key === "actions" && (
                      <DropDownWrapper
                        className=""
                        action={
                          <IconButton aria-label="actions">
                            {/* <MoreHorizIcon color="tertiary" /> */}
                            <MoreHorizIcon sx={{ color: "tertiary" }} />
                          </IconButton>
                        }
                        orientation={
                          rowIndex === tableData?.length - 1 ? "top" : "bottom"
                        }
                      >
                        {headcells
                          .find((cell) => cell.key === "actions")
                          ?.name.map((action: Action, i: number) => (
                            <Button
                              key={i}
                              sx={{ color: "#000", zIndex: 9999 }}
                              onClick={() => action.handleClick(row)}
                            >
                              {action.name}
                            </Button>
                          ))}
                      </DropDownWrapper>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {tableData?.length <= 0 ||
        (!tableData && (
          <EmptyData
            handleClick1={handleClick1}
            handleClick2={handleClick2}
            btn1Name={btn1Name}
            btn2Name={btn2Name}
            message={message}
          />
        ))}
    </>
  );
}
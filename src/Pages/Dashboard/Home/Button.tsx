import React from 'react';
import { Button } from "@mui/material";

const Button1 = ({text, onClick}) => {
  return (
    <Button
        color="tertiary"
        variant="contained"
        onClick={onClick}
        sx={{
        color: "white",
        borderRadius: "5px",
        textTransform: "capitalize",
        paddingY: '5px',
        paddingX: '1px'
        }}
        >
       {text}
    </Button>
  )
}

export default Button1



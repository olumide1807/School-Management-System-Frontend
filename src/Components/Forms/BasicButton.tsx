import { Button } from "@mui/material";

const BasicButton = ({text, onClick, color, variant, type}) => {
  return (
    <Button
        color={color}
        variant={variant}
        onClick={onClick}
        type={type}
        sx={{
        color: "white",
        borderRadius: "10px",
        textTransform: "capitalize",
        paddingY: '8px',
        paddingX: '15px',
        maxWidth: 'max-content',
        // fontSize: '12px'
        }}
    >
        {text}
    </Button>
  )
}

export default BasicButton

import { LoadingButton } from '@mui/lab'
import { CircularProgress } from '@mui/material'


const Button = ({text, type, loading, onClick}) => {
  return (
    <div className='w-full lg:ml-auto mt-5 lg:mt-0 flex' onClick={onClick}>
        <LoadingButton
        loadingIndicator={
            <CircularProgress
                sx={{
                    color: "#fff",
                }}
                size="1.2rem"
            />
        }
        disabled={loading}
        type={type}
        variant="contained"
        color="primary"
            sx={{
            borderRadius: "10px !important",
            color: "#fff !important",
            paddingY: "10px !important",
            width: "100%",
            fontWeight: "500 !important",
            fontSize: "15px"
        }}
    >
        {text}
    </LoadingButton>
    </div>
  )
}

export default Button

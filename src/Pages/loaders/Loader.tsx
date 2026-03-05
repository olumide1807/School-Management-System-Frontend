import CircularLoader from "../../Components/CircularLoader";

const Loader = () => {
  return (
      <div className="flex flex-row items-center justify-center">
        <CircularLoader style={{display: 'flex', margin: 'auto'}}/>
      </div>
  )
}

export default Loader

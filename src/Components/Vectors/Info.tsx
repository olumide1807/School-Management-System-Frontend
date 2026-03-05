import info from "../../assets/icons/info.png";

export default function Notice() {
  return (
    <div className="flex text-sm bg-[#CEF8DA54] p-2 items-center rounded">
      <img src={info} alt="note" />
      <span className="ml-auto">
        These details will be visible to everyone.
      </span>
    </div>
  );
}

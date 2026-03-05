import { useFormContext, get, Controller } from "react-hook-form";
import FormControl from "@mui/material/FormControl";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import "../../Components/Forms/errorFixing.css";

export default function AutocompleteField({
  label,
  asterisk,
  labelFor,
  name,
  selectOption,
  required,
  loading,
  handleCustomChange,
  className,
  setState,
  defaultValue,
  value,
  inputClassName,
  ...props
}) {
  const { formState, control } = useFormContext({
    mode: "all",
  });
  const { errors } = formState;
  const error = get(errors, name);
  const filter = createFilterOptions();

  return (
    <div className={`w-full border-1  ${className} form`}>
      <FormControl fullWidth>
        {label && (
          // pass in important props anywhere u want the auto complete to be compulsory
          // a css pseudo element will be added to the label to indicate that the field is compulsory.... check index.css file
          <label
            htmlFor={labelFor}
            className={`mb-2.5 ${props.labelColor || "text-black"} ${
              props.important ? "compulsory-input" : ""
            }`}
          >
            {label}{" "}
          </label>
        )}
      </FormControl>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || ""}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            className={`${inputClassName} border h-[60px]`}
            // style={{ height: "60px" }}
            disablePortal
            handleHomeEndKeys
            defaultValue={defaultValue || ""}
            inputValue={defaultValue}
            options={selectOption ? selectOption : []}
            filterOptions={(options, params) => {
              if (props.freeSolo) {
                const filtered = filter(options, params);
                const { inputValue } = params;
                const isExisting = options.some(
                  (option) => inputValue === (option.value || option)
                );
                if (inputValue !== "" && !isExisting) {
                  filtered.push(inputValue);
                }
                return filtered;
              } else return filter(options, params);
            }}
            isOptionEqualToValue={(option, value) =>
              typeof option === "string"
                ? option === value
                : option.label === (value?.label ?? value)
            }
            value={
              loading
                ? ""
                : selectOption?.find((el) => (el?.value ?? el) === value) ||
                  null
            }
            sx={{ background: props.bg }}
            onChange={(event, value) => {
              onChange(value?.value ?? value);
              if (handleCustomChange) {
                handleCustomChange(value);
              }
              if (setState) {
                setState(value);
              }
            }}
            id={labelFor}
            fullWidth
            size={props.size}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder={props.placeholder}
                // style={{ height: "50px" }}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <InputAdornment position="end">
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </InputAdornment>
                  ),
                }}
              />
            )}
            renderOption={(renderProps, option, { selected }) => (
              <MenuItem {...renderProps}>
                {typeof option === "string" ? option : option?.label}
                {props.multiple && (
                  <Checkbox sx={{ border: "none", p: 0 }} checked={selected} />
                )}
              </MenuItem>
            )}
          />
        )}
      />

      {error && <div className="text-red-600 pt-[10px] ">{error.message}</div>}
    </div>
  );
}

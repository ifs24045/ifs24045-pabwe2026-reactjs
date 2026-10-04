import { useState } from "react";

/**
 * Custom hook untuk two-way binding pada input form.
 * Contoh:
 *   const [title, onTitleChange, setTitle] = useInput("");
 *   <input value={title} onChange={onTitleChange} />
 */
function useInput(defaultValue = "") {
  const [value, setValue] = useState(defaultValue);

  const handleValueChange = (event) => {
    setValue(event.target.value);
  };

  return [value, handleValueChange, setValue];
}

export default useInput;
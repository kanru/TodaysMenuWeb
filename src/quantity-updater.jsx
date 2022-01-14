import TextField from '@mui/material/TextField';

import { useState } from 'preact/hooks';


export default function QuantityUpdater(props) {
    const [value, setValue] = useState(props.quantity);

    const wrappedOnChange = (event) => {
        setValue(event.target.value);
        props.onChange(props.index, event.target.value);
    };

    return <TextField
        sx={{ width: '40%' }}
        label="數量"
        margin="dense"
        onChange={wrappedOnChange}
        value={value}
    />
}
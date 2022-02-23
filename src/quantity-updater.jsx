import TextField from '@mui/material/TextField';

export default function QuantityUpdater(props) {

    const wrappedOnChange = (event) => {
        props.onChange(props.index, event.target.value);
    };

    const error = props.shouldValidate && !props.quantity;

    return <TextField
        sx={{ width: '40%' }}
        label="數量"
        margin="dense"
        onChange={wrappedOnChange}
        value={props.quantity ?? ""}
        error={error}
    />
}
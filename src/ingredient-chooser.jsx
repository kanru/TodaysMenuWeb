import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Fragment } from 'preact';
import { useState } from 'preact/hooks';


export default function IngredientChooser(props) {
    const defaultValue = props.options.find(element => element.name === props.ingredientName);
    const [value, setValue] = useState(defaultValue);
    const [ingredients, setIngredients] = useState(props.options);
    const [open, toggleOpen] = useState(false);
    const [dialogValue, setDialogValue] = useState({
        name: '',
        category: '',
    });

    const updateValue = function (newValue) {
        setValue(newValue);
        props.onChange(props.index, newValue);
    }

    const categories = props.options.reduce((retList, ingredient) => retList.concat(ingredient.category), []);

    const handleDialogSubmit = (event) => {
        event.preventDefault();

        updateValue(dialogValue);
        setIngredients(ingredients.concat([dialogValue]))
        handleDialogClose();
    };

    const handleDialogClose = () => {
        setDialogValue({
            name: '',
            category: '',
        });

        toggleOpen(false);
    };

    return (
        <Fragment>
            <Autocomplete
                value={value}
                sx={{ display: 'inline-block', width: '60%' }}
                onChange={(event, newValue) => {
                    if (!newValue) {
                        return;
                    }
                    if (typeof newValue === 'string') {
                        let matched = ingredients.find(element => element.name === newValue);
                        if (matched) {
                            updateValue(matched);
                        } else {
                            toggleOpen(true);
                            setDialogValue({
                                name: newValue,
                                category: '',
                            });
                            updateValue({
                                name: newValue,
                            });
                        }
                    } else {
                        updateValue(newValue);
                    }
                }}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                options={ingredients}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                freeSolo
                renderInput={(params) => <TextField {...params} label="食材" margin="dense" />}
            />
            <Dialog open={open} onClose={handleDialogClose} fullWidth >
                <form onSubmit={handleDialogSubmit}>
                    <DialogTitle>新增食材</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            請選擇食材種類
                        </DialogContentText>
                        <TextField
                            sx={{ width: '60%' }}
                            margin="dense"
                            value={dialogValue.name}
                            onChange={(event) =>
                                setDialogValue({
                                    ...dialogValue,
                                    name: event.target.value,
                                })
                            }
                            label="名稱"
                        />
                        <Autocomplete
                            sx={{ display: 'inline-block', width: '40%' }}
                            options={categories}
                            onChange={(event, newValue) => {
                                setDialogValue({
                                    ...dialogValue,
                                    category: newValue,
                                })
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            renderInput={(params) => <TextField {...params} label="種類" margin="dense" />}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>取消</Button>
                        <Button type="submit">新增</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Fragment>
    );
}
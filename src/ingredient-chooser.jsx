import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Fragment, useState } from 'react';
import { useMutation } from '@apollo/client';
import { AddNewIngredients, GetIngredients, GetDishes } from './query.graphql';


export default function IngredientChooser(props) {
    const [addNewIngredients] = useMutation(AddNewIngredients, {
        refetchQueries: [
            GetIngredients,
            GetDishes
        ]
    });
    const value = props.options.find(element => element.name === props.ingredientName) || "";
    const categories = props.options.reduce((retList, ingredient) => retList.concat(ingredient.category), []);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogValue, setDialogValue] = useState({
        name: '',
        category: '',
    });

    const updateValue = (newValue) => props.onChange(props.index, newValue);
    const handleDialogSubmit = async () => {
        await addNewIngredients({
            variables: {
                ingredients: [
                    {
                        name: dialogValue.name,
                        category: dialogValue.category,
                    }
                ]
            }
        });
        setOpenDialog(false);
    };

    return (
        <Fragment>
            <Autocomplete
                value={value}
                sx={{ display: 'inline-block', width: '60%' }}
                onChange={(_event, newValue) => {
                    if (typeof newValue === 'string') {
                        let matched = props.options.find(element => element.name === newValue);
                        if (matched) {
                            updateValue(matched);
                        } else {
                            setDialogValue({
                                name: newValue,
                                category: '',
                            });
                            setOpenDialog(true);
                        }
                    } else {
                        updateValue(newValue);
                    }
                }}
                getOptionLabel={(option) => option.name ?? option}
                options={props.options}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                freeSolo
                renderInput={(params) => <TextField {...params} label="食材" margin="dense" />}
            />
            <Dialog open={openDialog} onClose={handleDialogSubmit} fullWidth >
                <DialogTitle>新增食材</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        請選擇食材種類
                    </DialogContentText>
                    <TextField
                        sx={{ width: '60%' }}
                        margin="dense"
                        value={dialogValue.name}
                        onChange={(_event, newValue) =>
                            setDialogValue({
                                ...dialogValue,
                                name: newValue,
                            })
                        }
                        label="名稱"
                    />
                    <Autocomplete
                        sx={{ display: 'inline-block', width: '40%' }}
                        options={categories}
                        onChange={(_event, newValue) => {
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
                    <Button onClick={() => setOpenDialog(false)}>取消</Button>
                    <Button onClick={handleDialogSubmit}>新增</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}
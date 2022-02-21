/* eslint-disable react/jsx-key */
import { IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Fragment, useState } from 'react';
import IngredientChooser from './ingredient-chooser';
import QuantityUpdater from './quantity-updater';

/**
 * The data and state flow of this component is from top-down.
 * The initial value is provided by the parent component via the
 * `defaultValue` property. Any change in this component will be
 * propagated back by the onChange event.
 */
export default function EditDishForm(props) {
    if (!props.defaultValue) {
        return null;
    }
    const dish = props.defaultValue;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [shouldValidate, setShouldValidate] = useState(false);

    const onClose = () => {
        const ingredients = dish.ingredients.filter(item => item.ingredient.name);
        if (ingredients.find(item => !item.quantity)) {
            setShouldValidate(true);
            return;
        }
        props.onClose({
            ...dish,
            ingredients
        });
    }
    const onCancel = () => {
        setShouldValidate(false);
        props.onCancel();
    }
    const ingredientUpdateCallback = (index, value) => {
        const updatedIngredients = [...dish.ingredients];
        updatedIngredients[index] = {
            ...dish.ingredients[index],
            ingredient: value
        };
        props.onChange({
            ...dish,
            ingredients: updatedIngredients
        });
    }
    const quantityUpdateCallback = (index, value) => {
        const updatedIngredients = [...dish.ingredients];
        updatedIngredients[index] = {
            ...dish.ingredients[index],
            quantity: value
        };
        props.onChange({
            ...editedDish,
            ingredients: updatedIngredients
        });
        setShouldValidate(false);
    }
    const insertNewIngredient = () => {
        props.onChange({
            ...dish,
            ingredients: [
                ...dish.ingredients,
                {
                    ingredient: {
                        name: "",
                        category: ""
                    },
                    quantity: ""
                }
            ]
        });
    }

    return (
        <Dialog fullScreen={fullScreen} fullWidth maxWidth='sm'
            open={props.open}
            onClose={onClose}
            aria-labelledby="form-dialog">
            <DialogTitle id="form-dialog-title">編輯[{dish.name}]</DialogTitle>
            <DialogContent>
                {dish.ingredients.map((recipeIngredient, index) => {
                    return <Fragment key={index}>
                        <IngredientChooser
                            index={index}
                            ingredientName={recipeIngredient.ingredient.name}
                            options={props.options}
                            onChange={ingredientUpdateCallback}
                        />
                        <QuantityUpdater
                            index={index}
                            quantity={recipeIngredient.quantity}
                            shouldValidate={shouldValidate}
                            onChange={quantityUpdateCallback}
                        />
                    </Fragment>
                })}
                <IconButton onClick={insertNewIngredient} color="primary" aria-label="add a new ingredient">
                    <AddCircleOutlineIcon />
                </IconButton>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="primary">
                    取消
                </Button>
                <Button onClick={onClose} color="primary">
                    儲存
                </Button>
            </DialogActions>
        </Dialog>
    );
}
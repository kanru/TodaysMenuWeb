/* eslint-disable react/jsx-key */
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Fragment } from 'preact';
import IngredientChooser from './ingredient-chooser';
import QuantityUpdater from './quantity-updater';


export default function EditDishForm(props) {
    const dish = props.defaultValue;
    let editedDish = { ...dish, ingredients: [] };
    if (dish.ingredients) {
        editedDish.ingredients = dish.ingredients.reduce(
            (list, item) => list.concat({ ...item, ingredient: { ...item.ingredient } }),
            []);
    }

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    let closeCallback = function () {
        props.onClose(editedDish);
    }

    let ingredientUpdateCallback = function (index, value) {
        editedDish.ingredients[index].ingredient = value;
    }

    let quantityUpdateCallback = function (index, value) {
        editedDish.ingredients[index].quantity = value;
    }

    return (
        <Dialog fullScreen={fullScreen} fullWidth maxWidth='sm' open={props.open} onClose={props.onClose} aria-labelledby="form-dialog">
            <DialogTitle id="form-dialog-title">編輯[{dish.name}]</DialogTitle>
            <DialogContent>
                {editedDish.ingredients.map((recipeIngredient, index) => {
                    return <Fragment>
                        <IngredientChooser
                            index={index}
                            ingredientName={recipeIngredient.ingredient.name}
                            options={props.options}
                            onChange={ingredientUpdateCallback}
                        />
                        <QuantityUpdater index={index} quantity={recipeIngredient.quantity}
                            onChange={quantityUpdateCallback}
                        />
                    </Fragment>
                })}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel} color="primary">
                    取消
                </Button>
                <Button onClick={closeCallback} color="primary">
                    儲存
                </Button>
            </DialogActions>
        </Dialog>
    );
}
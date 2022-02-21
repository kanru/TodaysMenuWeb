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
import { Fragment } from 'preact';
import IngredientChooser from './ingredient-chooser';
import QuantityUpdater from './quantity-updater';

/**
 * @typedef {Object} Ingredient
 * @property {string} name
 * @property {string} category
 */

/**
 * @typedef {Object} RecipeIngredient
 * @property {Ingredient} ingredient
 * @property {number} quantity
 */

/**
 * @typedef {Object} EditedDish
 * @property {Array<RecipeIngredient>} ingredients
 */

/**
 * The data and state flow of this component is from top-down.
 * The initial value is provided by the parent component via the
 * `defaultValue` property. Any change in this component will be
 * propagated back by the onChange event.
 */
export default function EditDishForm(props) {
    const dish = props.defaultValue;
    /** @type {EditedDish} */
    let editedDish = { ...dish, ingredients: [] };
    if (dish.ingredients) {
        editedDish.ingredients = dish.ingredients.reduce(
            (list, item) => list.concat({ ...item, ingredient: { ...item.ingredient } }),
            []
        );
    }

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const onClose = () => {
        props.onClose({
            ...editedDish,
            ingredients: [
                ...editedDish.ingredients.filter(item => item.ingredient.name)
            ]
        });
    }
    const ingredientUpdateCallback = (index, value) => {
        const updatedIngredients = [...editedDish.ingredients];
        updatedIngredients[index].ingredient = value;
        props.onChange({
            ...editedDish,
            ingredients: updatedIngredients
        });
    }
    const quantityUpdateCallback = (index, value) => {
        const updatedIngredients = [...editedDish.ingredients];
        updatedIngredients[index].quantity = value || "適量";
        props.onChange({
            ...editedDish,
            ingredients: updatedIngredients
        });
    }
    const insertNewIngredient = () => {
        props.onChange({
            ...editedDish,
            ingredients: [
                ...editedDish.ingredients,
                {
                    ingredient: {
                        name: "",
                        category: ""
                    },
                    quantity: "適量"
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
                <IconButton onClick={insertNewIngredient} color="primary" aria-label="add a new ingredient">
                    <AddCircleOutlineIcon />
                </IconButton>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel} color="primary">
                    取消
                </Button>
                <Button onClick={onClose} color="primary">
                    儲存
                </Button>
            </DialogActions>
        </Dialog>
    );
}
/* eslint-disable react/jsx-key */
import { styled } from '@mui/material/styles';
import { IconButton, ButtonBase } from '@mui/material';
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
import { nanoid } from 'nanoid';
import Resizer from "react-image-file-resizer";

const Input = styled('input')({
    display: 'none',
});

function DishPhotoEditButton(props) {

    const onChange = ({
        target: {
            validity,
            files: [file],
        },
    }) => {
        if (validity.valid) {
            Resizer.imageFileResizer(
                file,
                256,
                256,
                "JPEG",
                100,
                0,
                (file) => props.onChange(file),
                "file"
            );
        }
    }
    let labelId = nanoid();
    return (
        <div style={{ margin: '1rem' }}>
            <label htmlFor={labelId}>
                <Input accept='image/*' id={labelId} type='file' onChange={onChange} />
                <ButtonBase component="span">
                    <img src={props.src} width='256' height='256' />
                </ButtonBase>
            </label>
        </div>
    )
}

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
    const [dishPhotoFile, setDishPhotoFile] = useState(null);

    const onClose = () => {
        const ingredients = dish.ingredients.filter(item => item.ingredient.name);
        if (ingredients.find(item => !item.quantity)) {
            setShouldValidate(true);
            return;
        }
        props.onClose({
            ...dish,
            ingredients,
            photo: dishPhotoFile
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
            ...dish,
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
    const onDishPhotoFileChange = (file) => {
        setDishPhotoFile(file);
    }
    const DEFAULT_PHOTO = '/assets/dish_default.jpg';
    let dishPhotoSrc = dish.photo ? `http://localhost:8080/photos/${dish.photo.filename}` : DEFAULT_PHOTO;
    if (dishPhotoFile) {
        dishPhotoSrc = URL.createObjectURL(dishPhotoFile);
    }

    return (
        <Dialog fullScreen={fullScreen} fullWidth maxWidth='sm'
            open={props.open}
            onClose={onClose}
            aria-labelledby="form-dialog">
            <DialogTitle id="form-dialog-title">編輯[{dish.name}]</DialogTitle>
            <DialogContent>
                <DishPhotoEditButton src={dishPhotoSrc} onChange={onDishPhotoFileChange} />
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
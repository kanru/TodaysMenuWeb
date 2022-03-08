/* eslint-disable no-prototype-builtins */
/* eslint-disable react/jsx-key */
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { textAlign } from '@mui/system';

const PREFIX = 'menu-view';

const classes = {
    card: `${PREFIX}-card`,
    media: `${PREFIX}-media`,
    mealAction: `${PREFIX}-meal-action`
};

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.card}`]: {
        maxWidth: 150,
        [theme.breakpoints.down('md')]: {
            width: 110,
        },
        minWidth: 50,
        width: 150,
        marginLeft: 5,
    },

    [`& .${classes.media}`]: {
        height: 110,
        [theme.breakpoints.down('md')]: {
            height: 80,
        },
    },

    [`& .${classes.mealAction} .MuiChip-label`]: {
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },

    [`& .${classes.mealAction} .MuiChip-icon`]: {
        [theme.breakpoints.down('md')]: {
            margin: '10px',
        },
    }
}));

const DEFAULT_PHOTO = '/assets/dish_default.jpg';

export default function DayMenu(props) {
    let item = props.item;
    return (
        <StyledGrid item container key={item.id}>
            <Grid item xs={12}>
                <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: '500', padding: '10px 0' }}>{item.date}</Typography>
            </Grid>
            <Grid item container xs={4} spacing={1}>
                <DishView dishes={item.lunch} isLogin={props.isLogin} editDishCallback={props.editDishCallback} />
                <Grid item xs={12}>
                    <MealActions nextCallback={props.nextLunchCallback} overrideCallback={props.overrideLunchCallback} />
                </Grid>
            </Grid>
            <Grid item container xs={8} spacing={1}>
                <DishView dishes={item.dinner} isLogin={props.isLogin} editDishCallback={props.editDishCallback} />
                <Grid item>
                    <MealActions nextCallback={props.nextDinnerCallback} overrideCallback={props.overrideDinnerCallback} />
                </Grid>
            </Grid>
        </StyledGrid>
    );
}

function DishView(props) {

    let dishes = props.dishes;
    let editDishCallback = function (_event) {
        let ele = _event.target;
        while (!ele.dataset.hasOwnProperty('name')) {
            ele = ele.parentNode;
        }
        let dishName = ele.dataset.name;
        props.editDishCallback(dishName);
    }

    return <Grid item container xs={12}>
        {dishes.map((dish, index) => {
            let dishPhotoSrc = dish.photo ? `${import.meta.env.VITE_PHOTOS_URL}/${dish.photo.filename}` : DEFAULT_PHOTO;
            return (<Card key={index} className={classes.card} variant="outlined">
                <CardMedia
                    className={classes.media}
                    image={dishPhotoSrc}
                    title={dish.name}
                />
                <CardHeader disableTypography sx={{ padding: '0px 5px' }}
                    title={dish.name}
                    action={
                        props.isLogin ? <IconButton aria-label="settings" onClick={editDishCallback} data-name={dish.name}>
                            <DriveFileRenameOutlineRoundedIcon />
                        </IconButton>
                            : null
                    }
                />
            </Card>
            );
        })}
    </Grid>;
}

function MealActions(props) {
    return <Stack direction="row" spacing={0.5} className={classes.mealAction}>
        <Chip variant="outlined" size="small" icon={<ShuffleRoundedIcon />} label="隨機選" onClick={props.nextCallback} />
        <Chip variant="outlined" size="small" icon={<SearchRoundedIcon />} label="自己挑" onClick={props.overrideCallback} />
    </Stack>;
}


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

const PREFIX = 'menu-view';

const classes = {
    card: `${PREFIX}-card`,
    media: `${PREFIX}-media`
};

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.card}`]: {
        maxWidth: 150,
        [theme.breakpoints.up('md')]: {
            maxWidth: 150,
        },
        minWidth: 50,
        width: 150,
    },

    [`& .${classes.media}`]: {
        height: 150,
        [theme.breakpoints.up('md')]: {
            height: 150,
        },
    },
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
                <DishView dishes={item.lunch} editDishCallback={item.showEditDishCallback} />
                <Grid item xs={12}>
                    <MealActions nextCallback={item.nextLunchCallback} overrideCallback={item.overrideLunchCallback} />
                </Grid>
            </Grid>
            <Grid item container xs={8} spacing={1}>
                <DishView dishes={item.dinner} editDishCallback={item.showEditDishCallback} />
                <Grid item>
                    <MealActions nextCallback={item.nextDinnerCallback} overrideCallback={item.overrideDinnerCallback} />
                </Grid>
            </Grid>
        </StyledGrid>
    );
}

function DishView(props) {

    let dishes = props.dishes;
    dishes.map(dish => dish.photo = dish.photo || `${DEFAULT_PHOTO}`);

    let editDishCallback = function(_event) {
        let ele = _event.target;
        while (!ele.dataset.hasOwnProperty('name')) {
            ele = ele.parentNode;
        }
        let dishName = ele.dataset.name;
        props.editDishCallback(dishName);
    }

    return <Grid item container xs={12}>
        {dishes.map(dish =>
            <Card className={classes.card} variant="outlined">
                <CardMedia
                    className={classes.media}
                    image={dish.photo}
                    title={dish.name}
                />
                <CardHeader disableTypography sx={{ padding: '0px 5px' }}
                    title={dish.name}
                    action={
                        <IconButton aria-label="settings" onClick={editDishCallback} data-name={dish.name}>
                            <DriveFileRenameOutlineRoundedIcon />
                        </IconButton>
                    }
                />
            </Card>
        )}
    </Grid>;
}

function MealActions(props) {
    return <Stack direction="row" spacing={0.5}>
        <Chip variant="outlined" size="small" icon={<ShuffleRoundedIcon />} label="隨機選" onClick={props.nextCallback} />
        <Chip variant="outlined" size="small" icon={<SearchRoundedIcon />} label="自己挑" onClick={props.overrideCallback} />
    </Stack>;
}


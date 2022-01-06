/* eslint-disable react/jsx-key */
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
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
        maxWidth: 110,
        [theme.breakpoints.up('md')]: {
            maxWidth: 150,
        },
        minWidth: 50,
    },

    [`& .${classes.media}`]: {
        height: 80,
        [theme.breakpoints.up('md')]: {
            height: 150,
        },
    }
}));

const DEFAULT_PHOTO = '/assets/dish_default.jpg';

export default function DayMenu(props) {
    let item = props.item;
    return (
        <StyledGrid item container key={item.id}>
            <Grid item>
                <Typography variant="h2">{item.date}</Typography>
            </Grid>
            <Grid item container spacing={2}>
                <Grid item>
                    <DishView dishes={item.lunch} onClick={item.overrideLunchCallback} />
                    <Grid item>
                        <Chip variant="outlined" size="small" icon={<AutorenewIcon />} label="選別的" onClick={item.nextLunchCallback} />
                    </Grid>
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Grid item>
                    <DishView dishes={item.dinner} onClick={item.overrideDinnerCallback} />
                    <Grid item>
                        <Chip variant="outlined" size="small" icon={<AutorenewIcon />} label="選別的" onClick={item.nextDinnerCallback} />
                    </Grid>
                </Grid>
            </Grid>
        </StyledGrid>
    );
}

function DishView(props) {


    let dishes = props.dishes;
    dishes.map(dish => dish.photo = dish.photo || `${DEFAULT_PHOTO}`);

    return <Grid item container>
        {props.dishes.map(dish =>
            <Card className={classes.card} variant="outlined">
                <CardActionArea onClick={props.onClick} >
                    <CardMedia
                        className={classes.media}
                        image={dish.photo}
                        title={dish.name}
                    />
                    <div class="dish description">
                        <span class="name">{dish.name} </span>
                    </div>
                </CardActionArea>
            </Card>
        )}
    </Grid>;
}


import { styled } from '@mui/material/styles';

import AutorenewIcon from '@mui/icons-material/Autorenew';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
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

const PHOTO_BASE = '/assets/photo/';

export default function DayMenu(props) {
    let item = props.item;
    return (
        <StyledGrid item container key={item.id}>
            <Grid item>
                <Typography variant="h2">{item.date}</Typography>
            </Grid>
            <Grid item container spacing={2}>
                <Grid item>
                    <DishView dishes={item.lunch} onClick={item.overrideLunch} />
                    <Grid item>
                        <Chip variant="outlined" size="small" icon={<AutorenewIcon />} label="選別的" onClick={item.nextLunch} />
                    </Grid>
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Grid item>
                    <DishView dishes={item.dinner} onClick={item.overrideDinner} />
                    <Grid item>
                        <Chip variant="outlined" size="small" icon={<AutorenewIcon />} label="選別的" onClick={item.nextDinner} />
                    </Grid>
                </Grid>
            </Grid>
        </StyledGrid>
    );
}

function DishView(props) {


    let dishes = props.dishes;
    dishes.map(dish => dish.photo = dish.photo || `${PHOTO_BASE}${dish.name}.jpg`);

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
                        <span class="time">({dish.cook_time} min)</span>
                    </div>
                </CardActionArea>
            </Card>
        )}
    </Grid>;
}


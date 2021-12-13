import { makeStyles } from '@material-ui/core/styles';

import AutorenewIcon from '@material-ui/icons/Autorenew';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    card: {
        maxWidth: 110,
        [theme.breakpoints.up('md')]: {
            maxWidth: 150,
        },
        minWidth: 50,
    },
    media: {
        height: 80,
        [theme.breakpoints.up('md')]: {
            height: 150,
        },
    },
}));

const PHOTO_BASE = '/assets/photo/';

export default function DayMenu(props) {
    let item = props.item;
    return <Grid item container key={item.id}>
        <Grid item>
            <Typography variant="h6" component="h3">{item.date}</Typography>
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
    </Grid>;
}

function DishView(props) {
    const classes = useStyles();

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


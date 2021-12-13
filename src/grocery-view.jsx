import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

export default function GroceryView(props) {
    let category = props.category;
    let items = props.items;
    return <div class="category">
        <div class="category-name">{category}</div>
        {Object.keys(items).map(grocery =>
            <div class="grocery">
                <Grid container alignItems="center">
                    <Grid item xs={4} md={4} lg={4}>
                        <FormControlLabel
                            className="name"
                            control={<Checkbox color="primary" />}
                            label={grocery} />
                    </Grid>
                    <Grid item xs={8} md={8} lg={8}>
                        <span class="quantity">
                            {items[grocery].map(quant =>
                                <Tooltip title={quant[1]}>
                                    <Typography component='span'>{quant[0]}</Typography>
                                </Tooltip>
                            )}
                        </span>
                    </Grid>
                </Grid>
            </div>
        )}
    </div>;
}
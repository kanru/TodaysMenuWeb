import { makeStyles } from '@material-ui/core/styles';

import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles(() => ({
    content: {
        width: '350px',
    },
}));

export default function FormDialog(props) {
    const classes = useStyles();

    return (
        <Dialog open={props.open} onClose={props.onClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">手動輸入</DialogTitle>
            <DialogContent className={classes.content}>
                <DialogContentText>
                    選擇或搜尋菜名
                </DialogContentText>
                <Autocomplete
                    multiple
                    freeSolo
                    id="name"
                    options={props.options}
                    onChange={props.onChange}
                    value={props.defaultValue}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            autoFocus
                            margin="dense"
                            id="name"
                            label="菜名"
                            fullWidth
                        />
                    )} />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel} color="primary">
                    取消
                </Button>
                <Button onClick={props.onClose} color="primary">
                    確定
                </Button>
            </DialogActions>
        </Dialog>
    );
}
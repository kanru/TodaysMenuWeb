import { styled } from '@mui/material/styles';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const PREFIX = 'manual-input';

const classes = {
    content: `${PREFIX}-content`
};

const StyledDialog = styled(Dialog)(() => ({
    [`& .${classes.content}`]: {
        width: '350px',
    }
}));

export default function FormDialog(props) {


    return (
        <StyledDialog open={props.open} onClose={props.onClose} aria-labelledby="form-dialog-title">
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
        </StyledDialog>
    );
}
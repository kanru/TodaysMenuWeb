import { Backdrop, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useState } from "react";
import * as scryptPbkdf from 'scrypt-pbkdf';
import * as base64 from 'base64-arraybuffer';

export default function LoginDialog(props) {
    const derivedKeyLength = 32;
    const clientParams = { N: 8192, r: 8, p: 1 };
    const [userId, setUserId] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [inProgress, setInProgress] = useState(false);
    const onClose = () => {
        setUserId("");
        setUserPassword("");
        props.onCancel();
    }
    const onCancel = () => {
        setUserId("");
        setUserPassword("");
        props.onCancel();
    }
    const onConfirm = async (event) => {
        event.preventDefault();
        setInProgress(true);
        const user = userId;
        const hashedPassword = base64.encode(await scryptPbkdf.scrypt(userPassword, '', derivedKeyLength, clientParams));
        props.onConfirm(user, hashedPassword);
        setUserId("");
        setUserPassword("");
        setInProgress(false);
    }
    return (
        <Dialog fullWidth maxWidth='sm'
            open={props.open}
            onClose={onClose}>
            <DialogTitle>登入</DialogTitle>
            <form>
                <DialogContent>
                    <Backdrop open={inProgress}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                    <Container maxWidth="sm">
                        <Stack spacing={2}>
                            <TextField label="帳號" variant="standard"
                                autoFocus
                                value={userId}
                                onChange={e => setUserId(e.target.value)}
                            />
                            <TextField label="密碼" variant="standard" type="password"
                                value={userPassword}
                                onChange={e => setUserPassword(e.target.value)}
                            />
                        </Stack>
                    </Container>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancel} color="primary">
                        取消
                    </Button>
                    <Button onClick={onConfirm} type="submit" color="primary">
                        登入
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
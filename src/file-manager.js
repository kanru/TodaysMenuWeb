export default class FileManager {
    static saveJson(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const dl = document.createElement('a');
        dl.setAttribute('href', url);
        dl.setAttribute('download', filename);
        dl.click();
    }

    static loadJson(callback) {
        let op = document.createElement('input');
        op.setAttribute('type', 'file');
        op.setAttribute('accept', 'application/json');
        op.addEventListener('change', async () => {
            if (op.files.length > 0) {
                let text = await op.files[0].text();
                let data = JSON.parse(text);
                callback(data);
            }
        });
        op.click();
    }
}
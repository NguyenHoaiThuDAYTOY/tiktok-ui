import axios from 'axios';
import { encode } from 'base-64';

const getToken = ({ username, password }) => {
    return 'Basic ' + encode(username + ':' + password)
}

const sendRequest = async ({ url = '', method = '', auth = null, data = {}, headers = {}, params }, { errorMsg = '' } = {}) => {
    if (auth) {
        headers.Authorization = getToken(auth);
    }

    try {
        const res = await axios({
            url,
            method,
            headers,
            data,
            params,
        });
        console.log('res',res)

        return res.data;
    } catch (error) {
        throw error
    }
}


export { sendRequest };

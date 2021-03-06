import http from 'axios';

const chrome = window.chrome;
const dataCache = {};

//这里可以根据环境配置请求线上还是线下api
//这里是拿github做示例，所以都是一个地址
const HOST = process.env.NODE_ENV === 'development' ? 'https://api.github.com' : 'https://api.github.com'

//获取指定用户的信息
export const getUser = user => dataCache[user] ?
    Promise.resolve(dataCache[user]) :
    http.get(HOST + `/users/${user}`).then(resp => dataCache[user] = resp);

//获取指定用户的仓库列表
export const getRepos = user => dataCache[user + '/repos'] ?
    Promise.resolve(dataCache[user + '/repos']) :
    http.get(HOST + `/users/${user}/repos`, {
        params: {
            type: 'all',
            sort: 'pushed',
            per_page: 9999
        }
    }).then(resp => dataCache[user + '/repos'] = resp)

export const executeScript = code => {
    return new Promise((resolve, reject) => chrome.runtime.sendMessage({
        action: 'executeScript',
        data: code
    }, resolve));
}

/*！
 * @desc 向当前激活的tab发送消息
 */
export const sendActiveTabRequest = (...args) => {
    chrome.tabs.query({
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, ...args);
    });
}

/*！
 * @desc 向所有tab发送消息
 */
export const sendAllTabsRequest = (...args) => {
    chrome.tabs.query({
        windowId: chrome.windows.WINDOW_ID_CURRENT
    }, tabs => tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, ...args);
    }));
}

/*！
 * @desc 向扩展发送消息
 */
export const sendRuntimeMessage = (...args) => {
    chrome.runtime.sendMessage(...args);
}

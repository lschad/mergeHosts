'use strict';

const fs = require('fs');
const request = require('request');

const URL = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/fakenews/hosts';
const HOSTS = 'c:\\windows\\system32\\drivers\\etc\\hosts';

const CUSTOM_HOSTS = [
    '0.0.0.0 crashlogs.whatsapp.net'
];

Array.prototype.diff = function (a) {
    return this.filter(function (i) {
        return a.indexOf(i) < 0;
    });
};
Array.prototype.unique = function () {
    let a = this.concat();
    for (let i = 0; i < a.length; ++i) {
        for (let j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};
String.prototype.strip = function () {
    return this.replace(/^\s+|\s+$/g, '');
};

function mergeArrays(a, b) {
    let c = a.concat(b);
    return c.filter((i, p) => c.indexOf(i) === p);
}

function getRemoteHosts(url) {
    console.info('get remote hosts');
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {

            if (!!err) return reject(err);

            let hosts = body.toString().split('\n');
            return resolve(hosts);
        });
    });
}

function getCustomHosts(hosts) {
    console.info('get custom hosts');
    return new Promise(resolve => {
        for (let i = 0; i < CUSTOM_HOSTS.length; i++) {
            hosts.push(`${CUSTOM_HOSTS[i]}`);
        }
        resolve(hosts);
    });
}

function writeHosts(hosts) {
    console.info('write hosts');
    return new Promise((resolve, reject) => {
        if(hosts.length < 1) return reject('abort. no new entries.');
        let data = hosts.join('\n').strip();
        fs.writeFile(HOSTS, data, (err) => {
            if (!!err) return reject(err);
            resolve('Merged hosts file ..');
        });
    });
}

function filterHosts(hosts) {
    console.info('filter hosts');
    return new Promise(resolve => {
        resolve(hosts.filter(function (hostx) {
            let host = hostx;
            host = host.strip();
            if (!host) {
                return false;
            }
            if ((host instanceof String || typeof host === 'string') === false) {
                return false;
            }
            if (host === '') {
                return false;
            }
            if (host.length < 1) {
                return false;
            }
            if (host[0] === '#') {
                return false;
            }
            if (!host.match(/^[a-f0-9: ]{1}/)) {
                return false;
            }

            return true;
        }));
    });
}

function sortHosts(hosts) {
    console.info('sort hosts');
    return new Promise(resolve => {
        let h = hosts.sort((a, b) => {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });

        resolve(h);
    });
}

function getDiff(hosts) {
    let local = fs.readFileSync(HOSTS, 'utf8').toString().split(/\n/);
    return hosts.diff(local);
}

getRemoteHosts(URL)
    .then(getCustomHosts)
    .then(filterHosts)
    .then(sortHosts)
    .then(getDiff)
    .then(writeHosts)
    .then(console.info)
    .catch(console.error);

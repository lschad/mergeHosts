const os = require('os');
const plat = os.platform();

let hostsFile = '';
if (plat === 'win32') hostsFile = 'c:\\windows\\system32\\drives\\etc\\hosts';
else if (plat === 'darwin') hostsFile = '/private/etc/hosts';
else if (plat === 'linux') hostsFile = '/etc/hosts';
else throw 'platform not supported.';

module.exports = hostsFile;
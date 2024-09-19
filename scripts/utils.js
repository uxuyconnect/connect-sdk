



const { execSync } = require('child_process');
// const { NodeModulesPolyfillPlugin }  = require('@esbuild-plugins/node-modules-polyfill')

const utils = {
    getIPAdress() {
        const interfaces = require('os').networkInterfaces();
        const IPv4Addresses = [];
        Object.entries(interfaces).forEach(([devName, iface]) => {
            const ips = iface
                .filter((alias) => alias.family === 'IPv4')
                .map(({ address }) => address);
            IPv4Addresses.push(...ips);
        });
        return IPv4Addresses;
    }
}

const reloadPlugins = {
    name: 'reload',
    setup(build) {
        build.onEnd((result) => {
            result.errors.length &&
                console.error(`build ended with ${result.errors.length} errors`);
            const typesBuffer = execSync('pnpm run types');
            console.log("rebuild sucesss...");
        });
    },
}


const getPulgins = (env) => {
    if (env === 'dev') {
        return [reloadPlugins]
    }
    return []
    // return [ NodeModulesPolyfillPlugin()]
    
}

module.exports = {
    utils,
    getPulgins
}
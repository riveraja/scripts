print('InnoDB ReplicaSet set up\n');
print('==================================\n');
print('Setting up a MySQL InnoDB ReplicaSet.\n\n');

var dbPass = shell.prompt('Please enter a password for the MySQL root account: ', { type: "password" });
var numNodes = shell.prompt('Please enter number of data nodes: ');
var dbHosts = [];

for (let i = 1; i <= numNodes; i++) {
    var hostName = shell.prompt('Please enter hostname for node' + i + ': ');
    dbHosts.push(hostName);
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

print('\nNumber of Hosts: ' + dbHosts.length + '\n');
print('\nList of hosts:\n');
for (let s = 0; s < dbHosts.length; s++) {
    print('Host: ' + dbHosts[s] + '\n');
}

function setupCluster() {
    print('\nConfiguring the instances.');
    for (let n = 0; n < dbHosts.length; n++) {
        print('\n=> ');
        dba.configureReplicaSetInstance('root'+':'+ dbPass + '@' + dbHosts[n] + ':3306', { clusterAdmin: "'psCluster'@'clusternode%'", clusterAdminPassword: 'psSecret', interactive: false, restart: true });
    }
    print('\nConfiguring Instances completed.\n\n');

    sleep(5000); // source: https://www.sitepoint.com/delay-sleep-pause-wait/

    print('Setting up InnoDB ReplicaSet.\n\n');
    shell.connect({ user: 'root', password: dbPass, host: dbHosts[0], port: 3306 });

    var rs = dba.createReplicaSet("InnoDBReplicaSet");

    print('Adding instances to the replicaset.\n');
    for (let x = 1; x < dbHosts.length; x++) {
        print('\n=> ');
        rs.addInstance('root' + ':' + dbPass + '@' + dbHosts[x] + ':3306', { recoveryMethod: 'clone' });
    }
    print('\nInstances successfully added to the replicaset.\n');
}

try {
    setupCluster();

    print('\nInnoDB ReplicaSet deployed successfully.\n');
} catch (e) {
    print('\nThe InnoDB ReplicaSet could not be created.\n');
    print(e + '\n');
}

print('InnoDB cluster set up\n');
print('==================================\n');
print('Setting up a Percona Server for MySQL - InnoDB cluster.\n\n');

var dbPass = shell.prompt('Please enter the password for the MySQL root account: ', { type: "password" });
var numNodes = shell.prompt('Please enter the number of data nodes: ');
var dbHosts = [];

for (let i = 1; i <= numNodes; i++) {
    var hostName = shell.prompt('Please enter the hostname for node' + i + ': ');
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
        dba.configureInstance('root@' + dbHosts[n] + ':3306', { clusterAdmin: "'pscluster'@'cluster%'", clusterAdminPassword: 'psSecr3t', password: dbPass, interactive: false, restart: true });
    }
    print('\nConfiguring Instances completed.\n\n');

    sleep(5000); // source: https://www.sitepoint.com/delay-sleep-pause-wait/

    print('Setting up InnoDB Cluster.\n\n');
    shell.connect({ user: 'root', password: dbPass, host: dbHosts[0], port: 3306 });

    var cluster = dba.createCluster("InnoDBCluster");

    print('Adding instances to the cluster.\n');
    for (let x = 1; x < dbHosts.length; x++) {
        print('\n=> ');
        cluster.addInstance('root@' + dbHosts[x] + ':3306', { password: dbPass, recoveryMethod: 'clone' });
    }
    print('\nInstances successfully added to the cluster.\n');
}

try {
    setupCluster();

    print('\nInnoDB cluster deployed successfully.\n');
} catch (e) {
    print('\nThe InnoDB cluster could not be created.\n');
    print(e + '\n');
}

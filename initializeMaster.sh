#!/bin/bash

echo "[TASK 1] Stopping MySQL"
systemctl stop mysql

echo "[TASK 2] Removing files in datadir and clearing mysqld.log"
rm -rf /var/lib/mysql/*
cat /dev/null > /var/log/mysqld.log

echo "[TASK 3] Initializing the datadir and starting mysqld"
mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql
systemctl start mysql

echo "[TASK 4] Creating MySQL Replication user"
mysql -uroot -e "CREATE USER 'repl'@'10.%' identified by 'repl'"
mysql -uroot -e "GRANT REPLICATION SLAVE ON *.* TO 'repl'@'10.%'"

BINLOGPOS=$(mysql -uroot -e "SHOW MASTER STATUS\G" | grep 'File\|Position' | awk '{print $2}')
BINLOGPOS=("${BINLOGPOS[@]}")
IPADDR=$(ip -4 address | grep inet | grep -v '127.0.0.1' | awk '{print $2}' | cut -d'/' -f1)

echo "\"CHANGE MASTER TO MASTER_HOST='${IPADDR}',MASTER_USER='repl',MASTER_PASSWORD='repl',MASTER_LOG_FILE='${BINLOGPOS[0]}',MASTER_LOG_POS=${BINLOGPOS[1]};\""
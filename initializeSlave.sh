#!/bin/bash

CHANGEMASTERTEXT=$1

echo "[TASK 1] Stopping MySQL"
systemctl stop mysql

echo "[TASK 2] Removing files in datadir and clearing mysqld.log"
rm -rf /var/lib/mysql/*
cat /dev/null > /var/log/mysqld.log

echo "[TASK 3] Initializing the datadir and starting mysqld"
mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql
systemctl start mysql

echo "[TASK 4] Setting up slave replication"
mysql -uroot -e "$CHANGEMASTERTEXT"

echo "[TASK 5] Start slave and check slave status"
mysql -uroot -e "START SLAVE"
mysql -uroot -e "SHOW SLAVE STATUS\G" | grep _Running
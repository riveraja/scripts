#!/bin/bash

LXCPATH=/data/perc/test
RELVER=6
DISTRO=centos
REPO_URL='https://www.percona.com/redir/downloads/percona-release/redhat/percona-release-0.1-4.noarch.rpm'

set -e

cleanup() {

	if [ $? -eq 1 ]; then

	   echo -e "\e[31m\033[1mRunning cleanup job...\e[92m\e[21m"
	   for vm in $(sudo lxc-ls --running -f -P $LXCPATH | grep mypxc | awk '{print $1}' | grep -v NAME); do
		sudo lxc-stop -n $vm -P $LXCPATH
		sudo lxc-destroy -n $vm -P $LXCPATH
	   done

	fi

}

trap cleanup EXIT

YUM="yum -y -q install"

PKG_LIST="openssh-server wget vim epel-release"

for i in {1..3}; do
	echo -e "\e[31m\033[1mCreating container: mypxc$i...\e[92m\e[21m"
	sudo lxc-create -q -t download -n mypxc$i -P $LXCPATH -- --dist=$DISTRO --release=$RELVER --arch=amd64
	echo -e "\e[31m\033[1mStarting container: mypxc$i...\e[92m\e[21m"
	sudo lxc-start -q -n mypxc$i -P $LXCPATH -d
	echo -e "\e[31m\033[1mInstalling base packages...\e[92m\e[21m"
	sudo chroot $LXCPATH/mypxc$i/rootfs $YUM $PKG_LIST &> /dev/null
	# sleep 5
	# IP_mypxc$i=$(sudo lxc-info -i -H -n mypxc$i -P $LXCPATH)
done

# Install Percona GPG Key, release RPM and PXC 5.6
for i in {1..3}; do
	echo -e "\e[31m\033[1mInstalling additional packages for mypxc$i\e[92m\e[21m"
	sudo chroot $LXCPATH/mypxc$i/rootfs yum -y -q update
	echo -e "\e[31m\033[1mInstalling Percona GPG and Yum repository on mypxc$i\e[92m\e[21m"
	sudo chroot $LXCPATH/mypxc$i/rootfs rpm --import http://www.percona.com/downloads/RPM-GPG-KEY-percona &> /dev/null
	sudo chroot $LXCPATH/mypxc$i/rootfs rpm --quiet -ivh $REPO_URL &> /dev/null
        sudo chroot $LXCPATH/mypxc$i/rootfs $YUM Percona-XtraDB-Cluster-56 &> /dev/null
	sudo chroot $LXCPATH/mypxc$i/rootfs yum clean all &> /dev/null
done

# List all running containers {Container Name, IP address}
echo -e "\e[31m\033[1mList of all running containers\e[92m\e[21m"
sudo lxc-ls -f --running -P $LXCPATH | awk '{print $1,$5}' | egrep -v 'NAME|IPV4'

exit 0

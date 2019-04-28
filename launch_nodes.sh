#!/bin/bash
# shellcheck disable=SC2002
WORKERS=$1

function build {
  lxc --profile=k8s launch images:centos/7 kmaster

  for i in $(seq 1 "$WORKERS")
  do
        echo "Creating container kworker${i}"
        lxc --profile=k8s launch images:centos/7 "kworker${i}"
  done
}

function bootstrap {
  for VM in $(lxc list k -c n | grep -v NAME | awk '{print $2}' | grep -v '^\s*$')
  do
    echo "Bootrapping ${VM}"
    cat bootstrap-kube.sh | lxc exec "$VM" bash
  done
}

build
sleep 10
bootstrap

echo "DONE"
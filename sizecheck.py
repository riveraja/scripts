#!/usr/bin/env python

import sys,os

def getMaxSize(globalvarfile):
    with open(globalvarfile) as v:
        lines = v.read().splitlines()

    var_list = ['key_buffer_size', 'query_cache_size', 'innodb_buffer_pool_size', 'innodb_additional_mem_pool_size', 'innodb_log_buffer_size', 'max_connections', 'query_prealloc_size', 'read_buffer_size', 'read_rnd_buffer_size', 'sort_buffer_size', 'join_buffer_size', 'binlog_cache_size', 'thread_stack', 'tmp_table_size']

    dict_list = {}

    for line in lines[3:-1]:
       per = line.split()
       if per[1] in var_list:
        d = {per[1]: per[3]}
        dict_list.update(d)

    base = 1073741824

    max_mem_size = int(int(dict_list.get('key_buffer_size')) + int(dict_list.get('query_cache_size')) + int(dict_list.get('innodb_buffer_pool_size')) + int(dict_list.get('innodb_additional_mem_pool_size')) + int(dict_list.get('innodb_log_buffer_size')) + int(int(dict_list.get('max_connections'))) * int(int(dict_list.get('query_prealloc_size')) + int(dict_list.get('read_buffer_size')) + int(dict_list.get('read_rnd_buffer_size')) + int(dict_list.get('sort_buffer_size')) + int(dict_list.get('join_buffer_size')) + int(dict_list.get('binlog_cache_size')) + int(dict_list.get('thread_stack')) + int(dict_list.get('tmp_table_size')))) / int(base)

    for k,v in dict_list.iteritems():
        print "\t%s = %s" % (k,v)
    print"\t++++++++++++++++++++++++++++"
    print "\tESTIMATED MEMSIZE = {} GB".format(max_mem_size)

if __name__ == "__main__":
    myarg = str(sys.argv[1])
    getMaxSize(myarg)

#!/usr/bin/env python3
#
# Author: Jericho Rivera
# Title: Percona Support Engineer
#
# Usage: mysqlsh --uri <user>@<host>:<port> --schema <dbname> -f <thisfile>
#

def show_warnings():
  print('\nPrint Show Warnings')
  warnings = session.run_sql("show warnings")
  shell.dump_rows(warnings,'vertical')
  print('\n')

session = shell.get_session()

my_query = shell.prompt("SQL Query: ")

stmt = """EXPLAIN EXTENDED %s""" % my_query
res = session.run_sql(stmt)
print('Query: %s' % stmt)
shell.dump_rows(res,'vertical')

stmt = """EXPLAIN FORMAT=json %s""" % my_query
res = session.run_sql(stmt)
print('Query: %s' % stmt)
shell.dump_rows(res,'vertical')
show_warnings()

session.run_sql("FLUSH STATUS")
session.run_sql("SET optimizer_trace='enabled=on'")
session.run_sql("SET optimizer_trace_max_mem_size=1024*1024*16")
session.run_sql("SET profiling=1")
shell.options["pager"] = "md5sum"
print('Running the query. Please wait.')
session.run_sql(my_query)
shell.options["pager"] = ""

res = session.run_sql("SHOW STATUS LIKE 'Handler%'")
shell.dump_rows(res)

stmt = "SELECT * FROM INFORMATION_SCHEMA.OPTIMIZER_TRACE"
res = session.run_sql(stmt)

session.run_sql("SET optimizer_trace='enabled=off'")

res = session.run_sql("SHOW PROFILES")
shell.dump_rows(res)

prof_num = shell.prompt("\nSelect Query_ID: ")
stmt = """SHOW PROFILE FOR QUERY %s""" % prof_num
res = session.run_sql(stmt)
shell.dump_rows(res)

print('\nDone.')

#!/bin/bash
mysql --defaults-file=/data/project/mrmetadata/.my.cnf -h commonswiki.labsdb < /data/project/mrmetadata/sandbox/license_stats/ccngnu.txt > /data/project/mrmetadata/sandbox/license_stats/ccngnu_results.txt

#!/bin/bash
#mysql --defaults-file=/data/project/mrmetadata/.my.cnf -h commonswiki.labsdb < /data/project/mrmetadata/sandbox/license_stats/ccpd.txt > /data/project/mrmetadata/sandbox/license_stats/ccpd_results.txt
mysql --defaults-file=/data/project/mrmetadata/.my.cnf -h commonswiki.labsdb < /data/project/mrmetadata/sandbox/license_stats/ccgnu.txt > /data/project/mrmetadata/sandbox/license_stats/ccgnu_results.txt
mysql --defaults-file=/data/project/mrmetadata/.my.cnf -h commonswiki.labsdb < /data/project/mrmetadata/sandbox/license_stats/pdgnu.txt > /data/project/mrmetadata/sandbox/license_stats/pdgnu_results.txt

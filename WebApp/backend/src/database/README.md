# Database config and data population script

## Setup

To correctly setup the mysql db and populate required data,

1. Make sure you have the mysql running and have the root user available
2. `mysql -u root < vendimandb.sql`
3. `node parseMLData.js`
   1. `salesScript.py` and `requirements.txt` are deprecated

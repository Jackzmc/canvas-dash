# canvas-sync-server
A small sync server to store any sort of object, and be used to sync between accounts.

//POST PREFIX/:token Push sync
//POST PREFIX/ Push sync to new token
//GET  PREFIX/:token with token: Get sync

See .env.sample for environment variables

Sync tokens can be automatically deleted by adding this event: The > 2, will expire any sync data over 2 days old.


```sql
CREATE EVENT IF NOT EXISTS expireSync ON SCHEDULE EVERY 12 HOUR DO DELETE FROM sync WHERE TIMESTAMPDIFF(DAY, created, NOW()) > 2
```